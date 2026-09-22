# Exceptions

Kotlin's exception model looks like Java's on the surface — `try`, `catch`,
`finally`, `throw`, a class hierarchy rooted at `Throwable` — but a couple of
deliberate differences change how you write error-handling code day to day.

## The basics

```kotlin-runnable
fun main() {
    val numbers = listOf("1", "2", "oops", "4")

    for (text in numbers) {
        try {
            val n = text.toInt()
            println("Parsed: $n")
        } catch (e: NumberFormatException) {
            println("Could not parse '$text': ${e.message}")
        } finally {
            println("  (checked '$text')")
        }
    }
}
```

`finally` runs whether the `try` block succeeds, throws, or even returns —
same as in Java, C#, or Python.

You can catch multiple exception types by stacking `catch` clauses, and
`catch` matches subtypes, so order them from most specific to least specific,
just like anywhere else.

## `try` as an expression

Because Kotlin favors expressions (see [Hello, World!](/getting-started/hello-world)),
`try` can produce a value. The value is whatever the last expression in the
chosen branch evaluates to:

```kotlin-runnable
fun parseIntOrZero(text: String): Int {
    return try {
        text.toInt()
    } catch (e: NumberFormatException) {
        0
    }
}

fun main() {
    println(parseIntOrZero("42"))
    println(parseIntOrZero("not a number"))
}
```

If you use `try` this way, every branch you care about needs to produce a
compatible type — the compiler infers the result type as the common
supertype of the `try` block and every `catch` block.

## `throw` is an expression too

`throw` produces a value of type `Nothing` (more on that below), which means
you can use it anywhere an expression is expected — including on the right
side of the Elvis operator:

```kotlin-runnable
fun requirePositive(n: Int): Int {
    return if (n > 0) n else throw IllegalArgumentException("must be positive, got $n")
}

fun findUser(id: Int, ids: List<Int>): Int {
    val index = ids.indexOf(id)
    val found = if (index >= 0) index else throw NoSuchElementException("no user $id")
    return found
}

fun main() {
    println(requirePositive(5))

    val maybeName: String? = null
    val name = maybeName ?: throw IllegalStateException("name was required")
    println(name)
}
```

That last line won't actually run — `throw` there aborts execution before
`println` is reached. This `?: throw` (and its cousin `?: return`) is an
extremely common Kotlin idiom, and you'll see it a lot more in
[Nullability In Depth](/error-handling/nullability-in-depth).

## No checked exceptions

This is the biggest departure from Java: **Kotlin has no checked
exceptions**. Every exception in Kotlin is effectively a `RuntimeException`
as far as the compiler is concerned — there is no `throws` clause, and
nothing forces a caller to catch or declare anything.

```kotlin-runnable
import java.io.IOException

fun readConfig(): String {
    // Kotlin: no `throws IOException` needed, and none is enforced.
    throw IOException("file not found")
}

fun main() {
    // This compiles perfectly fine even though readConfig() can throw —
    // Kotlin never makes you prove you've handled it.
    println("About to call readConfig()")
    try {
        readConfig()
    } catch (e: IOException) {
        println("Caught: ${e.message}")
    }
}
```

