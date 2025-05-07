---
layout: post
title: 'Build a Database Pt. 3: Write Ahead Log(WAL)'
description:
  'Guide to building a Write Ahead Log(WAL) for a LSM-Tree database. We look at
  how RocksDB designed their WAL and build our own for our database engine.'
canonical: https://adambcomer.com/blog/simple-database/wal/
author: 'Adam Comer'
updateDate: 2022-04-04T19:21:04+0000
createDate: 2020-06-19T04:55:44+0000
image: 'images/blog/simple-database-write-ahead-log-cover.jpg'
imageAlt: 'Pile of wood logs'
---

Last article,
[we created our MemTable for in-memory record storage](/blog/simple-database/memtable/).
To recover our data after the database restarts, we need our first layer of
on-disk persistence, the WAL. Looking at RocksDB, we will discuss the design and
structure of its WAL. After analyzing the standard, we will design a
specification for our WAL. Furthermore, we will debate the tradeoffs of Buffered
vs Unbuffered I/O in the context of data integrity and disk speed. Lastly, we
will build our variant of the WAL in Rust.

## What Is a Write Ahead Log(WAL)?

When a record is written to our database, it is stored in two palaces: the
MemTable and the WAL. The WAL acts as an on-disk backup for the MemTable by
keeping a running record of all of the database operations. In the event of a
restart, the MemTable can be fully recovered by replaying the operations in the
WAL. When a MemTable reaches capacity and is transformed into a SSTable, the WAL
is wiped from the disk to make room for a new WAL.

