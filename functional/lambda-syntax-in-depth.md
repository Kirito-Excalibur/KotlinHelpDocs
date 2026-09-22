# Lambda Syntax In Depth

[Lambdas: a first look](/basics/lambdas-intro) covered the basics: `{ ... }`
syntax and the implicit `it`. [Higher-Order Functions](/functional/higher-order-functions)
covered function types. Now let's fill in the rest of the syntax rules
you'll run into constantly once you start writing real Kotlin.

## Multiple parameters

A lambda with more than one parameter names them explicitly, separated by
commas, before the `->`:

```kotlin-runnable
fun main() {
    val pairs = listOf(1 to "one", 2 to "two", 3 to "three")

    pairs.forEach { number, word ->
        println("$number = $word")
    }
}
```

`it` only exists for single-parameter lambdas. The moment you have two or
more parameters, you must name them.

## Destructuring lambda parameters

`Pair` and `Map.Entry` (and any type with `component1()`/`component2()`)
can be destructured directly in a lambda parameter list by wrapping the
names in parentheses:

```kotlin-runnable
fun main() {
    val pairs = listOf(1 to "one", 2 to "two", 3 to "three")

    // Instead of: { pair -> pair.first, pair.second }
    pairs.forEach { (number, word) ->
        println("$number = $word")
    }
}
```

This is especially handy when iterating over a `Map`, since each entry
behaves like a `Pair` of key and value:

```kotlin-runnable
fun main() {
    val prices = mapOf("apple" to 1.20, "banana" to 0.50, "cherry" to 5.00)

    val total = prices.entries.sumOf { (_, price) -> price }
    println("Total: $total")

    prices.forEach { (fruit, price) ->
        println("$fruit costs $price")
    }
}
```

The underscore `_` discards a component you don't need, exactly like in
regular [destructuring declarations](/basics/variables).

## The trailing-lambda convention, in depth

You've seen `list.filter { ... }`. The rule generalizes: if a function's
**last parameter** has a function type, and you're passing a lambda for it,
that lambda can move outside the parentheses. If it's the only argument, the
empty `()` can be dropped entirely.

```kotlin-runnable
fun repeatAction(times: Int, action: (Int) -> Unit) {
    for (i in 0 until times) action(i)
}

fun main() {
    // All of these are equivalent:
    repeatAction(3, { i -> println("Run $i") })
    repeatAction(3) { i -> println("Run $i") }
    repeatAction(times = 3) { println("Run again: $it") }
}
```

This convention is why builder-style APIs are so common in Kotlin —
`buildString { ... }`, `Thread { ... }`, and your own DSLs all lean on it. If
a function has *two* function-type parameters, only the last one gets the
trailing treatment; the others must stay inside the parentheses:

```kotlin-runnable
fun transaction(onSuccess: () -> Unit, onFailure: (String) -> Unit) {
    val ok = true
    if (ok) onSuccess() else onFailure("network error")
}

fun main() {
    transaction({ println("Committed") }) { error ->
        println("Rolled back: $error")
    }
}
```

## `return` inside a lambda vs. a normal function

This is the sharpest edge in lambda syntax, so it's worth being precise.

A `return` written inside a regular `fun` (or an anonymous function — see
below) always returns from that function. But a `return` written directly
inside a **lambda** tries to return from the *enclosing function that the
lambda was passed to* — not just from the lambda itself. This only compiles
when the lambda is passed to an **inline** function (covered next chapter),
because only then does the lambda's code actually become part of the caller.

```kotlin-runnable
fun findFirstNegative(numbers: List<Int>): Int? {
    numbers.forEach {
        if (it < 0) {
            return it // returns from findFirstNegative, not just forEach's lambda
        }
    }
    return null
}

fun main() {
    println(findFirstNegative(listOf(4, 7, -3, 9)))
    println(findFirstNegative(listOf(4, 7, 3, 9)))
}
```

This is called a **non-local return**. It works here because `forEach` is
`inline`. If you need to return from *just the lambda*, not the whole
function, use a **labeled return**: `return@label`. The implicit label
matches the function's name:

