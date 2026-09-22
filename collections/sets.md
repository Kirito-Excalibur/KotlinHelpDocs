# Sets

A `Set` guarantees each element appears at most once. Adding a duplicate is
a no-op — it doesn't throw, it just doesn't change the set.

```kotlin-runnable
fun main() {
    val readOnly = setOf("red", "green", "blue", "red")
    println(readOnly)       // [red, green, blue] — the duplicate is dropped
    println(readOnly.size)  // 3

    val mutable = mutableSetOf(1, 2, 3)
    mutable.add(2) // already present — no effect
    mutable.add(4)
    println(mutable) // [1, 2, 3, 4]
}
```

## Which Set implementation you get

Like `mutableListOf` returning an `ArrayList`, `setOf`/`mutableSetOf` return
a concrete class you're not naming directly — by default, a
`LinkedHashSet`. That matters because a `LinkedHashSet` preserves **insertion
order** when you iterate it, even though a set conceptually has no notion of
position:

```kotlin-runnable
fun main() {
    val visited = linkedSetOf("Paris", "Tokyo", "Cairo")
    visited.add("Paris") // duplicate, ignored
    visited.add("Lima")

    println(visited) // [Paris, Tokyo, Cairo, Lima] — insertion order preserved
}
```

There are two other common implementations, each trading order for
something else:

- **`HashSet`** (`hashSetOf(...)`) — no ordering guarantee at all. Iteration
  order depends on hash codes and can look arbitrary. It's marginally faster
  than `LinkedHashSet` for pure add/contains/remove workloads since it
  doesn't maintain the extra linked structure.
- **`TreeSet`** (`sortedSetOf(...)`) — keeps elements sorted according to
  their natural order (or a `Comparator` you supply), at the cost of
  `log(n)` inserts instead of constant time.

```kotlin-runnable
fun main() {
    val unordered = hashSetOf(5, 3, 1, 4)
    println(unordered) // order not guaranteed — don't rely on it

    val sorted = sortedSetOf(5, 3, 1, 4)
    println(sorted) // [1, 3, 4, 5] — always in sorted order

    val customSorted = sortedSetOf(compareByDescending<Int> { it })
    customSorted.addAll(listOf(5, 3, 1, 4))
    println(customSorted) // [5, 4, 3, 1]
}
```

In practice: reach for plain `setOf`/`mutableSetOf` (`LinkedHashSet`) unless
you specifically need sorted iteration order (`sortedSetOf`) or you're
optimizing a hot path and don't care about order at all (`hashSetOf`).

## Set operations

Kotlin gives you the standard mathematical set operations as extension
functions, all of which return a new `Set` and leave the originals alone:

```kotlin-runnable
fun main() {
    val a = setOf(1, 2, 3, 4)
    val b = setOf(3, 4, 5, 6)

    println(a.union(b))        // [1, 2, 3, 4, 5, 6]
    println(a.intersect(b))    // [3, 4]
    println(a.subtract(b))     // [1, 2]

    // infix operator form for union:
    println(a + b) // same as a.union(b)
    println(a - b) // same as a.subtract(b)
}
```

These aren't restricted to sets as input — `union`, `intersect`, and
`subtract` are defined on any `Iterable`, so you can pass a `List` as the
right-hand side too. The result is always a `Set`, since duplicates
wouldn't make sense in the answer.

## Uniqueness depends on equals()/hashCode()

A set decides whether two elements are "the same" using `equals()` (and,
for `HashSet`/`LinkedHashSet`, `hashCode()` to find the right bucket
efficiently). For built-in types and `data class`es, Kotlin generates
sensible structural equality automatically — this is covered in depth in
[Equality](/functional/equality) and [Data Classes](/oop/data-classes). If
you put instances of a regular (non-data) class into a set without
overriding `equals`/`hashCode`, "uniqueness" falls back to *reference*
identity, which is rarely what you want:

```kotlin-runnable
data class Point(val x: Int, val y: Int)

class Marker(val x: Int, val y: Int) // no equals/hashCode override

fun main() {
    val points = mutableSetOf(Point(0, 0))
    points.add(Point(0, 0)) // structurally equal — treated as duplicate
    println(points.size) // 1

    val markers = mutableSetOf(Marker(0, 0))
    markers.add(Marker(0, 0)) // different objects — no equals override
    println(markers.size) // 2
}
```

## Tasks

### Task 1: Deduplicate while preserving order

Given `listOf(3, 1, 4, 1, 5, 9, 2, 6, 5, 3)`, produce a list with duplicates
removed but the original first-seen order preserved.

::: details Solution
```kotlin
fun main() {
    val numbers = listOf(3, 1, 4, 1, 5, 9, 2, 6, 5, 3)
    val deduped = numbers.toList().distinct()
    println(deduped) // [3, 1, 4, 5, 9, 2, 6]
}
```
`distinct()` is a `List`-returning convenience that does exactly this —
internally it's backed by a `LinkedHashSet` to remember what it's already
seen while keeping first-seen order. Converting through `toSet().toList()`
manually would work too, since `setOf`/`toSet()` also default to
`LinkedHashSet`.
:::

### Task 2: Set arithmetic

Given `val enrolled = setOf("Ana", "Bo", "Cy")` and
`val attended = setOf("Bo", "Cy", "Deb")`, compute and print:
1. everyone who enrolled but didn't attend,
2. everyone who attended without being enrolled,
3. everyone involved either way.

::: details Solution
```kotlin
fun main() {
    val enrolled = setOf("Ana", "Bo", "Cy")
    val attended = setOf("Bo", "Cy", "Deb")

    println(enrolled - attended) // [Ana] — enrolled but absent
    println(attended - enrolled) // [Deb] — attended without enrolling
    println(enrolled + attended) // [Ana, Bo, Cy, Deb] — everyone
}
```
:::

### Task 3: Sorted uniqueness

You receive scores as `listOf(88, 72, 95, 72, 88, 60)`. Produce the distinct
scores in ascending order using a single expression.

::: details Solution
```kotlin
fun main() {
    val scores = listOf(88, 72, 95, 72, 88, 60)
    val distinctSorted = scores.toSortedSet()
    println(distinctSorted) // [60, 72, 88, 95]
}
```
`toSortedSet()` builds a `TreeSet` directly from the list, which both
deduplicates and sorts in one step. `scores.distinct().sorted()` gives the
same result as a `List` if you'd rather not think in terms of `TreeSet`.
:::

Next: [Maps](/collections/maps)
