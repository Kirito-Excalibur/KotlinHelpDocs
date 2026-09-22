# Inline Functions

You've now used several functions that take a lambda — `filter`, `forEach`,
`sortedBy` — and seen that a `return` inside their lambda can exit the
enclosing function ([non-local return](/functional/lambda-syntax-in-depth)).
That behavior, and a performance concern behind it, both come from the same
keyword: `inline`.

## Why lambdas normally cost something

On the JVM, a lambda is compiled to an object — an instance of a class
implementing a function interface. Every time you write `{ it * 2 }`, at
runtime that can mean allocating an object to hold the lambda's code and any
variables it captured. For a `filter` call in a hot loop, that's a lot of
short-lived objects.

`inline` tells the compiler: instead of compiling this function normally and
passing a lambda object to it, **copy the function's body, and the lambda's
body, directly into the call site** at compile time. No function call, no
lambda object, no allocation.

```kotlin-runnable
inline fun repeatAction(times: Int, action: (Int) -> Unit) {
    for (i in 0 until times) action(i)
}

fun main() {
    repeatAction(3) { i -> println("Run $i") }
}
```

Conceptually, the compiler rewrites the call in `main` into something close
to:

```kotlin
for (i in 0 until 3) println("Run $i")
```

No `action` object is ever created. This is exactly how `filter`, `map`,
`forEach`, and most lambda-taking functions in the standard library are
defined — check their source and you'll find `inline fun` on nearly all of
them.

## Inlining enables non-local returns

This is the other half of the story from the previous chapter. A `return`
inside a lambda can only jump out of the *enclosing function* because, after
inlining, the lambda's code isn't in a separate function anymore — it's
physically pasted into the caller. There's nothing to return "out of"
except the caller itself.

```kotlin-runnable
inline fun forEachPositive(numbers: List<Int>, action: (Int) -> Unit) {
    for (n in numbers) {
        if (n > 0) action(n)
    }
}

fun findFirstOver(numbers: List<Int>, threshold: Int): Int? {
    forEachPositive(numbers) {
        if (it > threshold) return it // non-local return, only legal because forEachPositive is inline
    }
    return null
}

fun main() {
    println(findFirstOver(listOf(1, 5, 12, 3), 10))
}
```

Remove `inline` from `forEachPositive` and this stops compiling — the
compiler will tell you `return` is not allowed there, because a non-inlined
lambda really does become a separate object with no way to jump back out to
`findFirstOver`.

## `noinline`

If an inline function takes *multiple* lambda parameters, you can exempt
specific ones from being inlined with `noinline`. This is required if you
need to store the lambda in a variable, pass it to another (non-inline)
function, or return it — none of which is possible for a lambda that gets
pasted inline, since after inlining it no longer exists as an object.

```kotlin-runnable
inline fun process(data: String, inlined: (String) -> Unit, noinline stored: (String) -> Unit): (String) -> Unit {
    inlined(data)
    return stored
}

fun main() {
    val kept = process(
        "hello",
        inlined = { println("Inline: $it") },
        stored = { println("Stored: $it") }
    )
    kept("world")
}
```

`inlined` gets pasted at the call site as usual. `stored` is marked
`noinline`, so it stays a real object — which is required here, since the
function returns it.

## `crossinline`

Normally, a lambda passed to an inline function is allowed to use a
non-local `return`. But if that lambda is going to be invoked from inside
*another* lambda or a separate execution context (for example, scheduled to
run later), a non-local return wouldn't make sense — the enclosing function
might have already finished. `crossinline` tells the compiler: inline this
parameter as usual, but forbid non-local returns from it.

```kotlin-runnable
inline fun runInBoth(crossinline action: () -> Unit) {
    val wrapper = Runnable { action() } // action is used inside another lambda
    wrapper.run()
}

fun main() {
    runInBoth {
        println("Running")
        // `return` here would be a compile error without crossinline —
        // by the time Runnable invokes this, runInBoth may have already returned.
    }
}
```

Without `crossinline`, this wouldn't even compile, because the compiler
can't guarantee a non-local `return` inside `action` is safe once `action`
is wrapped in another lambda (`Runnable { ... }`) instead of being called
directly.

You won't write `crossinline` and `noinline` often as a beginner, but
recognizing them in stdlib signatures (like `Runnable` interop, or in APIs
that dispatch your lambda to a callback) matters.

## Scope functions: `let`, `run`, `with`, `apply`, `also`

