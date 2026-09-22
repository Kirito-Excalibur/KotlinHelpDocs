# Functions

You've been writing functions since the very first `fun main()`. This
chapter covers the rest of the syntax: return types, default and named
arguments, `vararg`, and where functions can live.

## Basic declaration

```kotlin-runnable
fun greet(name: String): String {
    return "Hello, $name!"
}

fun main() {
    println(greet("Kotlin"))
}
```

Parameters are always `name: Type`, opposite of Java/C's `Type name` order.
The return type comes after the parameter list, following a colon. If a
function returns nothing meaningful, its return type is `Unit` (roughly
Kotlin's equivalent of `void`) and can be omitted entirely — every function
you wrote before this chapter, like `fun main()`, was implicitly returning
`Unit`.

```kotlin-runnable
fun logMessage(message: String): Unit {
    println("[LOG] $message")
}

fun main() {
    logMessage("Started")
}
```

## Single-expression functions

When a function's body is a single expression, skip the braces, the
`return`, and (usually) the return type — Kotlin infers it.

```kotlin-runnable
fun square(x: Int) = x * x

fun isEven(n: Int) = n % 2 == 0

fun main() {
    println(square(5))
    println(isEven(4))
}
```

This works for anything that reduces to one expression, including an `if`
or `when` used as an expression:

```kotlin-runnable
fun max(a: Int, b: Int) = if (a > b) a else b

fun main() {
    println(max(3, 7))
}
```

You can still write an explicit return type on a single-expression function
if you want it documented, but it's optional and often left out for small,
obvious functions like these.

## Default parameter values

Parameters can declare a default, letting callers omit them.

```kotlin-runnable
fun greet(name: String, greeting: String = "Hello"): String {
    return "$greeting, $name!"
}

fun main() {
    println(greet("Ada"))
    println(greet("Ada", "Hi"))
}
```

This replaces most of what method overloading is used for in Java — instead
of writing three overloads of `greet`, you write one function with defaults.

## Named arguments

Call any parameter by name, in any order. This is especially useful when a
function has several parameters of the same type, or several with defaults
and you only want to override one that isn't first.

```kotlin-runnable
fun createUser(name: String, age: Int = 18, isAdmin: Boolean = false) {
    println("$name, age $age, admin=$isAdmin")
}

fun main() {
    createUser("Grace")
    createUser("Ada", isAdmin = true)          // skip `age`, name the rest
    createUser(age = 30, name = "Linus")       // order doesn't matter when named
}
```

Named arguments plus defaults are the idiomatic replacement for Java's
"builder" pattern in a lot of everyday code.

## `vararg`

Mark a parameter `vararg` to accept a variable number of arguments, which
arrive as an array inside the function.

```kotlin-runnable
fun sum(vararg numbers: Int): Int {
    var total = 0
    for (n in numbers) {
        total += n
    }
    return total
}

fun main() {
    println(sum())
    println(sum(1, 2, 3))
    println(sum(10, 20, 30, 40))
}
```

Only one parameter may be `vararg`, and by convention it's the last one (if
it isn't last, later arguments must be passed by name). To pass an existing
array where a `vararg` is expected, spread it with `*`:

```kotlin-runnable
fun sum(vararg numbers: Int): Int = numbers.sum()

fun main() {
    val values = intArrayOf(1, 2, 3, 4)
    println(sum(*values))
}
```

## Top-level functions

Unlike Java, functions don't need to live inside a class. `greet`, `square`,
and every other function in this chapter is a top-level function — declared
directly in a file, callable from anywhere that imports it. This is why
`fun main()` alone was a complete, valid Kotlin program back in
[Hello, World!](/getting-started/hello-world) — no wrapper class required.

## Local functions

Functions can also be nested inside other functions. A local function can
see and use the variables of its enclosing function, which is handy for
breaking up a longer function without polluting the top-level namespace.

```kotlin-runnable
fun printOrderSummary(itemPrice: Double, quantity: Int) {
    fun computeTotal() = itemPrice * quantity   // sees enclosing parameters

    println("Total: ${computeTotal()}")
}

fun main() {
    printOrderSummary(9.99, 3)
}
```

## Tasks

### Task 1: Default and named arguments

Write a function `formatName(first: String, last: String, uppercase: Boolean = false): String`
that returns `"$first $last"`, or the uppercase version if `uppercase` is
`true`. Call it three ways: with just the required arguments, with all three
positional, and with `uppercase` passed by name.

::: details Solution
```kotlin
fun formatName(first: String, last: String, uppercase: Boolean = false): String {
    val full = "$first $last"
    return if (uppercase) full.uppercase() else full
}

fun main() {
    println(formatName("Ada", "Lovelace"))
    println(formatName("Ada", "Lovelace", true))
    println(formatName("Ada", "Lovelace", uppercase = true))
}
```
:::

### Task 2: Vararg average

Write a function `average(vararg numbers: Double): Double` that returns the
mean of its arguments, or `0.0` if none are given.

::: details Solution
```kotlin
fun average(vararg numbers: Double): Double {
    if (numbers.isEmpty()) return 0.0
    return numbers.sum() / numbers.size
}

fun main() {
    println(average())
    println(average(1.0, 2.0, 3.0))
}
```
:::

### Task 3: Single-expression refactor

Rewrite this function as a single-expression function.

```kotlin-runnable
fun classify(n: Int): String {
    if (n < 0) {
        return "negative"
    } else if (n == 0) {
        return "zero"
    } else {
        return "positive"
    }
}

fun main() {
    println(classify(-5))
    println(classify(0))
    println(classify(5))
}
```

::: details Solution
```kotlin
fun classify(n: Int) = when {
    n < 0 -> "negative"
    n == 0 -> "zero"
    else -> "positive"
}

fun main() {
    println(classify(-5))
    println(classify(0))
    println(classify(5))
}
```
A `when` expression is itself a single expression, so it composes naturally
with the single-expression function syntax.
:::

Next: [Lambdas: a first look](/basics/lambdas-intro)
