---
layout: post
title: 'Build a Database Pt. 2: MemTable'
description:
  'Build the first component of an LSM-Tree database, the MemTable. We look at
  how RocksDB designed their MemTable and build our own for our database engine.'
canonical: https://adambcomer.com/blog/simple-database/memtable/
author: 'Adam Comer'
updateDate: 2025-12-07T08:43:12Z
createDate: 2020-06-12T00:18:28Z
image: 'images/blog/simple-database-memtable-cover.jpg'
imageAlt: 'Empty glass elevator shaft'
---

Now that we have finished
[outlining our motivations and designs of our database](/blog/simple-database/motivation-design/),
we will start by building our first component, the MemTable. The MemTable is the
first layer in our database and where records are immediately stored. We will
discuss the design choices RocksDB made for their database and what benefits
came with those choices. Additionally, we will look at the benefits and
drawbacks of our MemTable. Finally, we will implement our MemTable in Rust.

## What Is the Memtable?

The MemTable (aka. Memory Table) is the in-memory cache of the latest set of
record writes applied to the database. Simply, it is a container, whether that
be a [Vector](https://en.wikipedia.org/wiki/Dynamic_array),
[Linked-List](https://en.wikipedia.org/wiki/Linked_list), or any other
container, that holds the written records sorted, in total order, by key. By
sorting the records, lookups and scans in the MemTable can be done efficiently
using a data structure that supports a `O(Log N)` access pattern.

At their core, LSM-Tree databases take a random I/O problem in a B-Tree model
and turn it into a sequential I/O problem, which is much faster. This is
achieved by batching the writes for updated records. The MemTable does this
working in coordination with two methods: the Write Ahead Log(WAL) and the
Sorted String Table(SSTable). First, the WAL holds a replica of the MemTable so
we can be assured that our data is intact in the event of a restart. Instead of
storing the MemTable byte-for-byte, the WAL stores a running log of the
operations applied to the database, hence its name. By replaying the operations
stored in the WAL, the MemTable can be recovered. Second, the SSTables are
created to store MemTables once they have reached capacity. Again, this writes
all of the records to disk in one go, eliminating the need for random disk
writes.

## RocksDB MemTable

Looking at RocksDB, the database our database is based on,
[their MemTable](https://github.com/facebook/rocksdb/wiki/MemTable/0fcb6453a2cdeab9211113ff66f911bdf126b69b)
uses a [SkipList](https://en.wikipedia.org/wiki/Skip_list) by default. A
SkipList is very similar to a linked list but with many additional links. The
first layer of links matches a LinkedList. Additional layers are created by
selecting a progressively smaller subset of elements from the prior layer. The
additional layers are LinkedLists that skip elements.

When performing a search, the function starts at the most sparse layer and moves
to lower layers when the next skip connection overshoots the target. The
probabilistic nature of a SkipList creates a data structure that can be searched
in `O(Log N)` average worst case time. Immediately, we can see the benefits of
using a SkipList over a Vector. SkipLists provide the fast `O(Log N)` access of
a Vector without the `O(N)` worst-case time for inserts. Although some will
point out a Vector can be “amortized” across many inserts to a constant factor,
databases have strict latency guarantees that prevent them from using
amortization as a shield.

RocksDB’s implementation of a MemTable shows us the pinnacle of database design
and is the result of a relentless push for performance.

## Our MemTable

Since we aren’t looking for maximum performance and waste our time watching me
write a SkipList in Rust, we are going to use a Vector. Like stated above, a
Vector takes a performance hit on inserts, which is acceptable for our purposes.
The `Vec` struct is well rounded and has many helper functions that make
building our MemTable a lot easier. Along with being in the standard library,
Vectors are easy to follow — it’s a list — and we can efficiently search them
using [Binary Search](https://en.wikipedia.org/wiki/Binary_search_algorithm).
Overall, a Vector provides the minimum functionality to serve as the basis of
our MemTable while being simple enough to get started with.

### Building Our MemTable

Assuming Rust and Cargo are installed on your machine, we can commence building
our database with:

```bash
$ cargo new database-engine --lib
```

In the [Motivations section](/blog/simple-database/motivation-design/) of this
series, I mentioned one of the reasons I’m doing this is to learn Rust. I could
spend a lot of time and explain how Rust does ownership, but I don’t feel this
is the venue to do that. If you are still trying to learn the basics of Rust and
its ownership rules, read [The Book](https://doc.rust-lang.org/book/) first to
get a better understanding before embarking on building a database. While I
expect a basic understanding of Rust, I will mention ownership decisions when
they appear to be ambiguous or have effects on other components.

### MemTable Struct

Getting started, the first struct for our MemTable is self explanatory. Our
MemTable needs to satisfy two needs: a container of our write operations and a
counter for its size.

```rust
/// MemTable holds a sorted list of the latest written records.
///
/// Writes are duplicated to the WAL for recovery of the MemTable in the event of a restart.
///
/// MemTables have a max capacity and when that is reached, we flush the MemTable
/// to disk as a Table(SSTable).
///
/// Entries are stored in a Vector instead of a HashMap to support Scans.
pub struct MemTable {
  entries: Vec<MemTableEntry>,
  size: usize,
}
```

The MemTable struct fits our requirements with a `rust›Vec<MemTableEntry> ` and
a simple size counter. In the docs, I mention why a HashMap isn’t used. Lookups
and edits would be constant time, but scans would involve extracting and sorting
the entries of the table, an unacceptable tradeoff.

### MemTableEntry Struct

Inside the Vector are `MemTableEntry`s with the modified record information.

```rust
/// MemTable entry.
pub struct MemTableEntry {
  pub key: Vec<u8>,
  pub value: Option<Vec<u8>>,
  pub timestamp: u128,
  pub deleted: bool,
}
```

The Key and Value don’t need much explanation. The Timestamp is the time this
write occurred in microseconds and is used to order writes to the same key when
cleaning our old data in SSTables. In order to support fast deletes, we have
Tombstones for deleted records. With Tombstones, a value isn’t necessary for
these `MemTableEntry`s; thus, we can make it optional.

### MemTable Methods

With the structs out of the way, we can get to building the methods, the
functionality, of our MemTable.

#### Create a New Memtable

First, we need a way to create new MemTables.

```rust
/// Creates a new empty MemTable
pub fn new() -> MemTable {
  MemTable {
    entries: Vec::new(),
    size: 0,
  }
}
```

#### Find the Index of a MemTableEntry by Key

When we access the MemTable for gets, sets, and deletes, we need to run a Binary
Search over the entries of the MemTable. Rust is nice enough to include a Binary
Search implementation in the Vec standard library. This function is necessary to
explicitly find a record in question or find an acceptable index a record can be
inserted at while maintaining the total order of the records in the MemTable.

```rust
/// Performs Binary Search to find a record in the MemTable.
///
/// If the record is found `[Result::Ok]` is returned, with the index of record. If the record is not
/// found then `[Result::Err]` is returned, with the index to insert the record at.
fn get_index(&self, key: &[u8]) -> Result<usize, usize> {
  self
    .entries
    .binary_search_by_key(&key, |e| e.key.as_slice())
}
```

This helper function reduces the amount of code maintenance necessary if we want
to change the sort field.

#### Set a Key-Value Pair in the MemTable

To set a Key-Value pair in the database, we need to find the entry in the
MemTable with the same key to overwrite it or find the position where we can
insert a new entry. Here, we can see how our helper function,
`rust›get_index(&self, key: &[u8])`, simplifies this process.

```rust
/// Sets a Key-Value pair in the MemTable.
pub fn set(&mut self, key: &[u8], value: &[u8], timestamp: u128) {
  let entry = MemTableEntry {
    key: key.to_owned(),
    value: Some(value.to_owned()),
    timestamp,
    deleted: false,
  };

  match self.get_index(key) {
    Ok(idx) => {
      // If a Value existed on the deleted record, then add the difference of the new and old Value to the MemTable's size.
      if let Some(v) = self.entries[idx].value.as_ref() {
        if value.len() < v.len() {
          self.size -= v.len() - value.len();
        } else {
          self.size += value.len() - v.len();
        }
      }
      self.entries[idx] = entry;
    }
    Err(idx) => {
      self.size += key.len() + value.len() + 16 + 1; // Increase the size of the MemTable by the Key size, Value size, Timestamp size (16 bytes), Tombstone size (1 byte).
      self.entries.insert(idx, entry)
    }
  }
}
```

Using get_index, we can either get an `Ok` or `Err` for the records existence in
the Vector. If the `Result` is `Ok`, we overwrite the entry in the MemTable and
update the total size of the MemTable. If the `Result` is `Err`, we insert the
entry at the index returned and add the size of the entry the total size of the
MemTable.

#### Delete a Key-Value Pair From the MemTable

Deleting a record from our database is very similar to setting a Key-Value pair,
just without the Value. Even if the value doesn’t exist in the MemTable we have
to insert the Tombstone record because this record may exist in the SSTables.
Keeping Tombstones allows the database to clean up deleted records during
Compaction.

```rust
/// Deletes a Key-Value pair in the MemTable.
///
/// This is achieved using tombstones.
pub fn delete(&mut self, key: &[u8], timestamp: u128) {
  let entry = MemTableEntry {
    key: key.to_owned(),
    value: None,
    timestamp: timestamp,
    deleted: true,
  };
  match self.get_index(key) {
    Ok(idx) => {
      // If a Value existed on the deleted record, then subtract the size of the Value from the MemTable.
      if let Some(value) = self.entries[idx].value.as_ref() {
        self.size -= value.len();
      }
      self.entries[idx] = entry;
    }
    Err(idx) => {
      self.size += key.len() + 16 + 1; // Increase the size of the MemTable by the Key size, Timestamp size (16 bytes), Tombstone size (1 byte).
      self.entries.insert(idx, entry);
    }
  }
}
```

The only differences are no Value and slightly less size update logic.

#### Fetch a MemTableEntry by Key

To retrieve an entry, we search the Vector using Binary Search.

```rust
/// Gets a Key-Value pair from the MemTable.
///
/// If no record with the same key exists in the MemTable, return None.
pub fn get(&self, key: &[u8]) -> Option<&MemTableEntry> {
  if let Ok(idx) = self.get_index(key) {
    return Some(&self.entries[idx]);
  }
  None
}
```

Once we get the result from `rust›get_index()`, we wrap the response in an
`Option`. In this case, we return a reference because we don’t want other parts
of the database modifying the data inside the MemTable.

## Conclusion

The MemTable, the first component of our database, is simple on the surface but
disguises many design tradeoffs. RocksDB — in its drive to deliver consistency
performance with SkipLists — shows us the lengths that production databases
designers go to. Although we weren’t shooting for performance, our MemTable
delivered `O(Log N)` searches and `O(N)` inserts using a Vector.
[The complete MemTable component can be found in this repository along with a set of unit tests](https://github.com/adambcomer/database-engine/blob/master/src/mem_table.rs).
Next, we will implement the WAL component of our database so we can recover the
MemTable when our database restarts.

## Index

- [Build a Database Pt. 1: Motivation & Design](/blog/simple-database/motivation-design/)
- Build a Database Pt. 2: MemTable
- [Build a Database Pt. 3: Write Ahead Log(WAL)](/blog/simple-database/wal/)
