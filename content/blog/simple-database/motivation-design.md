---
layout: post
title: 'Build a Database Pt. 1: Motivation & Design'
description:
  'Learn the motivations and designs behind building a simple LSM-Tree based
  Key-Value Store style database engine, similar to RocksDB.'
canonical: https://adambcomer.com/blog/simple-database/motivation-design/
author: 'Adam Comer'
updateDate: 2025-12-07T08:43:12Z
createDate: 2020-05-28T23:34:47Z
image: 'images/blog/simple-database-motivation-design-cover.jpg'
imageAlt: 'Servers in a data center'
---

Over the years, I’ve worked with about a half dozen databases for work and
serious projects. Although each one serviced a specific need at the time, I was
always fascinated by how fast the databases were able to process queries,
especially when the dataset was millions of records. Experts in the field will
tell you that this is done by formatting the data such that queries can take
advantage of logarithmic search properties. Even with an answer to my original
question, I’ve always wanted to build a database, specifically a **database
storage engine**. Together, we will better understand how a database operates
and what design tradeoffs are made during construction. In this series, we will
design and build a simple Log Structured Merge(LSM) tree storage engine similar
to [RocksDB](https://github.com/facebook/rocksdb), a leading database storage
engine.

## Motivation

### Why Write a Database?

The first question we must always ask ourselves is _“Why?”_. For me, this
project is an academic exercise to better understand the internals of a
database. As a user of databases, I typically select the best database for the
job, query appropriately, and don’t think about the internal functions of the
database. Following the database documentation, most developers can successfully
utilize a database; but reading the documentation alone won’t paint the full
picture of a database’s capabilities. Developers, with an understanding of
database internals, will have the tools to think critically about database
choices, query patterns, and data schemas.

While learning how to build my own database, I found two types of resources:
overly abstract blogs and very specific documentation. The blogs were easy to
understand but lacked in substance and detail. On the other hand, the
documentation had the specificity I was looking for but was narrowly applicable
to a single database. My goal is to hit somewhere in the middle. **I want to
explain the broad ideas behind database design and build a concrete
implementation to exhibit how the two are connected**. This resource is aimed at
helping someone with a computer science background learn more about database
storage engines.

### Why Use Rust?

I want to learn [Rust](https://www.rust-lang.org/), and there is no better way
to learn a new programming language than by starting an ambitious project. I’ve
dabbled in Rust in the past but never committed to building anything beyond a
few toy programs. This project is my justification for going all-in on the
language and learning more about it in the process.

As a systems language, building complex low-level systems is Rust’s bread and
butter. Latency sensitive applications — especially databases — need to control
what resources are used and how they are freed. With no garbage collector, Rust
provides the control and performance a database needs. Although we aren’t
looking to break any speed records, having a sense of how resources are managed
gives us a better understanding of the challenges database designers face.

### What Type of Database?

Since this is an academic exercise, our database should be simple to follow and
representative of the database landscape. By far the simplest type of database
that is commonly used is a
[Key-Value Store](https://en.wikipedia.org/wiki/Key-value_database). It places
few limitations on the structure of our data and has a small API of Get, Set,
Delete, and Scan. Since we are ditching a multi-record data model, our database
will only need a single index for the record keys. Although simple, Key-Value
Stores are used in many applications such as low latency caches, think Redis,
and big data storage solutions, think BigTable. For our database, a Key-Value
Store checks the boxes of simplicity and relevancy.

### What Storage Data-Structure?

In the world of small data, there are two major players for on-disk storage:
B-Trees([original paper](https://infolab.usc.edu/csci585/Spring2010/den_ar/indexing.pdf),
[wiki](https://en.wikipedia.org/wiki/B-tree)) and
LSM-Trees([original paper](https://www.cs.umb.edu/~poneil/lsmtree.pdf),
[wiki](https://en.wikipedia.org/wiki/Log-structured_merge-tree)).

B-Trees are the dominant storage data-structure in relational databases, like
[MySQL](https://dev.mysql.com/doc/refman/8.4/en/index-btree-hash.html) and
[Postgres](https://www.postgresql.org/docs/current/btree.html). B-Trees are
shallow search trees stored on disk. The leaf nodes hold sorted batches or
records and the internal nodes hold references to other internal nodes or leaf
nodes. As records are written, the database allocates more leaf nodes and
rebalances the tree to keep search times low.

**A B-Tree storage pattern is very efficient for lookups**. Most lookups can be
done in less than 5 hops because of the B-Tree’s logarithmic nature. Although
quick on reads, B-trees suffer on write performance because inserting new
records to the B-Tree often requires creating new leaf nodes and rebalancing the
tree. Databases that are focused on OLTP and read heavy use cases opt for
B-Trees because of their speedy lookup times.

LSM-Trees are commonly used in document databases and big-data stores, like
[ElasticSearch](https://www.elastic.co/blog/found-elasticsearch-from-the-bottom-up)
and
[HBase](https://blogs.apache.org/hbase/entry/accordion-hbase-breathes-with-in).
Going forward, we will use the LevelDB/RocksDB LSM-Tree variant. LSM-Trees are
structured as Levels of Sorted Runs. Let’s break this down. First, a Sorted Run
is a list of records sorted by key on-disk. The Sorted Runs are organized into
Levels based on the max storage capacities of that level. When the total size of
the data exceeds the max at a level, a Sorted Run is moved to the next level and
merged with other sorted runs with overlapping key ranges. This data management
process is called Compaction.

**A LSM-Tree storage pattern is very efficient for writes**. LSM-Trees update
their data storage periodically with Compaction routines, which reduces the
amount of random disk writes. Since LSM-Trees use sequential I/O, their write
capacity is limited by disk throughput which can be on the order of 1+ GB/s.
LSM-Trees suffer on record lookups due to data fragmentation. To find a record,
a lookup involves searching each Sorted Run file with a cost 5+ hops per Sorted
Run. Databases that are focused on data ingestion and write heavy use cases opt
for LSM-Trees because of their high write throughput.

We are going to use a LSM-Tree as the model of our database because the data
flow is easier to understand. Additionally, the Sorted Runs are stored as
immutable files that only change during the Compaction process, limiting the
complexity of disk operations. Using a B-Tree involves conceptualizing an
ever-changing data-structure and maintaining a matching model on disk. If you
want to learn about
[how to make a B-Tree based database, cstack](https://cstack.github.io/db_tutorial/)
has a great series explaining how to build a SQLite clone. It is very well done,
and I highly recommend it.

### Why Is Our Database Relevant?

Our database will be a LSM-Tree based Key-Value Store like RocksDB. RocksDB is
used in internal Facebook applications and in other databases as the storage
layer. LSM-Tree based Key-Value Stores are used in many different types of
databases. For example,
[CockroachDB](https://www.cockroachlabs.com/blog/cockroachdb-on-rocksd/) and
[YugaByte](https://blog.yugabyte.com/how-we-built-a-high-performance-document-store-on-rocksdb/),
relational SQL databases, use RocksDB to store and query the database records.
[Dgraph](https://hypermode.com/blog/badger-over-rocksdb-in-dgraph), a graph
database, uses [BadgerDB](https://github.com/dgraph-io/badger)(another Key-Value
store) for records and connections.
[ElasticSearch](https://www.elastic.co/elasticsearch/), a document database,
used [Lucene](https://lucene.apache.org/)(LSM-Tree based storage) for text
records. Our database mirrors RocksDB minus the unnecessary extra features that
make it especially fast. But, the principles defined in this series are directly
applicable to other databases that you may know and love.

## Database Design

With a database type selected, we need to design our database. Our database will
consist of a few components, a single compaction process, and a limited API.

### Components

Our database consists of three main components: MemTable, WAL, and SSTable. In
this series, each component will be created one-by-one along with explanations
for how it works, what it should do, and what tradeoffs have been made in its
construction. Throughout the series, every component will start as an abstract
idea and work its way down to executable code. To get the most out of this
project, understand the broad strokes first.

#### MemTable

The
MemTable([RocksDB MemTable](https://github.com/facebook/rocksdb/wiki/MemTable/0fcb6453a2cdeab9211113ff66f911bdf126b69b),
[Our MemTable](/blog/simple-database/memtable/)), Memory Table for short, is an
in-memory cache of the latest records written to the database. When a record is
written, we immediately add the record to the MemTable and sort the records by
the key. MemTables have a max capacity, usually 2MB, and are flushed to disk
when capacity is reached. Initially, to conduct a record retrieval, we first
search the MemTable because it holds the latest record writes. The MemTable is
the simplest part of the database with two routines: sorting records in a list
and using Binary Search to find a record.

#### WAL

Since memory isn’t persistent, we need a way to store our MemTable so data isn’t
lost. The Write Ahead Log(WAL)
([RocksDB WAL](<https://github.com/facebook/rocksdb/wiki/Write-Ahead-Log-(WAL)/72ff53f7d990c660703b41c5ecaf2fe54582a8ea>),
[Our WAL](/blog/simple-database/wal/)) is an append only file that holds the
record operations for the MemTable. When we set a new key, update a key, or
delete a record, a new entry is immediately appended to the WAL. In the event of
a database restart, the MemTable can be restored by replaying the operations in
the WAL. When a MemTable reaches max capacity and is flushed to disk, its
corresponding WAL is deleted.

#### SSTable

When a MemTable is flushed to disk, we take that Sorted Run and store it on disk
as a
[SSTable](https://github.com/facebook/rocksdb/wiki/Rocksdb-BlockBasedTable-Format/eec7dca51da8cbdcc1b915661550093f1024e0a6).
The SSTables are organized into levels with max capacities of powers of 10, e.g.
10MB, 100MB, 1000MB, …. When a level reaches max capacity, a Compaction is
triggered to move a SSTable to the next level. Since records are not updated
immediately on disk, outdated records will persist on older SSTables. Outdated
data poses two challenges for our database: garbage collecting old records and
searching for records. Conveniently, triggered Compactions remove the old
records in the merged SSTables. To properly lookup records without returning
outdated records, SSTables must be queried from the lowest to the highest level,
because the records at a given level are newer than at the next level (I won’t
prove this invariance).

### Compaction

[Compaction](https://github.com/facebook/rocksdb/wiki/Compaction/a4880c101f719057efc8fbc8019322b623bf158d)
is the garbage collection and data management process of our database. To
trigger a Compaction, a level of our SSTables must reach max capacity. Once
triggered, Compaction takes a SSTable from the filled level and merges it with
the SSTables in the next level with overlapping key ranges. When the files are
merged, the keys are re-sorted, outdated records are removed, and a new SSTable
is created. If the next level exceeds capacity, Compactions are repeated at the
next level until the top level is reached.

### API

The database’s API consists of four methods: Get, Set, Delete, and Scan.

#### Get a Record From the Database

Method: `get(byte[] key) -> byte[]`

The Get method searches for a record in the database, either returning that
record or None. First, this method queries the MemTable for the record. Second,
if no result is found in the MemTable, SSTables are queried from the lowest to
the highest level. When a record is found, we return the record at the lowest
level, because the records at higher levels are guaranteed to be older.

#### Set a Record in the Database

Method: `set(byte[] key, byte[] value) -> bool`

The Set method sets a key-value pair in the database. Initially, this record is
inserted into the MemTable and WAL. When the MemTable reaches capacity, a new
SSTable is created, and the MemTable and WAL are cleared. As more Tables are
created, compaction merges SSTables from lower to higher levels, cleaning out
old records.

#### Delete a Record From the Database

Method: `delete(byte[] key) -> bool`

The Delete method removes a record from the database by storing a boolean that
represents that this record was deleted, called a Tombstone. This method is
similar to the Set method but without the value. You may ask: Why can’t we
remove this record from the database instead of writing more data? We add a
Tombstone because cleaning out a record from the database would involve
rewriting all of the SSTables that contain that key. This would be too time
consuming for database clients that expect a response in a few milliseconds. To
make deletes work in reasonable times, we sacrifice a little disk space with a
Tombstone. With Tombstones, our search must be subsequently modified. Our new
Get will stop when a Tombstone is reached and return None, since a tombstone
means that this record was most recently deleted.

#### Iterate Over the Records in a Key Range in the Database

Method: `scan(byte[] high_key, byte[] low_key) -> RecordIterator`

The Scan method collects all of the records between the _low_key_ and
_high_key_, inclusive. An Iterator is created to search through all of the
SSTables and return the records within the range of the two keys. This is done
by finding the _low_key_ (or next highest value) in each SSTable and reading
records one-by-one until the next record is greater than the _high_key_.

Scans are useful if we want to aggregate groups of records. For example, in a
weather app, the keys for the temperature records could be in the format of
`{station #}/{timestamp}`. To get all of the records for a given time period, we
scan on a station number with minimum and maximum timestamp keys. The results
would allow us to graph the temperature of a weather station. Although useful,
scans are expensive, because they require reading from every SSTable. Scans are
best suited to short ranges with few records.

## Conclusion

With a database type selected, design formalized, and API defined, we can
commence building our database. In this series, we will learn how to build the
components of our database and learn about basic database design. By the end of
the series, we will gain a greater understanding of how LSM-Tree based Key-Value
Stores work.

## Index

- Build a Database Pt. 1: Motivation & Design
- [Build a Database Pt. 2: MemTable](/blog/simple-database/memtable/)
- [Build a Database Pt. 3: Write Ahead Log(WAL)](/blog/simple-database/wal/)
