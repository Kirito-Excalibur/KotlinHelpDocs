# Aggregate Operations

Aggregate operations collapse a collection down to a single value: a count,
a sum, a maximum, or something more custom you define yourself. These are
terminal operations — on a `Sequence` they're what actually triggers
evaluation (see [Sequences](/collections/sequences)).

## count, sum, sumOf

```kotlin-runnable
fun main() {
    val numbers = listOf(4, 2, 9, 7, 5, 1)

    println(numbers.count())               // 6
    println(numbers.count { it > 4 })       // 3 — count matching a predicate

    println(numbers.sum())                  // 28
}
```

`sum()` only exists on collections of numeric types directly. For a
collection of *objects* you want to sum a property of, use `sumOf`, which
takes a selector:

```kotlin-runnable
data class Product(val name: String, val price: Double, val quantity: Int)

fun main() {
    val cart = listOf(
        Product("Pen", 1.50, 3),
        Product("Notebook", 4.00, 2),
        Product("Eraser", 0.75, 5),
    )

    val totalCost = cart.sumOf { it.price * it.quantity }
    println(totalCost) // 16.25

    val totalItems = cart.sumOf { it.quantity }
    println(totalItems) // 10
}
```

## max, min, and the -By / -OrNull family

```kotlin-runnable
fun main() {
    val numbers = listOf(4, 2, 9, 7, 5, 1)

    println(numbers.max()) // 9
    println(numbers.min()) // 1

    val empty = emptyList<Int>()
    println(empty.maxOrNull()) // null — safe on an empty collection
    // empty.max()             // throws NoSuchElementException
}
```

For objects, use `maxBy`/`minBy` (or the null-safe `maxByOrNull`/
`minByOrNull`) with a selector, or `maxOf`/`minOf` to get the *selected
value* itself rather than the whole object:

```kotlin-runnable
data class Product(val name: String, val price: Double)

fun main() {
    val products = listOf(
        Product("Pen", 1.50),
        Product("Notebook", 4.00),
        Product("Eraser", 0.75),
    )

    val cheapest = products.minByOrNull { it.price }
    println(cheapest) // Product(name=Eraser, price=0.75)

    val highestPrice = products.maxOf { it.price }
    println(highestPrice) // 4.0

    println(emptyList<Product>().maxByOrNull { it.price }) // null
}
```

Use the plain `max`/`min`/`maxBy`/`minBy` only when you're certain the
collection is non-empty; otherwise prefer the `OrNull` variants so an empty
collection produces `null` instead of an exception.

## average

```kotlin-runnable
fun main() {
    val scores = listOf(88, 92, 79, 95, 84)
    println(scores.average()) // 87.6 — always returns a Double
}
```

## fold and reduce

Both `fold` and `reduce` combine every element into a single accumulated
result by repeatedly applying a function — the difference is where the
starting value comes from.

`fold` takes an explicit initial value, so it works safely on an empty
collection (it just returns the initial value unchanged) and can produce a
result of a *different type* than the elements:

```kotlin-runnable
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)

    val sum = numbers.fold(0) { accumulator, element -> accumulator + element }
    println(sum) // 15

    // The result type doesn't have to match the element type:
    val asSentence = numbers.fold("Numbers:") { acc, n -> "$acc $n" }
    println(asSentence) // Numbers: 1 2 3 4 5

    println(emptyList<Int>().fold(100) { acc, n -> acc + n }) // 100 — untouched
}
```

`reduce` uses the collection's *first element* as the starting point, so the
accumulated result must be the same type as the elements — and it throws if
the collection is empty, since there's no first element to start from:

```kotlin-runnable
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)

    val product = numbers.reduce { acc, n -> acc * n }
    println(product) // 120

    // val boom = emptyList<Int>().reduce { acc, n -> acc + n }
    // throws UnsupportedOperationException: Empty collection can't be reduced.

    println(emptyList<Int>().fold(1) { acc, n -> acc * n }) // 1 — fold is safe
}
```

Rule of thumb: reach for `fold` by default, since it handles empty
collections gracefully and lets you accumulate into any type (build a
`String`, a `Map`, another `List`, whatever). Reach for `reduce` only when
you specifically want to combine elements using their own type with no
separate seed value, and you know the collection is non-empty.

## any, all, none

```kotlin-runnable
fun main() {
    val numbers = listOf(4, 2, 9, 7, 5, 1)

    println(numbers.any { it > 8 })   // true — at least one matches
    println(numbers.all { it > 0 })   // true — every element matches
    println(numbers.none { it < 0 })  // true — no element matches

    println(emptyList<Int>().any { it > 0 })  // false — vacuously
    println(emptyList<Int>().all { it > 0 })  // true — vacuously
}
```

Watch that last pair: `any` on an empty collection is always `false` (there's
nothing to satisfy the condition), while `all` on an empty collection is
always `true` (there's no counterexample) — standard "vacuous truth" logic,
the same as in math and most other languages.

## Tasks

### Task 1: Cart total and most expensive item

Given a list of products (each with `name`, `price`, `quantity`), compute
the total cost of the cart and find the single most expensive item by unit
price. Use `sumOf` and `maxByOrNull`.

```kotlin-runnable
data class Product(val name: String, val price: Double, val quantity: Int)

fun main() {
    val cart = listOf(
        Product("Pen", 1.50, 3),
        Product("Notebook", 4.00, 2),
        Product("Headphones", 25.00, 1),
    )
    // Your code here
}
```

::: details Solution
```kotlin
data class Product(val name: String, val price: Double, val quantity: Int)

fun main() {
    val cart = listOf(
        Product("Pen", 1.50, 3),
        Product("Notebook", 4.00, 2),
        Product("Headphones", 25.00, 1),
    )

    val total = cart.sumOf { it.price * it.quantity }
    val priciest = cart.maxByOrNull { it.price }

    println("Total: $total")     // Total: 37.5
    println("Priciest: $priciest") // Priciest: Product(name=Headphones, ...)
}
```
:::

### Task 2: fold vs. reduce

Given `val words = listOf("Kotlin", "is", "fun")`, use `fold` to build the
single string `"Kotlin-is-fun"` (joined with hyphens, no leading hyphen).
Then explain in one sentence why `reduce` could also solve this particular
problem but `fold` couldn't be replaced by `reduce` in general.

::: details Solution
```kotlin
fun main() {
    val words = listOf("Kotlin", "is", "fun")

    val joined = words.fold("") { acc, word ->
        if (acc.isEmpty()) word else "$acc-$word"
    }
    println(joined) // Kotlin-is-fun

    // reduce also works here because the accumulator type (String)
    // matches the element type (String):
    val joinedWithReduce = words.reduce { acc, word -> "$acc-$word" }
    println(joinedWithReduce) // Kotlin-is-fun
}
```
`reduce` works in this specific case because both the elements and the
accumulated result are `String`. `fold` is more general: it lets you
accumulate into a *different* type (like building an `Int` sum from a list
of `String`s, or building a `Map` from a `List`) and it never throws on an
empty input, since it doesn't depend on there being a first element.
:::

### Task 3: Grade summary

Given `val scores = listOf(72, 88, 95, 60, 79)`, print: the average, the
highest score, and whether every student passed (score >= 60).

::: details Solution
```kotlin
fun main() {
    val scores = listOf(72, 88, 95, 60, 79)

    println("Average: ${scores.average()}")     // Average: 78.8
    println("Highest: ${scores.max()}")          // Highest: 95
    println("All passed: ${scores.all { it >= 60 }}") // All passed: true
}
```
:::

Next: [Ranges and Progressions](/collections/ranges-and-progressions)