Kotlin's standard library defines five small inline functions — `let`,
`run`, `with`, `apply`, and `also` — collectively called **scope
functions**. Each just executes a lambda in the context of some object; the
only differences are (a) how you refer to that object inside the lambda —
as `this` or as `it` — and (b) what the whole expression returns. Because
they're `inline`, using them costs nothing at runtime beyond the code
they run.

| Function | Object reference | Returns | Typical use |
|---|---|---|---|
| `let` | `it` | lambda result | null-checks, transforming a value into another |
| `run` | `this` | lambda result | grouping a block of calls that returns a computed result |
| `with` | `this` | lambda result | grouping calls on an object you already have (not an extension) |
| `apply` | `this` | the object itself | configuring an object's properties, then keep using it |
| `also` | `it` | the object itself | side effects (logging, validation) without changing the value |

```kotlin-runnable
data class Person(var name: String = "", var age: Int = 0)

fun main() {
    // let: transform a value, referring to it as `it`
    val nameLength = "Kotlin".let { it.length }
    println(nameLength)

    // run: execute a block and get its result back, referring to the receiver as `this`
    val area = run {
        val width = 4
        val height = 5
        width * height
    }
    println(area)

    // with: like run, but called as with(obj) { ... } instead of obj.run { ... }
    val person = Person("Ada", 30)
    val summary = with(person) {
        "$name is $age years old"
    }
    println(summary)

    // apply: configure an object, then get the SAME object back
    val configured = Person().apply {
        name = "Grace"
        age = 40
    }
    println(configured)

    // also: do something with a value (e.g. logging), then get the SAME value back
    val doubled = 21.also { println("About to double $it") }.let { it * 2 }
    println(doubled)
}
```

A quick way to pick one:

- Need the **result of the lambda**, not the original object? Use `let`,
  `run`, or `with`.
- Need the **original object back**, unchanged, after running some code on
  it? Use `apply` or `also`.
- Inside the lambda, want to refer to the object as `this` (so you can drop
  the receiver name, as if you were inside its class)? Use `run`, `with`,
  or `apply`.
- Want to refer to it as `it` instead (useful when you need a name, or when
  shadowing `this` would be confusing)? Use `let` or `also`.

The single most common pattern you'll see is `let` combined with a
[safe call](/basics/nullable-types) to run code only when a value isn't
null:

```kotlin-runnable
fun printLength(text: String?) {
    text?.let {
        println("Length is ${it.length}")
    }
}

fun main() {
    printLength("Kotlin")
    printLength(null) // prints nothing; the lambda never runs
}
```

`text?.let { ... }` only invokes the lambda if `text` is non-null — `?.`
short-circuits to `null` otherwise, and the whole `let` call is skipped.

## Tasks

### Task 1: Build a configured object with `apply`

Given this class:

```kotlin
class Report {
    var title: String = ""
    var author: String = ""
    var pages: Int = 0

    override fun toString() = "\"$title\" by $author ($pages pages)"
}
```

Create a `Report` with `title = "Kotlin Basics"`, `author = "You"`, and
`pages = 42`, using `apply`, in a single expression, and print it.

```kotlin-runnable
class Report {
    var title: String = ""
    var author: String = ""
    var pages: Int = 0

    override fun toString() = "\"$title\" by $author ($pages pages)"
}

fun main() {
    val report = Report() // Your code here
    println(report)
}
```

::: details Solution
```kotlin
class Report {
    var title: String = ""
    var author: String = ""
    var pages: Int = 0

    override fun toString() = "\"$title\" by $author ($pages pages)"
}

fun main() {
    val report = Report().apply {
        title = "Kotlin Basics"
        author = "You"
        pages = 42
    }
    println(report)
}
```
`apply` returns the `Report` instance itself, so `report` ends up holding
the fully configured object — this is the idiomatic replacement for a
multi-argument constructor or a builder class.
:::

### Task 2: Safely print an uppercase name

Write a function `printUpper(name: String?)` that prints the uppercase
version of `name` if it's non-null and non-blank, and does nothing
otherwise. Use `?.let`.

::: details Solution
```kotlin
fun printUpper(name: String?) {
    name?.takeIf { it.isNotBlank() }?.let {
        println(it.uppercase())
    }
}

fun main() {
    printUpper("kotlin")
    printUpper(null)
    printUpper("   ")
}
```
`takeIf { }` returns the value itself if the predicate is true, or `null`
otherwise — chaining it before `let` lets you fold a blank-check into the
same null-safe chain.
:::

Next: [Operator Overloading](/functional/operator-overloading)
