# Nullability In Depth

[Null Safety](/basics/nullable-types) introduced `?`, `?.`, and `?:`. This
chapter covers the sharper edges: what happens at the boundary with Java,
how the compiler proves a nullable value is safe to use, and how to fail
loudly and clearly when a value that should never be null turns out to be.

## Platform types

When Kotlin code calls into a Java library, the Java type system has no
concept of nullability — a `String` returned from a Java method might or
might not be null, and there's no annotation guaranteeing either way (unless
the Java code uses `@Nullable`/`@NotNull`). Kotlin can't safely treat that
return value as either `String` or `String?`, so it invents a third
category: a **platform type**, written `String!` in error messages and IDE
tooltips (you can never write `!` in your own source code).

```kotlin-runnable
fun main() {
    // java.lang.System.getProperty returns a platform type: String!
    val value = System.getProperty("user.home")

    // Kotlin lets you treat it as non-null...
    println(value.length)

    // ...or as nullable. Both compile. The compiler trusts you either way.
    val safeValue: String? = System.getProperty("does.not.exist")
    println(safeValue?.length ?: -1)
}
```

A platform type suppresses Kotlin's null checks for that one expression —
you decide whether to treat it as nullable or not. Get it wrong (treat a
genuinely-null value as non-null) and you get an NPE at the point of use,
same as Java would give you, rather than a compile error. This is the one
place Kotlin's null safety doesn't fully protect you, precisely because the
guarantee has to come from Java code Kotlin doesn't control. The practical
rule: when calling Java APIs, check their documentation or annotations, and
lean toward treating unannotated return values as nullable unless you have a
good reason not to.

## Smart casts

Once you've checked that a nullable value isn't null, the compiler
remembers, and lets you use it as the non-null type for the rest of that
scope — no explicit cast needed. This is a **smart cast**, and it isn't
limited to null checks; it works for any `is` type check too.

```kotlin-runnable
fun describe(text: String?) {
    if (text == null) {
        println("nothing to describe")
        return
    }
    // From here on, the compiler knows `text` is `String`, not `String?`.
    println("Length is ${text.length}")
}

fun describeAny(value: Any) {
    if (value is String) {
        // smart-cast to String
        println("String of length ${value.length}")
    } else if (value is Int) {
        // smart-cast to Int
        println("Int doubled is ${value * 2}")
    }
}

fun main() {
    describe(null)
    describe("Kotlin")
    describeAny("hello")
    describeAny(21)
}
```

Smart casts also work with `&&`/`||` short-circuiting and inside the `?:`
idiom:

```kotlin-runnable
fun main() {
    val text: String? = "hello"
    if (text != null && text.length > 3) {
        println("${text.uppercase()} is long enough")
    }
}
```

### Why smart casts sometimes fail

Smart casting relies on the compiler being *certain* the value can't have
changed between the check and the use. That certainty breaks down in two
common situations:

**A `var` property**, especially one visible outside the current function,
could theoretically be reassigned by another thread between your null check
and your usage — the compiler can't rule that out, so it refuses to smart
cast:

```kotlin-runnable
class Widget {
    var label: String? = null
}

fun printLabel(widget: Widget) {
    if (widget.label != null) {
        // Error in real Kotlin: "Smart cast to 'String' is impossible,
        // because 'widget.label' is a mutable property"
        // println(widget.label.length)

        // Fix: copy it to a local val first.
        val label = widget.label
        if (label != null) {
            println(label.length)
        }
    }
}

fun main() {
    printLabel(Widget().apply { label = "Save" })
}
```

**A property with a custom getter** is worse: the getter is a function that
runs on every access and could return something different each time (say, a
value read from a mutable field, or computed from the clock), so a null
check on one call tells the compiler nothing about the *next* call:

```kotlin
class Request {
    val body: String?
        get() = if (System.nanoTime() % 2L == 0L) "data" else null
}
```

`val` properties with the *default* getter (i.e., ones that just return a
backing field, and aren't `open` in a way that lets a subclass override the
getter) are fine — the compiler can trust those. Local `val`s are always
fine too, which is why "copy to a local `val` first" is the standard
workaround for both cases above.

## The `?: return` / `?: throw` idiom

This is one of the most common patterns in real Kotlin code: unwrap a
nullable value at the top of a function, and bail out immediately if it's
missing, so the rest of the function can work with the non-null type.

```kotlin-runnable
data class User(val id: Int, val email: String?)

fun sendWelcomeEmail(user: User) {
    val email = user.email ?: run {
        println("User ${user.id} has no email on file, skipping")
        return
    }
    // `email` is non-null String from here on.
    println("Sending welcome email to $email")
}

fun main() {
    sendWelcomeEmail(User(1, "ada@example.com"))
    sendWelcomeEmail(User(2, null))
}
```

For a function returning a value, `?: return someDefault` reads naturally,
and `?: throw SomeException(...)` turns a missing value into a clear failure
instead of letting a `NullPointerException` surface later, far from its
actual cause:

