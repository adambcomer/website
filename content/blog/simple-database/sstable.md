---
layout: post
title: 'Build a Database Pt. 4: SSTable'
description:
  'Guide to building a Sorted String Table(SSTable) for a LSM-Tree database. We
  look at how RocksDB designs their SSTable format and build our own for our
  database engine.'
canonical: https://adambcomer.com/blog/simple-database/sstable/
author: 'Adam Comer'
updateDate: 2026-04-18T00:00:00Z
createDate: 2026-04-18T00:00:00Z
image: 'images/blog/simple-database-sstable-cover.jpg'
imageAlt: 'Rows of sorted books in a library'
---

Last article,
[we created our Write Ahead Log(WAL) for MemTable persistence and recovery](/blog/simple-database/wal/).
Now that the MemTable has a backup, we need a way to move data off of it and
onto disk permanently. When the MemTable reaches its capacity, it is flushed to
disk as a Sorted String Table, or SSTable. We will look at how RocksDB designs
their on-disk table format, analyze the tradeoffs of different approaches, and
build our own SSTable in Rust.

## What Is an SSTable?

A Sorted String Table(SSTable) is an immutable, on-disk file that holds a sorted
run of key-value records. When the MemTable reaches its maximum capacity all of
its entries are written sequentially to a new SSTable file and the MemTable is
cleared. Because the MemTable keeps its records sorted by key at all times, the
resulting SSTable inherits that order, giving us a sorted run on disk.

SSTables are organized into **Levels** with exponentially growing max
capacities. Level 0 holds freshly flushed SSTables. When Level 0 fills up, a
Compaction is triggered that merges those files into Level 1, which has a larger
capacity. This cascades upward: Level 1 flushes into Level 2, Level 2 into Level
3, and so on. During Compaction, the keys from overlapping SSTables are merged
and re-sorted, and any records overwritten by newer entries are discarded. This
keeps disk usage manageable and ensures that reads always find the most current
version of a record.

