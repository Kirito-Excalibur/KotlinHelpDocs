# Kotlin Idioms

A quick-reference list of small, idiomatic Kotlin patterns. If a line here
doesn't ring a bell, it was covered earlier in the tutorial — use this page
as a reminder, not a first introduction.

## Create a DTO / data class

```kotlin
data class Customer(val name: String, val email: String)
```

Gives you `equals`/`hashCode`, `toString`, `copy`, and component functions
for free.

## Default values for function parameters

```kotlin
fun greet(name: String, greeting: String = "Hello") = "$greeting, $name!"
```

Avoids writing overloads just to fill in common defaults.

## Filter a list

```kotlin
val evens = numbers.filter { it % 2 == 0 }
```

## Check element presence with `in`

```kotlin
if (item in collection) { /* ... */ }
if (item !in collection) { /* ... */ }
```

Works for collections, ranges, and anything with a `contains` operator.

## String interpolation

```kotlin
val name = "Kotlin"
println("Hello, $name!")
println("Length: ${name.length}")
```

## Instance checks with smart cast

```kotlin
if (obj is Foo) {
    obj.bar() // obj is automatically cast to Foo here
}
```

No explicit cast needed after the `is` check — the compiler tracks it.

## `with` for repeated receiver calls

```kotlin
val sb = StringBuilder()
with(sb) {
    append("Hello, ")
    append("world!")
}
```

`with` isn't an extension — it takes the receiver as an argument and runs
the lambda against it, useful for grouping calls to an object you already
have.

## `apply` to configure an object

```kotlin
val paint = Paint().apply {
    color = Color.RED
    strokeWidth = 4f
}
```

`apply` returns the receiver itself, so it reads naturally at the top of a
`val` declaration for "build this, then hand it back."

## Single-expression functions

```kotlin
fun square(x: Int) = x * x
```

No braces, no `return`, no explicit type needed if it can be inferred.

## `?:` (Elvis) for a default value

```kotlin
val name = input ?: "stranger"
```

Evaluates the right side only if the left side is `null`.

## Ranges to check bounds

```kotlin
if (age in 18..65) { /* ... */ }
```

Reads as a bounds check, not two separate comparisons.

## Build a string with `buildString`

```kotlin
val text = buildString {
    append("Items: ")
    items.forEach { append(it).append(", ") }
}
```

Wraps a `StringBuilder` so you can build a string with ordinary statements
instead of chained `+=`.

## `takeIf` / `takeUnless`

```kotlin
val positive = number.takeIf { it > 0 }   // number, or null if it's <= 0
val nonEmpty = text.takeUnless { it.isEmpty() }
```

Useful for turning a condition into a nullable value mid-chain, instead of
breaking out an `if`.

## `also` for side-effect chaining

```kotlin
val result = computeValue()
    .also { println("Computed: $it") }
```

Like `apply`, but with `it` instead of an implicit receiver — good for
logging or asserting without interrupting a chain.

## `TODO()` for unimplemented code

```kotlin
fun notDoneYet(): Int {
    TODO("Implement this once the API is ready")
}
```

Compiles fine (return type is `Nothing`), but throws
`NotImplementedError` if actually called — better than a stub that silently
returns a wrong value.

## Named arguments for readability

```kotlin
createUser(name = "Ada", isAdmin = true, sendWelcomeEmail = false)
```

Especially valuable for functions with several parameters of the same type,
where positional arguments would be easy to mix up.

## Lazy property initialization

```kotlin
val config: Config by lazy {
    loadConfigFromDisk()
}
```

The initializer runs once, on first access, and the result is cached.

## Singletons via `object`

```kotlin
object AppConfig {
    val version = "1.0.0"
    fun load() { /* ... */ }
}
```

One instance, created lazily on first access, no boilerplate
`getInstance()` needed.

Next: [Coding Conventions](/appendix/coding-conventions)
