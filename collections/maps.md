# Maps

A `Map<K, V>` associates keys with values — like a Python `dict`, a JS
`Map`/object, or a Java `Map`. As noted in [Overview](/collections/overview),
it doesn't implement `Collection<T>`; it's its own hierarchy rooted at
`Map<K, V>` and `MutableMap<K, V>`.

## Creating maps and the `to` infix function

```kotlin-runnable
fun main() {
    val readOnly = mapOf("a" to 1, "b" to 2, "c" to 3)
    val mutable = mutableMapOf("a" to 1, "b" to 2)

    println(readOnly)
    println(mutable)
}
```

`to` isn't special map syntax — it's an ordinary infix function,
`infix fun <A, B> A.to(that: B): Pair<A, B>`, defined on every type. `"a" to
1` just creates a `Pair("a", 1)`. `mapOf` is a regular function that takes a
`vararg` of `Pair`s and assembles them into a map:

```kotlin-runnable
fun main() {
    val pair = "a" to 1
    println(pair)          // (a, 1)
    println(pair.first)    // a
    println(pair.second)   // 1

    // mapOf(vararg pairs: Pair<K, V>) - this is exactly what "a" to 1 produces
    val map = mapOf(pair, "b" to 2)
    println(map)
}
```

## Accessing values

```kotlin-runnable
fun main() {
    val ages = mapOf("Ana" to 30, "Bo" to 25)

    println(ages["Ana"])             // 30
    println(ages["Zoe"])             // null — [] never throws on a missing key
    println(ages.getValue("Ana"))    // 30
    // ages.getValue("Zoe")          // throws NoSuchElementException

    println(ages.getOrDefault("Zoe", 0))       // 0
    println(ages.getOrElse("Zoe") { -1 })      // -1, computed lazily

    println("Ana" in ages)           // true — checks keys
    println(ages.containsKey("Bo"))  // true
    println(ages.containsValue(30))  // true
}
```

Use `map[key]` (returns `V?`) when a missing key is a normal, expected case.
Use `getValue` only when a missing key means something has gone wrong and
you'd rather fail loudly. `getOrDefault` and `getOrElse` are for supplying a
fallback inline — `getOrElse` takes a lambda, so the fallback value is only
computed if the key is actually missing.

## Iterating

```kotlin-runnable
fun main() {
    val prices = mapOf("apple" to 1.20, "bread" to 2.50, "milk" to 1.80)

    for ((item, price) in prices) {
        println("$item costs $$price")
    }

    // equivalent, without destructuring:
    for (entry in prices) {
        println("${entry.key}: ${entry.value}")
    }

    prices.forEach { (item, price) -> println("$item -> $price") }
}
```

`for ((key, value) in map)` works because iterating a `Map` gives you
`Map.Entry<K, V>` objects, and `Map.Entry` supports destructuring into
`component1()`/`component2()` — the same mechanism that lets you destructure
`Pair`s and data classes.

## MutableMap operations

```kotlin-runnable
fun main() {
    val inventory = mutableMapOf("apples" to 10, "bananas" to 5)

    inventory["apples"] = 15         // update via indexed assignment
    inventory["pears"] = 3           // insert a new key the same way
    inventory.put("bananas", 8)      // equivalent to inventory["bananas"] = 8
    inventory.remove("pears")

    println(inventory)

    // getOrPut: return the existing value, or compute+insert+return if absent
    val count = inventory.getOrPut("kiwis") { 0 }
    println(count)      // 0 (just inserted)
    println(inventory)  // now contains "kiwis" to 0
}
```

`getOrPut` is worth calling out on its own — it's the idiomatic way to build
up a map where each key accumulates something, without a manual
`if (key !in map)` check:

```kotlin-runnable
fun main() {
    val words = listOf("bat", "bar", "cat", "car", "cot")
    val byFirstLetter = mutableMapOf<Char, MutableList<String>>()

    for (word in words) {
        val bucket = byFirstLetter.getOrPut(word.first()) { mutableListOf() }
        bucket.add(word)
    }

    println(byFirstLetter) // {b=[bat, bar], c=[cat, car, cot]}
}
```

(You'll see a shorter way to write this grouping pattern with `groupBy` in
[Filtering & Mapping](/collections/filtering-and-mapping) — `getOrPut` is
what to reach for when the built-in grouping functions don't quite fit.)

## Tasks

### Task 1: Word frequency

Given `val text = "the cat sat on the mat the cat ran"`, build a
`Map<String, Int>` counting how many times each word appears, using
`getOrPut` (or indexed access) on a `MutableMap`.

::: details Solution
```kotlin
fun main() {
    val text = "the cat sat on the mat the cat ran"
    val counts = mutableMapOf<String, Int>()

    for (word in text.split(" ")) {
        counts[word] = counts.getOrDefault(word, 0) + 1
    }

    println(counts) // {the=3, cat=2, sat=1, on=1, mat=1, ran=1}
}
```
`getOrDefault(word, 0) + 1` reads today's count (or 0 if it's the first
sighting) and writes back the incremented value. `getOrPut` also works here
if you frame the default value as "an Int starting at 0", but
`getOrDefault` reads more directly for a running count.
:::

### Task 2: Safe lookup with a fallback

Write a function `priceOf(catalog: Map<String, Double>, item: String):
Double` that returns the item's price, or `0.0` if the item isn't in the
catalog — without using an `if` statement.

::: details Solution
```kotlin
fun priceOf(catalog: Map<String, Double>, item: String): Double =
    catalog.getOrDefault(item, 0.0)

fun main() {
    val catalog = mapOf("apple" to 1.20, "bread" to 2.50)
    println(priceOf(catalog, "apple"))  // 1.2
    println(priceOf(catalog, "kiwi"))   // 0.0
}
```
:::

### Task 3: Invert a map

Given `val idToName = mapOf(1 to "Ana", 2 to "Bo", 3 to "Cy")`, build the
reverse mapping from name to id.

::: details Solution
```kotlin
fun main() {
    val idToName = mapOf(1 to "Ana", 2 to "Bo", 3 to "Cy")
    val nameToId = mutableMapOf<String, Int>()

    for ((id, name) in idToName) {
        nameToId[name] = id
    }

    println(nameToId) // {Ana=1, Bo=2, Cy=3}
}
```
This can also be written in one expression with
`idToName.entries.associate { (id, name) -> name to id }`, which you'll see
properly in [Filtering & Mapping](/collections/filtering-and-mapping).
:::

Next: [Sequences](/collections/sequences)
