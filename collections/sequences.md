# Sequences

Every `List` operation you've used so far — `filter`, `map`, and the rest —
is **eager**: each call runs immediately, over the whole collection, and
allocates a brand-new list to hold the result. When you chain several of
them, that's a new intermediate list per step.

`Sequence<T>` is Kotlin's **lazy** alternative. It represents the same kind
of chain of operations, but nothing runs until you ask for a final result,
and no intermediate collections get allocated.

## Eager vs. lazy: seeing the difference

```kotlin-runnable
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)

    val result = numbers
        .map { println("map: $it"); it * 2 }
        .filter { println("filter: $it"); it > 4 }

    println("Result: $result")
}
```

Run that: `map` prints for *every* element and builds a whole intermediate
list, then `filter` runs over *that entire list* and builds another one.
Two full passes, two intermediate lists — even though you only ended up
needing 3 of the 5 elements.

Now the same pipeline as a sequence:

```kotlin-runnable
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)

    val result = numbers.asSequence()
        .map { println("map: $it"); it * 2 }
        .filter { println("filter: $it"); it > 4 }
        .toList()

    println("Result: $result")
}
```

Notice the interleaving: `map: 1`, `filter: 2`, `map: 2`, `filter: 4`, and
so on — each element flows through the *entire* chain of operations one at a
time, instead of the whole collection passing through one operation at a
time. No intermediate list ever exists; `map` and `filter` just describe
transformations that get applied lazily, element by element, only when
`toList()` finally asks for results.

## Nothing happens until a terminal operation

`map`, `filter`, `take`, and similar `Sequence` operations are called
**intermediate** — they return a new `Sequence` describing more work, but
don't do any of it yet. Only a **terminal** operation like `toList()`,
`count()`, `first()`, `sum()`, or `forEach()` actually pulls elements
through the chain.

```kotlin-runnable
fun main() {
    val sequence = listOf(1, 2, 3).asSequence().map {
        println("Computing $it")
        it * it
    }

    println("Nothing has printed yet")
    val result = sequence.toList() // *now* the map lambda actually runs
    println(result)
}
```

This laziness also lets a sequence short-circuit. `first { ... }` on a
sequence stops pulling elements the moment it finds a match, instead of
transforming everything up front:

```kotlin-runnable
fun main() {
    val firstBigSquare = generateSequence(1) { it + 1 }
        .map { it * it }
        .first { it > 50 }

    println(firstBigSquare) // 64
}
```

`generateSequence(1) { it + 1 }` builds an infinite sequence of
1, 2, 3, ... — something you could never do with a `List`, since a `List`
must be fully materialized in memory. This is a second, distinct reason to
reach for sequences: not just avoiding intermediate allocations, but
representing streams that don't have a fixed, upfront size at all.

## asSequence() and converting back

`asSequence()` wraps an existing `Iterable` (like a `List` or `Set`) as a
`Sequence`, without copying its elements up front — it just gives you a lazy
view over the same data. Call `toList()`, `toSet()`, or similar when you're
done and want an eager collection again:

```kotlin-runnable
fun main() {
    val names = listOf("Ana", "bo", "Cy", "deb", "Eli")

    val result = names.asSequence()
        .filter { it.first().isUpperCase() }
        .map { it.uppercase() }
        .toList()

    println(result) // [ANA, CY, ELI]
}
```

## When sequences are (and aren't) worth it

Sequences aren't automatically faster — for small collections, the overhead
of wrapping each step in a `Sequence` object can outweigh the cost of just
allocating a short-lived intermediate list. The tradeoff flips as the
collection gets larger and the chain gets longer:

- **Use a sequence** when you're chaining multiple operations (`filter`,
  `map`, `take`, and so on) over a **large** collection, since it avoids
  building a full intermediate list after every single step.
- **Use a sequence** when you need to represent something that's naturally
  infinite or unbounded (like `generateSequence`), or where you'll likely
  stop early (`first`, `take`, `find`) and don't want to process elements
  you'll never use.
- **Skip the sequence** for small, fixed collections with one or two
  operations — plain `List` operations are simpler to read and the eager
  allocation is negligible.

```kotlin-runnable
fun main() {
    // A handful of elements, one operation: a sequence adds nothing here.
    val small = listOf(1, 2, 3).filter { it > 1 }
    println(small)

    // Many elements, multiple chained steps, only the first result matters:
    // a Sequence avoids fully mapping and filtering all 1,000,000 numbers.
    val big = (1..1_000_000).asSequence()
        .map { it * 3 }
        .filter { it % 7 == 0 }
        .first()
    println(big)
}
```

## Tasks

### Task 1: Trace the order

Without running it, write down the exact print order for this snippet, then
run it to check yourself:

```kotlin-runnable
fun main() {
    val result = listOf(1, 2, 3).asSequence()
        .map { println("map $it"); it + 1 }
        .filter { println("filter $it"); it % 2 == 0 }
        .toList()

    println(result)
}
```

::: details Solution
```kotlin
fun main() {
    val result = listOf(1, 2, 3).asSequence()
        .map { println("map $it"); it + 1 }
        .filter { println("filter $it"); it % 2 == 0 }
        .toList()

    println(result)
}
// Output:
// map 1
// filter 2
// map 2
// filter 3
// map 3
// filter 4
// [2, 4]
```
Each element (1, then 2, then 3) is pushed through the *whole* chain before
the next element starts — that's the element-by-element laziness that
distinguishes a `Sequence` from a `List` pipeline, where all of `map` would
run before any of `filter`.
:::

### Task 2: First matching value, lazily

Use `generateSequence` and `first` to find the first multiple of 6 greater
than 1000, without pre-building any list of candidates.

::: details Solution
```kotlin
fun main() {
    val result = generateSequence(1) { it + 1 }
        .first { it > 1000 && it % 6 == 0 }

    println(result) // 1002
}
```
Because sequences are lazy, `first` stops generating numbers the instant it
finds a match — it never materializes the infinite sequence, or even the
numbers between 1 and 1002, as a `List`.
:::

### Task 3: When would you skip a sequence?

You have `val names = listOf("Ana", "Bo", "Cy")` (3 elements) and want the
names longer than 2 characters, uppercased. Would you use `asSequence()`
here? Write the code you'd actually use, and justify the choice in a
sentence.

::: details Solution
```kotlin
fun main() {
    val names = listOf("Ana", "Bo", "Cy")
    val result = names.filter { it.length > 2 }.map { it.uppercase() }
    println(result) // [ANA]
}
```
No `asSequence()` needed. With only 3 elements and two simple operations,
the eager `List` version is simpler to read and the cost of one small
intermediate list is irrelevant — sequences pay off on larger collections
or longer chains, not here.
:::

Next: [Filtering & Mapping](/collections/filtering-and-mapping)