As mentioned in [part two](/blog/simple-database/memtable/), the key insight of
a LSM-Tree database is that sequential I/O is faster than random I/O, and
databases should match this reality. The WAL uses exclusively sequential I/O to
store data on disk; but, there are drawbacks to not using random I/O. The WAL
pays for its improved write speed with lost disk space. Every time a record is
updated, old versions of the record are kept, eating away at disk space. This is
known as
[Space Amplification](http://smalldatum.blogspot.com/2015/11/read-write-space-amplification-pick-2_23.html)
in database design theory. Space Amplification is a multiple of how much storage
space is used for a given dataset size. For example, a 1GB dataset with a 2X
Space Amplification factor would result in 2GB of disk usage. Although not
important for our project, it is something that database designers are cognizant
of and optimize for.

## Buffered vs Unbuffered I/O

A hot topic for debate in database design is Buffered vs Unbuffered I/O. Today,
applications are demanding more from databases while the underlying disks aren’t
keeping pace. To make disks appear faster, the OS maps sections of disk to
memory. Changes to the disk happen only in memory, and periodically, the OS
writes the changes to the physical disk. This is known as Buffered I/O — which
writes data to a buffer that is eventually flushed to disk. Buffered I/O can be
avoided by using Unbuffered I/O — which writes data directly to the physical
disk.

[According to Google’s LevelDB, RocksDB’s predecessor, Buffered I/O can be “thousand times as fast as synchronous writes.”](https://github.com/google/leveldb/blob/master/doc/index.md#synchronous-writes)
Although there is a clear performance benefit, if the OS or the physical server
crash, all of the buffered writes are lost. This may be an acceptable risk if
there is a replication strategy of the underlying data or the data can be
regenerated easily.

## RocksDB WAL

The
[RocksDB variant of the WAL](https://github.com/facebook/rocksdb/wiki/Write-Ahead-Log)
doesn’t deviate far from the description of the WAL. It is a stream of database
operations stored on disk, no extra data structures. RocksDB opts to store
records from the WAL in a block format. Each block is 32KB and contains at most
one record. Records that are larger than a block are broken into multiple block
size chunks. At the start of each block is a checksum of the block’s contents to
verify its integrity. The full block format,
[copied from the github repository](https://github.com/facebook/rocksdb/wiki/Write-Ahead-Log-File-Format#record-format),
is below:

```plaintext
+----------+-----------+-----------+----------------+--- ... ---+
| CRC (4B) | Size (2B) | Type (1B) | Log number (4B)| Payload   |
+----------+-----------+-----------+----------------+--- ... ---+
CRC = 32bit hash computed over the payload using CRC
Size = Length of the payload data
Type = Type of record
       (kZeroType, kFullType, kFirstType, kLastType, kMiddleType )
       The type is used to group a bunch of records together to represent
       blocks that are larger than kBlockSize
Payload = Byte stream as long as specified by the payload size
Log number = 32bit log file number, so that we can distinguish between
records written by the most recent log writer vs a previous one.
```

Immediately when I saw that RocksDB was using a block model, I was surprised
because small records would leave many padding bytes, wasting disk space. The
designers of RocksDB know this and
[left a comment about it in the drawbacks section](https://github.com/facebook/rocksdb/wiki/Write-Ahead-Log-File-Format#downsides);
but, they use it with good reason. Tools like MapReduce can take advantage of
this block design and use it to split files into parts for batch processing
jobs. Although I will never use this, there are probably some processing jobs at
Facebook that need to process the archived WALs from RocksDB.

When it comes to Buffered I/O,
[RocksDB uses the OS write buffer and gives the user the option to force the OS to sync it to disk](https://rocksdb.org/blog/2017/08/25/flushwal.html).
This follows the LevelDB design, guaranteeing the data can be recovered if the
process crashes.

## Our WAL

For our database, the WAL will directly follow the description and won’t include
block models or checksums, like in RocksDB. Each of the entries will be stored
back-to-back with only the necessary metadata to recover the keys and values of
the records. This will reduce the amount of lost disk space and programming
overhead. For our WAL, each entry will follow this format:

```plaintext
+---------------+---------------+-----------------+-...-+--...--+-----------------+
| Key Size (8B) | Tombstone(1B) | Value Size (8B) | Key | Value | Timestamp (16B) |
+---------------+---------------+-----------------+-...-+--...--+-----------------+
Key Size = Length of the Key data
Tombstone = If this record was deleted and has a value
Value Size = Length of the Value data
Key = Key data
Value = Value data
Timestamp = Timestamp of the operation in microseconds
```

Like RocksDB, and LevelDB before it, we will use the Buffered I/O model, and
flush the data to the OS after each write. When deciding to use Buffered or
Unbuffered I/O, I believe we can trust Google and Facebook to inform us that
Buffered I/O is an acceptable risk.

## Building Our WAL

The code for the WAL will exist in two parts, the `WAL` itself and the
`WALIterator`. At a high level, the `WAL` is the struct that our database will
interface with. The `WALIterator` is a consumable iterator that reads all of the
entries of a WAL file. We will build the `WALIterator` first because the `WAL`
uses the `WALIterator` in its recovery method.

### WALEntry Struct

First, we need to define the structure of our WAL entries. This will mirror the
[MemTableEntry in the prior article](/blog/simple-database/memtable/).

```rust
pub struct WALEntry {
 pub key: Vec<u8>,
 pub value: Option<Vec<u8>>,
 pub timestamp: u128,
 pub deleted: bool,
}
```

### WALIterator Struct

Next, we have our WAL iterator. Its job is to start at the beginning of a WAL
file and iterate over each entry. This will aid in the reconstruction process of
the MemTable when our database restarts.

```rust
/// WAL iterator to iterate over the items in a WAL file.
pub struct WALIterator {
 reader: BufReader<File>,
}
```

Although there is a lot of overhead of reading and deserializing, we push most
of this complexity onto the standard library’s `BufReader`. It reads the data
from our WAL file letting our iterator focus on deserializing the entries.
Additionally, it
[reduces the amount of disk operations by reading files in 8KB](https://doc.rust-lang.org/std/io/struct.BufWriter.html)
chunks for maximum read efficiency.

Note, the `BufReader` is a Rust abstraction and is not the same as the OS’s
Buffered I/O. This is an important distinction because an application can use an
Unbuffered I/O solution in the code but the OS will still buffer the writes, if
not properly configured. By using both OS buffering and Rust buffering, the two
layers of buffering maximize the read performance of our WAL.

### WALIterator Methods

In order to be classified as an iterator, the `WALIterator` needs to implement
the `Iterator` trait in addition to its own methods.

#### Create a New WALIterator

Starting with the `WALIterator`’s custom method, we need a basic constructor
method. It will open a file in read-only mode for the `BufReader`.

```rust
/// Creates a new WALIterator from a path to a WAL file.
pub fn new(path: PathBuf) -> io::Result<WALIterator> {
  let file = OpenOptions::new().read(true).open(path)?;
  let reader = BufReader::new(file);
  Ok(WALIterator { reader })
}
```

#### Read Entries From the WAL One-By-One

To implement the `Iterator` trait, a `Item` type and `rust›next()` method need
to be defined. The Item type of the iterator will be the WALEntry that was
defined before. The `rust›next()` method will deserialize the next entry from a
WAL file with the format from our specification.

```rust
impl Iterator for WALIterator {
  type Item = WALEntry;

  /// Gets the next entry in the WAL file.
  fn next(&mut self) -> Option<WALEntry> {
    let mut len_buffer = [0; 8];
    if self.reader.read_exact(&mut len_buffer).is_err() {
      return None;
    }
    let key_len = usize::from_le_bytes(len_buffer);

    let mut bool_buffer = [0; 1];
    if self.reader.read_exact(&mut bool_buffer).is_err() {
      return None;
    }
    let deleted = bool_buffer[0] != 0;

    let mut key = vec![0; key_len];
    let mut value = None;
    if deleted {
      if self.reader.read_exact(&mut key).is_err() {
        return None;
      }
    } else {
      if self.reader.read_exact(&mut len_buffer).is_err() {
        return None;
      }
      let value_len = usize::from_le_bytes(len_buffer);
      if self.reader.read_exact(&mut key).is_err() {
        return None;
      }
      let mut value_buf = vec![0; value_len];
      if self.reader.read_exact(&mut value_buf).is_err() {
        return None;
      }
      value = Some(value_buf);
    }

    let mut timestamp_buffer = [0; 16];
    if self.reader.read_exact(&mut timestamp_buffer).is_err() {
      return None;
    }
    let timestamp = u128::from_le_bytes(timestamp_buffer);

    Some(WALEntry {
      key,
      value,
      timestamp,
      deleted,
    })
  }
}
```

Deserializing entries can be tedious, so it’s best to package the process into a
general purpose iterator. Now, reading WAL files is as simple as instantiating a
new `WALIterator`. If a full entry can’t be read because it is corrupted or
partially written, the iterator will stop. In a production database, there would
be an error correction process to clean up the WAL and notify the user. We won’t
worry about this because it would drastically increase the complexity of the
iterator at the expense of our understanding. Things like error correction
deserve a blog post all to themselves.

This method completes the `WALIterator`. The full version can be found
[here](https://github.com/adambcomer/database-engine/blob/master/src/wal_iterator.rs)
if any additional clarity is needed.

### WAL Struct

Now to the main event, actually building the `WAL` for our database. Like the
`WALIterator`, we will use a buffered I/O design but as a writer, not a reader.
This writer will exclusively append records to the file.

```rust
/// Write Ahead Log(WAL)
///
/// An append-only file that holds the operations performed on the MemTable.
/// The WAL is intended for recovery of the MemTable when the server is shutdown.
pub struct WAL {
 path: PathBuf,
 file: BufWriter<File>,
}
```

### WAL Methods

#### Create a New WAL

Like always, a constructor is necessary to instantiate a new `WAL`. Given a
directory, a new WAL file is created with the current time in microseconds. In
the case of multiple WAL files in the same directory, the timestamps allow the
recovery process to apply the operations in order.

```rust
/// Creates a new WAL in a given directory.
pub fn new(dir: &Path) -> io::Result<WAL> {
  let timestamp = SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .unwrap()
    .as_micros();

  let path = Path::new(dir).join(timestamp.to_string() + ".wal");
  let file = OpenOptions::new().append(true).create(true).open(&path)?;
  let file = BufWriter::new(file);

  Ok(WAL { path, file })
}
```

#### Load an Existing WAL From a File Path

If a WAL file already exists, we want to instantiate it from the file’s path.

```rust
/// Creates a WAL from an existing file path.
pub fn from_path(path: &Path) -> io::Result<WAL> {
  let file = OpenOptions::new().append(true).create(true).open(path)?;
  let file = BufWriter::new(file);

  Ok(WAL {
    path: path.to_owned(),
    file,
  })
}
```

#### Record a Set Operation in the WAL

When a new Key-Value pair is written to the database, it is first written to the
`MemTable` and `WAL`. Our set method takes in the record, serializes the data,
and appends it to the `WAL`. This function uses the layout defined in the design
above.

```rust
/// Sets a Key-Value pair and the operation is appended to the WAL.
pub fn set(&mut self, key: &[u8], value: &[u8], timestamp: u128) -> io::Result<()> {
  self.file.write_all(&key.len().to_le_bytes())?;
  self.file.write_all(&(false as u8).to_le_bytes())?;
  self.file.write_all(&value.len().to_le_bytes())?;
  self.file.write_all(key)?;
  self.file.write_all(value)?;
  self.file.write_all(&timestamp.to_le_bytes())?;

  Ok(())
}
```

Here we can see the value of the `BufWriter`. The metadata, such as the
tombstones and key-value lengths, is only a few bytes and warrants batching
write operations.

#### Record a Delete Operation in the WAL

Adding a delete operation is similar to the set method, just without the value.

```rust
/// Deletes a Key-Value pair and the operation is appended to the WAL.
///
/// This is achieved using tombstones.
pub fn delete(&mut self, key: &[u8], timestamp: u128) -> io::Result<()> {
  self.file.write_all(&key.len().to_le_bytes())?;
  self.file.write_all(&(true as u8).to_le_bytes())?;
  self.file.write_all(key)?;
  self.file.write_all(&timestamp.to_le_bytes())?;

  Ok(())
}
```

#### Write the Buffered Changes to Disk

After we set or delete a record, the contents of the operation haven’t been
passed to the OS to write to disk. The flush method takes the modified buffer in
the `BufWriter` and stores it. Although we could call this method at the end of
set and delete, separating these concerns gives the database the ability to bulk
insert records without flushing to disk after each operation.

```rust
/// Flushes the WAL to disk.
///
/// This is useful for applying bulk operations and flushing the final result to
/// disk. Waiting to flush after the bulk operations have been performed will improve
/// write performance substantially.
pub fn flush(&mut self) -> io::Result<()> {
  self.file.flush()
}
```

Luckily, the `BufWriter` knows this is a common design pattern and has a
built-in flush method.

#### Load and Merge the WALs in a Directory

In most of my coding projects, I include a
[utilities file for all miscellaneous functions](https://github.com/adambcomer/database-engine/blob/master/src/utils.rs)
that are used repeatedly throughout the application. One common task our
database does is searching for files with an extension. Given a folder, this
function will do just that.

```rust
/// Gets the set of files with an extension for a given directory.
pub fn files_with_ext(dir: &Path, ext: &str) -> Vec<PathBuf> {
  let mut files = Vec::new();
  for file in read_dir(dir).unwrap() {
    let path = file.unwrap().path();
    if path.extension().unwrap() == ext {
      files.push(path);
    }
  }

  files
}
```

To restore our `MemTable` and `WAL`, we need to load the operations from the
WALs in a directory and replay them to a new `MemTable` and `WAL`. Using our
helper function from above and our `WALIterator`, we will find the WAL files and
replay their operations. Lastly, when the replay is finished, we flush the
contents to disk and delete the old WALs.

```rust
/// Loads the WAL(s) within a directory, returning a new WAL and the recovered MemTable.
///
/// If multiple WALs exist in a directory, they are merged by file date.
pub fn load_from_dir(dir: &Path) -> io::Result<(WAL, MemTable)> {
  let mut wal_files = files_with_ext(dir, "wal");
  wal_files.sort();

  let mut new_mem_table = MemTable::new();
  let mut new_wal = WAL::new(dir)?;
  for wal_file in wal_files.iter() {
    if let Ok(wal) = WAL::from_path(wal_file) {
      for entry in wal.into_iter() {
        if entry.deleted {
          new_mem_table.delete(entry.key.as_slice(), entry.timestamp);
          new_wal.delete(entry.key.as_slice(), entry.timestamp)?;
        } else {
          new_mem_table.set(
            entry.key.as_slice(),
            entry.value.as_ref().unwrap().as_slice(),
            entry.timestamp,
          );
          new_wal.set(
            entry.key.as_slice(),
            entry.value.unwrap().as_slice(),
            entry.timestamp,
          )?;
        }
      }
    }
  }
  new_wal.flush().unwrap();
  wal_files.into_iter().for_each(|f| remove_file(f).unwrap());

  Ok((new_wal, new_mem_table))
}
```

Simply, this function iterates over every WAL file and entry, reconstructing the
original `MemTable`.

## Conclusion

Now that we have completed the WAL, our database has its first level of
persistence down. Comparing the designs of the RocksDB WAL and our WAL, we see
that they are not very different. RocksDB, being a professional database, uses
data integrity features like checksums and a block model for its disk layout.
But, the main principle of a running log of operations is maintained between the
two variants. When writing data to disk, we ran into the problem that the OS
doesn’t immediately propagate those writes. Therein lies a tradeoff of speed and
data integrity. Buffered I/O chooses speed over data integrity. Although there
are risks, many production databases use this method because the probability of
a machine crashing is low compared to the process crashing; and with a
sufficient replication strategy — these problems vanish.
[The complete WAL component can be found in this repository along with unit tests](https://github.com/adambcomer/database-engine/blob/master/src/wal.rs).
Next, we will implement the SSTable component of our database so our database
can hold more than a single MemTables worth of data.

## Index

- [Build a Database Pt. 1: Motivation & Design](/blog/simple-database/motivation-design/)
- [Build a Database Pt. 2: MemTable](/blog/simple-database/memtable/)
- Build a Database Pt. 3: Write Ahead Log(WAL)