JetBrains made this choice deliberately, based on experience with large Java
codebases. Checked exceptions sound good in theory — the compiler forces you
to handle failure — but in practice they push developers toward one of two
bad habits: swallowing exceptions with an empty `catch` block just to satisfy
the compiler, or declaring `throws Exception` everywhere and defeating the
whole point. Checked exceptions also don't scale across lambdas and generic
code, which is central to how Kotlin is used. So Kotlin drops the compiler
enforcement entirely and treats exception handling as a matter of API design
and documentation (via KDoc's `@throws`), not compiler-checked types.

This doesn't mean Kotlin is careless about failure — quite the opposite: it
pushes you toward *encoding* expected failure directly in the type system
(nullable types, sealed classes, `Result<T>`) rather than relying on
exceptions for things that aren't truly exceptional. More on that in the next
chapter.

## Custom exceptions

Define one by extending `Exception` (or a more specific subclass) like any
other class:

```kotlin-runnable
class InsufficientFundsException(
    val shortfall: Double
) : Exception("Insufficient funds: short by $shortfall")

class Account(var balance: Double) {
    fun withdraw(amount: Double) {
        if (amount > balance) {
            throw InsufficientFundsException(amount - balance)
        }
        balance -= amount
    }
}

fun main() {
    val account = Account(balance = 100.0)
    try {
        account.withdraw(150.0)
    } catch (e: InsufficientFundsException) {
        println(e.message)
        println("Short by exactly ${e.shortfall}")
    }
}
```

Because `Exception` is a regular class, your custom exception can have its
own constructor parameters, properties, and even methods — it's not a
special language construct.

## `Nothing`: the type of "never returns normally"

`throw someException` has type `Nothing`. `Nothing` is a real type in
Kotlin's type hierarchy — a subtype of *every* other type — that has no
instances. A function declared to return `Nothing` is promising the compiler
it will never complete normally: it either always throws, or loops forever.

```kotlin-runnable
fun fail(message: String): Nothing {
    throw IllegalStateException(message)
}

fun getFirstChar(text: String): Char {
    if (text.isEmpty()) {
        fail("text must not be empty")
    }
    // The compiler knows the call above never returns, so it knows
    // `text` is non-empty here — no "missing return" error.
    return text[0]
}

fun main() {
    println(getFirstChar("Kotlin"))
}
```

Because `Nothing` is a subtype of everything, code like
`val x = condition ?: fail("...")` type-checks: the compiler treats the
`fail(...)` branch as compatible with whatever type `x` needs to be, since a
branch that can produce *no* value at all is trivially compatible with any
expected type. The standard library's `TODO()` function is declared to
return `Nothing` for exactly this reason — it lets you stub out a function
body without upsetting the type checker.

## Tasks

### Task 1: Validate and parse

Write a function `parsePositiveInt(text: String): Int` that parses `text` as
an integer and throws `IllegalArgumentException` (with a useful message) if
the text isn't a valid integer, or if the parsed value isn't positive.
Otherwise it returns the parsed value.

```kotlin-runnable
fun parsePositiveInt(text: String): Int {
    // Your code here
    return 0
}

fun main() {
    println(parsePositiveInt("42"))
    try {
        parsePositiveInt("-3")
    } catch (e: IllegalArgumentException) {
        println("Rejected: ${e.message}")
    }
    try {
        parsePositiveInt("abc")
    } catch (e: IllegalArgumentException) {
        println("Rejected: ${e.message}")
    }
}
```

::: details Solution
```kotlin
fun parsePositiveInt(text: String): Int {
    val n = text.toIntOrNull() ?: throw IllegalArgumentException("'$text' is not a valid integer")
    if (n <= 0) throw IllegalArgumentException("'$text' must be positive")
    return n
}

fun main() {
    println(parsePositiveInt("42"))
    try {
        parsePositiveInt("-3")
    } catch (e: IllegalArgumentException) {
        println("Rejected: ${e.message}")
    }
    try {
        parsePositiveInt("abc")
    } catch (e: IllegalArgumentException) {
        println("Rejected: ${e.message}")
    }
}
```
`toIntOrNull()` avoids catching `NumberFormatException` directly — it turns
a parse failure into `null`, which pairs naturally with `?: throw`.
:::

### Task 2: A custom exception hierarchy

Define a sealed-style exception hierarchy for a simple validation system:
a base class `ValidationException(message: String)` extending `Exception`,
and two subclasses, `TooShortException(minLength: Int)` and
`TooLongException(maxLength: Int)`, each building an appropriate message via
their superclass constructor. Then write `validateUsername(name: String)`
that throws `TooShortException` if `name.length < 3`, `TooLongException` if
`name.length > 16`, and otherwise does nothing.

::: details Solution
```kotlin
open class ValidationException(message: String) : Exception(message)

class TooShortException(minLength: Int) :
    ValidationException("Username must be at least $minLength characters")

class TooLongException(maxLength: Int) :
    ValidationException("Username must be at most $maxLength characters")

fun validateUsername(name: String) {
    if (name.length < 3) throw TooShortException(3)
    if (name.length > 16) throw TooLongException(16)
}

fun main() {
    for (candidate in listOf("ok", "PerfectlyFine", "ThisUsernameIsWayTooLong")) {
        try {
            validateUsername(candidate)
            println("'$candidate' is valid")
        } catch (e: ValidationException) {
            println("'$candidate' rejected: ${e.message}")
        }
    }
}
```
Catching the common `ValidationException` supertype lets one `catch` clause
handle every specific validation failure — the same pattern you'd use with
any exception hierarchy.
:::

Next: [Nullability In Depth](/error-handling/nullability-in-depth)