```kotlin-runnable
fun firstWordOf(sentence: String?): String {
    val trimmed = sentence?.trim() ?: return "(empty)"
    return trimmed.substringBefore(" ")
}

fun main() {
    println(firstWordOf("Kotlin is fun"))
    println(firstWordOf(null))
}
```

## `requireNotNull` and `checkNotNull`

The standard library has two functions built specifically for "unwrap this
or fail with a clear message," saving you from writing `?: throw
IllegalArgumentException(...)` by hand every time.

- `requireNotNull` throws `IllegalArgumentException` — use it for **inputs**
  (arguments, constructor parameters) that the caller got wrong.
- `checkNotNull` throws `IllegalStateException` — use it for values that
  *should* be non-null based on the object's own internal invariants, not
  the caller's input.

```kotlin-runnable
fun greet(name: String?) {
    val validName = requireNotNull(name) { "name must not be null" }
    println("Hello, $validName!")
}

class LazyConfig {
    private var loaded: String? = null

    fun load() {
        loaded = "config-data"
    }

    fun get(): String {
        // If this is null, it's a bug in LazyConfig itself (load() wasn't
        // called), not bad input from a caller — hence checkNotNull.
        return checkNotNull(loaded) { "load() must be called before get()" }
    }
}

fun main() {
    greet("Ada")

    val config = LazyConfig()
    config.load()
    println(config.get())
}
```

Both functions also smart-cast: after `requireNotNull(name)` succeeds, the
compiler knows the returned value is non-null, and if you call them on a
variable directly (like `requireNotNull(loaded)`), later reads of that
variable in the same scope benefit too, subject to the same `var`/custom
getter rules described above.

## `Result<T>`: an alternative to exceptions

For failures that are a routine, expected part of an operation — parsing
user input, making a network call — throwing and catching exceptions can be
overkill, and it hides all failure paths from the function's signature.
The standard library's `Result<T>` wraps either a success value or an
exception, forcing callers to acknowledge both outcomes at the type level:

```kotlin-runnable
fun parseAge(text: String): Result<Int> {
    return runCatching { text.toInt() }
}

fun main() {
    val results = listOf("25", "not a number", "40")

    for (text in results) {
        val result = parseAge(text)
        result
            .onSuccess { age -> println("Parsed age: $age") }
            .onFailure { e -> println("Failed to parse '$text': ${e.message}") }
    }

    // getOrNull / getOrDefault / getOrElse are also available:
    val age = parseAge("oops").getOrDefault(-1)
    println("Fallback age: $age")
}
```

`Result` is most useful at API boundaries where you want failure to be part
of the return type rather than a hidden control-flow jump — it's a similar
philosophy to how `String?` makes "might not have a value" part of the type
instead of a runtime surprise. It's not a wholesale replacement for
exceptions (unexpected, unrecoverable errors should still just throw), but
for expected, recoverable failures it's often clearer than `try`/`catch` at
every call site.

## Tasks

### Task 1: Fix the smart cast

The following doesn't compile as written, because `label` is a mutable
`var` property. Rewrite `describe` so it compiles, using a local `val` to
capture the smart-castable value.

```kotlin-runnable
class Ticket {
    var label: String? = "Open"
}

fun describe(ticket: Ticket) {
    // Fix this function so it compiles and prints the label's length,
    // or "no label" if null.
    println(ticket.label)
}

fun main() {
    describe(Ticket())
}
```

::: details Solution
```kotlin
class Ticket {
    var label: String? = "Open"
}

fun describe(ticket: Ticket) {
    val label = ticket.label
    if (label != null) {
        println("Length: ${label.length}")
    } else {
        println("no label")
    }
}

fun main() {
    describe(Ticket())
}
```
Copying `ticket.label` into the local `val label` gives the compiler a value
it knows can't change out from under it, so the null check smart-casts.
:::

### Task 2: Validate with `requireNotNull` and `Result`

Write a function `divide(a: Int, b: Int?): Result<Int>` that returns a
`Result` wrapping `a / b` if `b` is non-null and non-zero, or a failure
wrapping an `IllegalArgumentException` with a descriptive message otherwise.
Use `requireNotNull` and `require` (or `runCatching`) rather than manual
`if`/`throw`.

```kotlin-runnable
fun divide(a: Int, b: Int?): Result<Int> {
    // Your code here
    return Result.success(0)
}

fun main() {
    println(divide(10, 2))
    println(divide(10, 0))
    println(divide(10, null))
}
```

::: details Solution
```kotlin
fun divide(a: Int, b: Int?): Result<Int> = runCatching {
    val divisor = requireNotNull(b) { "divisor must not be null" }
    require(divisor != 0) { "divisor must not be zero" }
    a / divisor
}

fun main() {
    println(divide(10, 2))
    println(divide(10, 0))
    println(divide(10, null))
}
```
`runCatching` catches any exception thrown inside its block — including the
`IllegalArgumentException` from `requireNotNull`/`require` — and packages it
into a failed `Result`, so you get the exception-based checks *and* a
`Result`-based return type at once.
:::

Next: [Introduction](/coroutines/introduction)