The sorted order of an SSTable is the key to making reads fast. For a lookup, we
can use [Binary Search](https://en.wikipedia.org/wiki/Binary_search_algorithm)
over the sorted keys rather than scanning every record. The challenge with an
on-disk file, however, is that we cannot directly index into the middle of the
file the way we would with an in-memory array. The SSTable needs to carry enough
metadata to jump directly to any record's position in the file without reading
everything before it.

## RocksDB SSTable

RocksDB stores its SSTables in a
[Block-Based Table format](https://github.com/facebook/rocksdb/wiki/Rocksdb-BlockBasedTable-Format/eec7dca51da8cbdcc1b915661550093f1024e0a6).
Rather than storing records back-to-back in a flat file, RocksDB groups records
into fixed-size **Data Blocks**, typically 4KB each. Within each block, keys are
stored in sorted order and can be compressed using algorithms like Snappy or
Zstd. Compression is one of the main motivations for the block model: individual
key-value pairs compress poorly, but a block of similar-looking records
compresses very well.

On top of the Data Blocks, RocksDB appends several additional sections to the
file:

- **Index Block**: Stores the last key in each Data Block along with the block's
  byte offset. This allows a lookup to binary-search the index to find the right
  Data Block, then binary-search within that block to find the record.
- **Filter Block**: A [Bloom filter](https://en.wikipedia.org/wiki/Bloom_filter)
  for each Data Block. Before performing a binary search, RocksDB queries the
  Bloom filter to determine if a key _could_ exist in the SSTable. If the filter
  says no, the lookup exits immediately without any disk I/O, dramatically
  reducing read amplification across many SSTable files.
- **Footer**: A fixed-size section at the end of the file containing byte
  offsets for the Index Block and Filter Block, so that loading a file requires
  only a single seek to the end.

This layered design reflects the engineering demands of a production database.
The Index Block enables fast lookups without reading all records into memory,
The Bloom Filter Block eliminates many full binary searches that return nothing,
and block-level compression lets RocksDB store far more data on disk than an
uncompressed format would allow.

## Our SSTable

Our SSTable skips the block model and compression and instead stores records in
a simple flat layout. Each record is written back-to-back with only the metadata
needed to read it back. To recover the ability to binary search on disk, we keep
an in-memory `offsets` vector that maps each record index to its byte offset in
the file. This trades a bit of memory for a much simpler implementation.

Our on-disk format for each entry is:

```plaintext
+---------------+-----+-----------+-----------------+-------+-----------------+
| Key Size (8B) | Key | Tombstone | Value Size (8B) | Value | Timestamp (16B) |
+---------------+-----+-----------+-----------------+-------+-----------------+
Key Size   = Length of the Key in bytes
Key        = Key data
Tombstone  = 1 if this record is deleted, 0 otherwise
Value Size = Length of the Value in bytes (absent if Tombstone is set)
Value      = Value data (absent if Tombstone is set)
Timestamp  = Write timestamp in microseconds (16 bytes)
```

Tombstoned entries omit the Value Size and Value fields entirely, saving disk
space for deleted records.

### Building Our SSTable

The code for the SSTable lives in two structs: `SSTableEntry` and `SSTable`. The
`SSTableEntry` is the deserialized representation of a single record read off
disk. The `SSTable` wraps the file handle and the in-memory index used for
binary searches.

### SSTableEntry Struct

```rust
/// SSTableEntry is a single entry returned from an SSTable lookup.
///
/// A `None` value indicates the key was deleted (tombstone).
pub struct SSTableEntry {
    key: Vec<u8>,
    value: Option<Vec<u8>>,
    timestamp: u128,
}
```

The `SSTableEntry` mirrors the `MemTableEntry` from
[part two](/blog/simple-database/memtable/), with the difference that we do not
store a `deleted` boolean. Because we only return an `SSTableEntry` when we
successfully locate a record, a Tombstone is represented by `value` being
`None`. The caller can inspect `value` to determine whether the record was
deleted.

### SSTable Struct

````rust
/// SSTable is an immutable, sorted on-disk table flushed from a MemTable.
///
/// Each SSTable file stores entries in sorted key order using the binary format:
///
/// ```text
/// [ key_len: usize ][ key: [u8] ][ deleted: u8 ][ val_len: usize ][ value: [u8] ][ timestamp: u128 ]
/// ```
///
/// `val_len` and `value` are omitted for deleted (tombstone) entries.
///
/// An in-memory offset index enables O(log n) binary search without scanning the file.
pub struct SSTable {
    file: BufReader<File>,
    path: PathBuf,
    offsets: Vec<u64>,
    low_key: Vec<u8>,
    high_key: Vec<u8>,
}
````

The two fields worth highlighting are `offsets` and `low_key`/`high_key`.

The `offsets` vector is the SSTable's in-memory index. Each element is the byte
offset of the corresponding record in the file, in the same sorted order as the
keys. When we binary-search for a key, we binary-search this vector to find the
right offset, then seek the file to that position and read the record. Without
this index, a lookup would require reading every record from the beginning of
the file.

The `low_key` and `high_key` store the smallest and largest keys in the file.
Before committing to a binary search, the caller can call `key_in_range` to
quickly determine if a key could possibly exist in this SSTable, avoiding
unnecessary disk seeks.

### SSTable Methods

#### Create a New SSTable From a MemTable

When the MemTable reaches capacity, the database flushes it to disk by calling
`SSTable::new`. This method serializes every entry in the MemTable to a file and
simultaneously builds the `offsets` index.

```rust
/// Flushes `memtable` to a new SSTable file under `dir/<level>/<timestamp>.sstable`.
///
/// Entries are written in the sorted order of the MemTable. The offset of each
/// entry is recorded so that [`get`](SSTable::get) can binary search without a
/// full file scan.
pub fn new(memtable: &MemTable, level: usize, dir: &Path) -> io::Result<SSTable> {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_micros();

    let path = Path::new(dir).join(format!("{}/{}.sstable", level, timestamp.to_string()));

    create_dir_all(path.parent().unwrap())?;

    let file = OpenOptions::new().append(true).create(true).open(&path)?;
    let mut file = BufWriter::new(file);

    let mut offsets = Vec::new();
    let mut offset = 0;
    for entry in memtable.entries() {
        offsets.push(offset as u64);

        file.write_all(&entry.key.len().to_le_bytes())?;
        file.write_all(&entry.key)?;

        file.write_all(&(entry.deleted as u8).to_le_bytes())?;

        if !entry.deleted {
            let value = entry.value.as_ref().unwrap();
            file.write_all(&value.len().to_le_bytes())?;
            file.write_all(value)?;
        }

        file.write_all(&entry.timestamp.to_le_bytes())?;

        offset += size_of::<usize>()
            + size_of::<u8>()
            + size_of::<u128>()
            + entry.key.len()
            + if !entry.deleted {
                size_of::<usize>() + entry.value.as_ref().unwrap().len()
            } else {
                0
            }
    }

    file.flush()?;

    let file = OpenOptions::new().read(true).open(&path)?;
    let file = BufReader::new(file);

    Ok(SSTable {
        file,
        path,
        offsets,
        low_key: memtable.entries().first().unwrap().key.clone(),
        high_key: memtable.entries().last().unwrap().key.clone(),
    })
}
```

The file is placed in a subdirectory named after the level, e.g.,
`data/0/1234567890.sstable`. Using the current timestamp as the filename
guarantees uniqueness and gives us a natural ordering for files at the same
level. A `BufWriter` is used for writing because the metadata fields (key
length, tombstone, value length) are only a few bytes each. Batching these small
writes with a `BufWriter` reduces the number of system calls to the OS.

After all entries are flushed, the `BufWriter` is closed and the file is
re-opened as a `BufReader` for subsequent reads. The `low_key` and `high_key`
are taken directly from the first and last entries of the MemTable, which are
already guaranteed to be sorted.

#### Load an Existing SSTable From Disk

After a database restart, the SSTable files on disk need to be reloaded into
memory. The `load_from_path` method reconstructs the `offsets` index by scanning
the file from start to finish, just as `new` built it during the flush.

```rust
/// Reconstructs an `SSTable` from an existing file on disk.
///
/// Scans the file once to rebuild the offset index and read the low/high keys,
/// then seeks back to the beginning so the table is ready for lookups.
pub fn load_from_path(path: &Path) -> io::Result<SSTable> {
    let file = OpenOptions::new().read(true).open(&path)?;
    let mut file = BufReader::new(file);

    let mut offsets = Vec::new();
    let mut offset = 0;
    while file.fill_buf()?.len() > 0 {
        offsets.push(offset as u64);

        let mut buf = [0u8; size_of::<usize>()];
        file.read_exact(&mut buf)?;

        let key_len = usize::from_le_bytes(buf);
        file.seek_relative(key_len as i64)?;

        let mut buf = [0u8; size_of::<u8>()];
        file.read_exact(&mut buf)?;
        let deleted = buf[0] == 1;

        let mut val_len = 0;
        if !deleted {
            let mut buf = [0u8; size_of::<usize>()];
            file.read_exact(&mut buf)?;

            val_len = usize::from_le_bytes(buf);
            file.seek_relative(val_len as i64)?;
        }

        file.seek_relative(size_of::<u128>() as i64)?;

        offset += size_of::<usize>()
            + size_of::<u8>()
            + size_of::<u128>()
            + key_len
            + if !deleted {
                size_of::<usize>() + val_len
            } else {
                0
            }
    }
    // ...
}
```

The method uses `seek_relative` to skip over the key and value bytes rather than
reading them into a buffer. This is faster because the OS only needs to advance
a file cursor, not copy data into memory. Once all offsets are collected, the
method reads the first entry for `low_key` and seeks to the last offset for
`high_key`.

This reconstruction cost is a direct consequence of our simple flat format.
RocksDB avoids it by embedding the index inside the file itself. For our
purposes, the startup scan is acceptable since SSTables are immutable, so this
work is done once per file per database start.

#### Check if a Key Falls Within the SSTable's Range

Before performing an expensive binary search, the caller can use `key_in_range`
to quickly eliminate SSTables whose key range doesn't include the target key.

```rust
/// Returns `true` if `key` falls within `[low_key, high_key]` (inclusive).
///
/// Use this as a cheap pre-filter before calling [`get`](SSTable::get).
pub fn key_in_range(&self, key: &[u8]) -> bool {
    key >= &self.low_key && key <= &self.high_key
}
```

This is a simple byte-slice comparison against `low_key` and `high_key`. Since
Rust compares byte slices lexicographically, this works correctly for our
byte-encoded keys. In a multi-level database with many SSTable files, this
short-circuit is critical for read performance. A lookup that touches ten
SSTable files would need to do ten binary searches without this check. With it,
most files are eliminated before reading a single entry.

#### Look Up a Record by Key

The `get` method is where the `offsets` vector earns its place. It runs a binary
search over the offsets, seeking the file to each midpoint and comparing the key
on disk to the target key.

```rust
/// Searches for `key` using binary search over the offset index.
///
/// Returns:
/// - `Ok(Some(entry))` if the key is found. For deleted keys, `entry.value` is `None`.
/// - `Ok(None)` if the key is not present in this table.
/// - `Err(_)` on I/O failure.
pub fn get(&mut self, key: &[u8]) -> io::Result<Option<SSTableEntry>> {
    let mut a = 0;
    let mut b = self.offsets.len() - 1;
    while a <= b {
        let m = ((b - a) / 2) + a;
        let offset = self.offsets[m];

        self.file.seek(SeekFrom::Start(offset))?;

        let mut buf = [0u8; size_of::<usize>()];
        self.file.read_exact(&mut buf)?;

        let key_len = usize::from_le_bytes(buf);
        let mut table_key = vec![0u8; key_len];
        self.file.read_exact(&mut table_key)?;

        if key == &table_key {
            let mut buf = [0u8; size_of::<u8>()];
            self.file.read_exact(&mut buf)?;

            let deleted = buf[0] == 1;

            let mut val = None;
            if !deleted {
                let mut buf = [0u8; size_of::<usize>()];
                self.file.read_exact(&mut buf)?;

                let val_len = usize::from_le_bytes(buf);
                let mut table_value = vec![0u8; val_len];
                self.file.read_exact(&mut table_value)?;

                val = Some(table_value)
            }

            let mut buf = [0u8; size_of::<u128>()];
            self.file.read_exact(&mut buf)?;

            let timestamp = u128::from_le_bytes(buf);

            return Ok(Some(SSTableEntry {
                key: table_key,
                value: val,
                timestamp,
            }));
        } else if key > &table_key {
            if m == usize::MAX {
                return Ok(None);
            }
            a = m + 1;
        } else {
            if m == usize::MIN {
                return Ok(None);
            }
            b = m - 1;
        }
    }

    Ok(None)
}
```

Each iteration of the loop does one seek and reads only the key at the midpoint,
not the full record. Only when the key matches do we read the tombstone, value,
and timestamp. This matters because keys are much smaller than values on
average, so we avoid reading large values during the search.

The binary search does `O(Log N)` disk seeks in the worst case. Compared to a
linear scan, this can mean reading a handful of disk positions instead of
thousands. The cost of maintaining the `offsets` vector in memory is small (8
bytes per entry), so a SSTable with 10,000 records requires only 80KB of memory
for the index. This is a reasonable tradeoff for a simple database. Feel free to
experiment with other data-structures and layouts that optimize for different
use cases.

Note the overflow checks around `m == usize::MAX` and `m == usize::MIN`. Because
we are working with unsigned indices, decrementing or incrementing past the
bounds would wrap around instead of returning a sensible error. These guards
prevent undefined behavior in the edge case where the key is smaller than the
first entry or larger than the last.

## Conclusion

The SSTable is the primary on-disk storage unit of our LSM-Tree database.
Building it required two key decisions: a flat sequential file format for
simplicity and an in-memory offsets vector to enable binary search on disk.
Compared to RocksDB's Block-Based Table format with its Index Blocks, Filter
Blocks, and compression, our SSTable trades raw performance for ease of
understanding. But the core principle — a sorted, immutable, binary-searchable
file — is the same in both designs.
[The complete SSTable component can be found in this repository along with unit tests](https://github.com/adambcomer/database-engine/blob/master/src/sstable.rs).
Next, we will build the SSTable Manager that implements the Compaction process
to merge SSTables across levels and reclaim space from deleted and overwritten
records.

## Index

- [Build a Database Pt. 1: Motivation & Design](/blog/simple-database/motivation-design/)
- [Build a Database Pt. 2: MemTable](/blog/simple-database/memtable/)
- [Build a Database Pt. 3: Write Ahead Log(WAL)](/blog/simple-database/wal/)
- Build a Database Pt. 4: SSTable