```kotlin-runnable
fun printFirstNegative(numbers: List<Int>) {
    numbers.forEach {
        if (it >= 0) return@forEach // skips to the next iteration, like `continue`
        println("Found: $it")
        return@forEach
    }
}

fun main() {
    printFirstNegative(listOf(4, 7, -3, 9, -5))
}
```

`return@forEach` exits only the current invocation of the lambda passed to
`forEach` — it behaves like `continue` in a loop. You can also give a lambda
your own explicit label and return to that:

```kotlin-runnable
fun main() {
    listOf(1, 2, 3, 4, 5).forEach loop@{
        if (it == 3) return@loop
        println(it)
    }
}
```

An **anonymous function** (`fun(x: Int) { ... }` used as an expression) is
an alternative when you want ordinary `return` semantics — a plain `return`
inside one always returns from the anonymous function itself, never the
enclosing one:

```kotlin-runnable
fun main() {
    val numbers = listOf(1, 2, -3, 4)
    numbers.forEach(fun(n) {
        if (n < 0) return // returns from this anonymous function only
        println(n)
    })
}
```

In practice, labeled returns (`return@forEach`) are far more common than
anonymous functions for this purpose.

## Closures: lambdas capture variables, not just values

A lambda can reference variables from its enclosing scope — this is a
**closure**. Unlike Java, where a captured local variable must be effectively
final, Kotlin lambdas can capture and **mutate** a `var` from the enclosing
scope:

```kotlin-runnable
fun main() {
    var count = 0
    val increment = { count++ }

    increment()
    increment()
    increment()

    println(count) // 3 — the lambda mutated the outer variable
}
```

This is genuinely useful and genuinely dangerous. It's useful for small
stateful helpers like counters or accumulators built with `also` or
`forEach`:

```kotlin-runnable
fun main() {
    var total = 0
    val numbers = listOf(10, 20, 30, 40)

    numbers.forEach { total += it }

    println("Total: $total")
}
```

It's dangerous when a captured `var` is shared across threads or coroutines
without synchronization — each closure holds a reference to the same
underlying variable, not a snapshot of its value at capture time. Keep
captured mutable state local and short-lived, and prefer returning a new
value over mutating a captured one when a function might run concurrently.

## Tasks

### Task 1: Word lengths from a map

Given `val words = mapOf("cat" to 3, "elephant" to 8, "ox" to 2)`, use
`forEach` with destructuring to print each entry as `"<word> has <n> letters"`.

```kotlin-runnable
fun main() {
    val words = mapOf("cat" to 3, "elephant" to 8, "ox" to 2)

    // Your code here
}
```

::: details Solution
```kotlin
fun main() {
    val words = mapOf("cat" to 3, "elephant" to 8, "ox" to 2)

    words.forEach { (word, length) ->
        println("$word has $length letters")
    }
}
```
:::

### Task 2: Sum only the positive numbers, stop at the first big one

Write a function `sumUntilTooBig(numbers: List<Int>, limit: Int): Int` that
adds up numbers from the list, skipping negative ones, and stops entirely
(returning what it has so far) as soon as it encounters a number greater
than `limit`. Implement it with a single `forEach` call using both a
labeled `return@forEach` (to skip negatives) and a non-local `return` (to
stop early).

```kotlin-runnable
fun sumUntilTooBig(numbers: List<Int>, limit: Int): Int {
    var sum = 0
    // Your code here
    return sum
}

fun main() {
    println(sumUntilTooBig(listOf(1, -2, 3, 4, 100, 5), 10)) // 1 + 3 + 4 = 8
}
```

::: details Solution
```kotlin
fun sumUntilTooBig(numbers: List<Int>, limit: Int): Int {
    var sum = 0
    numbers.forEach {
        if (it < 0) return@forEach
        if (it > limit) return sum
        sum += it
    }
    return sum
}

fun main() {
    println(sumUntilTooBig(listOf(1, -2, 3, 4, 100, 5), 10))
}
```
`return@forEach` skips negatives without leaving the loop. The plain
`return sum` is a non-local return: it exits `sumUntilTooBig` immediately,
skipping the rest of the list once a number exceeds `limit`. This only
compiles because `forEach` is inline.
:::

Next: [Inline Functions](/functional/inline-functions)
