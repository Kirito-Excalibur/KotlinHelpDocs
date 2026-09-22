# Nested & Inner Classes

Declaring one class inside another works in Kotlin, but the default
behavior flips compared to Java — and this is easy to get wrong if you
carry Java assumptions over.

## Nested classes are static by default

In Java, a class declared inside another class implicitly holds a hidden
reference to an instance of the outer class, unless you explicitly mark it
`static`. In Kotlin, it's the reverse: a nested class has **no** reference
to an outer instance by default, and behaves like a Java `static` nested
class automatically.

```kotlin-runnable
class Outer {
    val outerProperty = "I'm in Outer"

    class Nested {
        fun greet() = "Hello from Nested"
    }
}

fun main() {
    // No Outer instance needed to create a Nested
    val nested = Outer.Nested()
    println(nested.greet())
}
```

Notice you construct it as `Outer.Nested()` — through the outer class's
name, not through an instance of `Outer` — and `Nested` has no way to touch
`outerProperty` even if it wanted to; there's no outer instance available
to it at all.

## `inner class`: when you need the outer reference

If you *do* need access to the enclosing instance's properties and
functions, mark the nested class `inner`. Now it holds an implicit
reference to the specific `Outer` instance it was created from — matching
Java's default nested-class behavior:

```kotlin-runnable
class Outer(val name: String) {
    inner class Inner {
        fun describe() = "Inner class of Outer named $name"
    }
}

fun main() {
    val outer = Outer("MyOuter")
    val inner = outer.Inner() // constructed FROM an outer instance
    println(inner.describe())
}
```

Two syntax differences to notice: you construct an `inner class` via
`outer.Inner()` (through an instance, using dot syntax), not
`Outer.Inner()`; and only `inner class` can implicitly read `name` from its
enclosing `Outer` — a plain nested class cannot.

## `this@Outer`: disambiguating `this`

Inside an `inner class`, plain `this` refers to the inner instance, same as
always. To explicitly reach the enclosing instance's `this` — typically
because a property or parameter name is shadowed — use the qualified form
`this@OuterClassName`:

```kotlin-runnable
class Outer(val name: String) {
    inner class Inner(val name: String) {
        fun describe(): String {
            return "Inner's name is $name, Outer's name is ${this@Outer.name}"
        }
    }
}

fun main() {
    val outer = Outer("outer-value")
    val inner = outer.Inner("inner-value")
    println(inner.describe())
}
```

## Why the default flip matters

Java nested classes silently hold an outer reference unless you remember to
add `static` — a common source of accidental memory leaks (the nested
instance can keep the entire outer instance alive longer than intended) and
unnecessary coupling. Kotlin makes the *lightweight, decoupled* option the
default, and requires you to opt in to the outer reference explicitly with
`inner` only when you actually need it. When in doubt, leave a nested class
as a plain nested class; only add `inner` once you actually reference
something from the enclosing instance.

## Local classes, briefly

You can also declare a class inside a function body. It behaves like a
nested class in a very small scope, and can capture `val`s from the
enclosing function just like a lambda would:

```kotlin-runnable
fun makeGreeter(greeting: String): () -> String {
    class Greeter {
        fun greet() = "$greeting!"
    }
    val greeter = Greeter()
    return { greeter.greet() }
}

fun main() {
    val greet = makeGreeter("Hello")
    println(greet())
}
```

Local classes are relatively rare in everyday Kotlin — an object expression
(see [Object Expressions & Declarations](/oop/object-expressions-and-declarations))
or a lambda usually covers the same need more concisely — but they're
available when you need a small class with real named methods, scoped
entirely to one function.

## Tasks

### Task 1: Plain nested class

Define `class Library(val name: String)` containing a nested (non-inner)
`class Book(val title: String)` with a function `fun describe() = "Book:
$title"`. Construct a `Book` from `main` without creating any `Library`
instance.

```kotlin-runnable
// Your code here

fun main() {

}
```

::: details Solution
```kotlin
class Library(val name: String) {
    class Book(val title: String) {
        fun describe() = "Book: $title"
    }
}

fun main() {
    val book = Library.Book("Kotlin in Action")
    println(book.describe())
}
```
:::

### Task 2: Inner class referencing the outer instance

Define `class Team(val teamName: String)` containing `inner class
Player(val playerName: String)` with a function `fun describe() =
"$playerName plays for $teamName"` that reads `teamName` from the enclosing
`Team`. Create a `Team`, then a `Player` from it, and print the description.

::: details Solution
```kotlin
class Team(val teamName: String) {
    inner class Player(val playerName: String) {
        fun describe() = "$playerName plays for $teamName"
    }
}

fun main() {
    val team = Team("Ravens")
    val player = team.Player("Ada")
    println(player.describe())
}
```
:::

Next: [Delegation](/oop/delegation)
