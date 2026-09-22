# Variables

Kotlin has two keywords for declaring a variable: `val` and `var`. Picking
the right one is the first idiomatic decision you'll make in almost every
line of Kotlin code.

```kotlin-runnable
fun main() {
    val name = "Ada"       // read-only reference — cannot be reassigned
    var count = 0          // mutable reference — can be reassigned

    count += 1
    println("$name has count $count")
}
```

`val` means the *variable* can only be assigned once — like `final` in Java
or `const` in JavaScript. It says nothing about whether the object it points
to is itself mutable; a `val` holding a `MutableList` still lets you add
items to that list. You just can't point the `val` at a different list. `var`
lets you reassign the variable to a new value at any time.

## Prefer `val`

Try `val` first, and only switch to `var` when the compiler forces you to
(because you genuinely need to reassign it later). This isn't a style
suggestion — it's baked into how the language is written and taught. Kotlin
was designed to make immutability the path of least resistance: `val` is
shorter to type than `final val` would be, and every generated code sample
in the standard library favors it.

```kotlin-runnable
fun main() {
    val price = 19.99
    // price = 24.99   // compile error: val cannot be reassigned

    var stock = 42
    stock -= 1          // fine, stock is a var
    println("Price: $price, stock left: $stock")
}
```

Immutable values are easier to reason about, especially once you introduce
concurrency or pass data between functions — nothing else in the program can
change a `val` out from under you.

## Type inference and explicit types

Kotlin infers the type of a `val` or `var` from its initializer, so you
rarely need to write the type yourself.

```kotlin-runnable
fun main() {
    val language = "Kotlin"   // inferred as String
    val year = 2011           // inferred as Int
    val isFun = true          // inferred as Boolean

    println("$language, since $year, fun = $isFun")
}
```

You can add an explicit type annotation with a colon after the name. This is
required when there's no initializer to infer from, and it's sometimes worth
adding anyway for clarity in a public API or when you want a wider type than
the one Kotlin would infer.

```kotlin-runnable
fun main() {
    val age: Int
    age = 30                 // must assign exactly once, but can be delayed

    val ratio: Double = 5    // widens the Int literal 5 to a Double
    println("$age, $ratio")
}
```

Declaring a `val` without initializing it is legal as long as every code
path assigns it exactly once before it's used — the compiler tracks this
("definite assignment"), it isn't just deferred to a runtime check.

## `const val`: compile-time constants

`val` is evaluated at runtime — the value is computed once, when that line
executes. `const val` goes further: it's a genuine compile-time constant,
inlined at every use site, and it comes with restrictions. It must be a
top-level or object-level declaration (never inside a function), and its
type must be a `String` or a primitive like `Int`, `Double`, or `Boolean`.

```kotlin-runnable
const val MAX_USERS = 100

fun main() {
    println("Limit: $MAX_USERS")
}
```

You'll reach for `const val` for things like configuration ceilings, magic
numbers you want named, or `@Annotation` arguments, which require a
compile-time constant. Ordinary `val` is what you use for everything else —
including anything computed from a function call.

## Naming conventions

Kotlin follows the same broad conventions as Java: `camelCase` for variables
and functions, `PascalCase` for classes, and `SCREAMING_SNAKE_CASE` for
top-level or `const val` constants that behave like fixed configuration.

```kotlin-runnable
const val DEFAULT_TIMEOUT_MS = 30_000

fun main() {
    var retryCount = 0
    val userName = "grace"
    println("$userName, timeout=$DEFAULT_TIMEOUT_MS, retries=$retryCount")
}
```

Regular `val`s that happen to hold unchanging data (like `val name = "Ada"`
inside a function) still use `camelCase` — `SCREAMING_SNAKE_CASE` is reserved
for `const val` and enum constants, not for every read-only local variable.

## Tasks

### Task 1: Fix the compile error

The following snippet doesn't compile. Find the problem and fix it using the
smallest possible change.

```kotlin-runnable
fun main() {
    val total = 100
    total = total - 10
    println(total)
}
```

::: details Solution
```kotlin
fun main() {
    var total = 100
    total = total - 10
    println(total)
}
```
`total` is reassigned after its initial declaration, so it can't be a `val`.
Switching it to `var` is the minimal fix. (An alternative that keeps `val`
would be to compute the final value directly: `val total = 100 - 10`.)
:::

### Task 2: Declare a constant

Declare a top-level compile-time constant `SPEED_OF_LIGHT_KMS` holding
`299_792` (kilometers per second, using an underscore for readability), then
print a sentence that uses it.

::: details Solution
```kotlin
const val SPEED_OF_LIGHT_KMS = 299_792

fun main() {
    println("Light travels at $SPEED_OF_LIGHT_KMS km/s")
}
```
Underscores in numeric literals are purely visual — the compiler ignores
them. You'll see more of this in [Basic Types](/basics/basic-types).
:::

### Task 3: Delayed initialization

Write a `main` function that declares `val greeting: String` without an
initializer, then assigns it inside an `if`/`else` block based on a `Boolean`
variable `isMorning`, and finally prints it.

::: details Solution
```kotlin
fun main() {
    val isMorning = true
    val greeting: String

    if (isMorning) {
        greeting = "Good morning!"
    } else {
        greeting = "Good evening!"
    }

    println(greeting)
}
```
The compiler accepts this because every branch assigns `greeting` exactly
once before it's read — definite assignment, not just "assigned somewhere."
A more idiomatic version would use `if` as an expression instead, which
you'll see in [Conditions: if and when](/basics/conditions).
:::

Next: [Basic Types](/basics/basic-types)
