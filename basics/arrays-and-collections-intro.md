# Arrays and Collections

This chapter is a quick map of the container types you'll use constantly:
arrays, lists, sets, and maps. It's intentionally introductory — the full
[Collections](/collections/overview) section covers transformations,
sequences, and the complete standard library API in depth.

## Arrays

`Array<T>` is a fixed-size, ordered container, generic over any type.

```kotlin-runnable
fun main() {
    val languages: Array<String> = arrayOf("Kotlin", "Swift", "Rust")

    println(languages[0])
    println(languages.size)

    languages[1] = "Go"        // contents are mutable, size is fixed
    println(languages.joinToString())
}
```

Arrays exist mainly for interoperating with Java APIs and for the rare case
where you specifically need fixed-size, low-level array semantics (like
`main(args: Array<String>)`, which you saw in
[Hello, World!](/getting-started/hello-world)). For everyday Kotlin code,
you'll reach for `List` far more often than `Array`.

### Primitive arrays

A generic `Array<Int>` boxes every element (each one is a full object on the
JVM). For large numeric arrays where that overhead matters, Kotlin provides
specialized array types that store unboxed primitives directly:
`IntArray`, `LongArray`, `DoubleArray`, `BooleanArray`, `CharArray`, and so
on.

```kotlin-runnable
fun main() {
    val boxed: Array<Int> = arrayOf(1, 2, 3)      // each Int is boxed
    val primitive: IntArray = intArrayOf(1, 2, 3) // stored as raw ints

    println(boxed.sum())
    println(primitive.sum())
}
```

Use `IntArray`/`DoubleArray`/etc. when you're working with large amounts of
numeric data and performance matters (numerical code, interop with
performance-sensitive Java APIs). Otherwise, prefer `List<Int>` — it reads
more naturally and works with the full collections API.

## Lists

`listOf(...)` creates a read-only list; `mutableListOf(...)` creates one you
can add to and remove from.

```kotlin-runnable
fun main() {
    val readOnly = listOf("Kotlin", "Java", "Scala")
    // readOnly.add("Groovy")   // compile error: List has no add()

    val mutable = mutableListOf("Kotlin", "Java")
    mutable.add("Scala")
    mutable.removeAt(0)

    println(readOnly)
    println(mutable)
}
```

Unlike an array, a list has no `[index] =` assignment unless it's mutable,
and `listOf` gives you a type (`List<T>`) whose interface simply doesn't
expose any mutating methods at all.

## Sets and maps

`setOf`/`mutableSetOf` store unique, unordered-by-guarantee elements.
`mapOf`/`mutableMapOf` store key-value pairs, built with the `to` infix
function.

```kotlin-runnable
fun main() {
    val uniqueNumbers = setOf(1, 2, 2, 3, 3, 3)
    println(uniqueNumbers)          // duplicates collapsed: [1, 2, 3]

    val ages = mapOf("Ada" to 36, "Grace" to 85)
    println(ages["Ada"])
    println(ages["Nobody"])         // null: key not present

    val mutableAges = mutableMapOf("Ada" to 36)
    mutableAges["Grace"] = 85
    mutableAges["Ada"] = 37          // overwrite existing key
    println(mutableAges)
}
```

Reading a missing key from a `Map` with `[]` returns `null` rather than
throwing, so `ages["Nobody"]` has type `Int?` — this connects directly to
what you covered in [Null Safety](/basics/nullable-types).

## Read-only vs mutable: an interface distinction

This is one of the more important idioms to internalize early: `List`,
`Set`, and `Map` are **read-only interfaces** — they simply don't declare
any method that mutates the collection. `MutableList`, `MutableSet`, and
`MutableMap` extend them and add `add`, `remove`, `put`, and so on.

Crucially, "read-only" is not the same guarantee as "immutable." A `List`
reference can't be used to change the collection, but if some other part of
the program holds a `MutableList` reference to that *same underlying
collection*, changes made through that reference are visible through the
read-only one too.

```kotlin-runnable
fun main() {
    val mutable = mutableListOf(1, 2, 3)
    val readOnlyView: List<Int> = mutable   // same list, narrower interface

    mutable.add(4)
    println(readOnlyView)   // shows the change: [1, 2, 3, 4]
}
```

`readOnlyView` can't call `.add()` itself, but it's still looking at the
exact same list `mutable` is modifying. If you need a snapshot that truly
can't change underneath you, copy it explicitly with `.toList()`.

```kotlin-runnable
fun main() {
    val mutable = mutableListOf(1, 2, 3)
    val snapshot: List<Int> = mutable.toList()   // independent copy

    mutable.add(4)
    println(snapshot)   // unaffected: [1, 2, 3]
}
```

The practical takeaway: prefer declaring function parameters and return
types as the read-only interfaces (`List`, `Set`, `Map`) unless the caller
specifically needs to mutate, exactly the same instinct as preferring `val`
over `var`. It communicates intent and prevents accidental mutation through
that particular reference, even though it isn't a hard immutability
guarantee at the data level.

## Tasks

### Task 1: Build and query a map

Create a `mutableMapOf` of three country-to-capital pairs. Add a fourth
pair, then print the capital of a country that exists and one that doesn't
(observe the `null`).

```kotlin-runnable
fun main() {
    // Your code here
}
```

::: details Solution
```kotlin
fun main() {
    val capitals = mutableMapOf(
        "France" to "Paris",
        "Japan" to "Tokyo",
        "Egypt" to "Cairo"
    )

    capitals["Brazil"] = "Brasília"

    println(capitals["Japan"])
    println(capitals["Atlantis"])
}
```
:::

### Task 2: Read-only view

Write a function `total(numbers: List<Int>): Int` that returns the sum of a
read-only list. Call it with both a `listOf(...)` and a `mutableListOf(...)`
to show it accepts either.

::: details Solution
```kotlin
fun total(numbers: List<Int>): Int {
    return numbers.sum()
}

fun main() {
    println(total(listOf(1, 2, 3)))
    println(total(mutableListOf(4, 5, 6)))
}
```
A `MutableList<Int>` **is** a `List<Int>` (the interfaces extend each
other), so any function that only needs read access should accept the
narrower `List` type — it works with both and promises callers it won't
mutate their data.
:::

### Task 3: Unique values with a set

Write a function `countUnique(numbers: List<Int>): Int` that returns how
many distinct values are in `numbers`, using a `Set`.

::: details Solution
```kotlin
fun countUnique(numbers: List<Int>): Int {
    return numbers.toSet().size
}

fun main() {
    println(countUnique(listOf(1, 2, 2, 3, 3, 3, 4)))
}
```
`.toSet()` converts any collection into a `Set`, automatically collapsing
duplicates, and `.size` gives the count.
:::

Next: [Classes and Instances](/oop/classes-and-instances)
