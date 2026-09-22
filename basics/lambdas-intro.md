# Lambdas: a first look

A lambda is a function literal — a block of code you can pass around as a
value, without giving it a name. Kotlin uses them constantly, especially
with collections, so it's worth getting comfortable with the basic syntax
early, even though the full treatment comes later in
[Higher-Order Functions](/functional/higher-order-functions).

## Basic syntax

A lambda is written in curly braces, with parameters (if any) before a `->`,
and the body after it.

```kotlin-runnable
fun main() {
    val double = { x: Int -> x * 2 }
    println(double(5))
}
```

`double` here is a variable holding a function value. You can call it just
like a regular function, with parentheses.

## Passing lambdas to functions

Lambdas become useful when passed to another function that expects one —
most commonly, collection operations like `filter` and `map`.

```kotlin-runnable
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5, 6)

    val evens = numbers.filter({ n -> n % 2 == 0 })
    println(evens)
}
```

`filter` takes a lambda that returns `true` to keep an element, `false` to
drop it. `map` takes a lambda that transforms each element into something
new:

```kotlin-runnable
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)

    val doubled = numbers.map({ n -> n * 2 })
    println(doubled)
}
```

## Trailing lambda syntax

When a lambda is the *last* parameter of a function call, you can move it
outside the parentheses. If the lambda is the *only* argument, you can drop
the parentheses entirely.

```kotlin-runnable
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5, 6)

    val evens = numbers.filter { n -> n % 2 == 0 }   // no parens needed
    val doubled = numbers.map { n -> n * 2 }

    println(evens)
    println(doubled)
}
```

This is why code like `numbers.filter { ... }` is everywhere in idiomatic
Kotlin — it reads almost like a built-in language keyword rather than a
function call with an argument.

## The implicit parameter `it`

When a lambda takes exactly one parameter and you don't need to name it,
Kotlin lets you refer to it as `it` and skip the `param ->` part entirely.

```kotlin-runnable
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5, 6)

    val evens = numbers.filter { it % 2 == 0 }
    val squared = numbers.map { it * it }

    println(evens)
    println(squared)
}
```

`it` is a real convenience, not just a style choice — it removes the need to
invent a throwaway name for short, single-purpose lambdas. If a lambda gets
long enough that `it` starts to hurt readability, name the parameter
explicitly (`{ number -> ... }`) instead; there's no rule forcing you to use
`it`.

## Chaining

Because `filter`, `map`, and similar functions return a new list, you can
chain them fluently:

```kotlin-runnable
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)

    val result = numbers
        .filter { it % 2 == 0 }
        .map { it * it }

    println(result)
}
```

This barely scratches the surface — `it`, multi-line lambdas, function
types, closures, and functions that return functions are all covered fully
in [Higher-Order Functions](/functional/higher-order-functions). For now,
just recognize `{ ... }` and `{ it ... }` as "a small function passed as a
value" whenever you see them.

## Tasks

### Task 1: Filter with a lambda

Given `listOf(3, 8, 15, 22, 4, 11)`, use `filter` with trailing lambda
syntax to keep only values greater than 10, and print the result.

```kotlin-runnable
fun main() {
    val numbers = listOf(3, 8, 15, 22, 4, 11)
    // Your code here
}
```

::: details Solution
```kotlin
fun main() {
    val numbers = listOf(3, 8, 15, 22, 4, 11)
    val big = numbers.filter { it > 10 }
    println(big)
}
```
:::

### Task 2: Map and filter chained

Given `listOf("kotlin", "is", "fun", "to", "learn")`, use `map` to get the
length of each word, then `filter` to keep only lengths greater than 2, and
print the final list.

::: details Solution
```kotlin
fun main() {
    val words = listOf("kotlin", "is", "fun", "to", "learn")

    val result = words
        .map { it.length }
        .filter { it > 2 }

    println(result)
}
```
:::

### Task 3: Named parameter vs `it`

Write a lambda stored in a variable `isVowel` that takes a `Char` and
returns whether it's one of `a, e, i, o, u` (case-insensitive), using an
explicitly named parameter instead of `it`. Use it with `filter` on the
string `"Kotlin"` (treated as a `Char` sequence) to print only its vowels.

::: details Solution
```kotlin
fun main() {
    val isVowel = { c: Char -> c.lowercaseChar() in "aeiou" }

    val vowels = "Kotlin".filter(isVowel)
    println(vowels)
}
```
An explicit parameter name (`c` here) is often clearer than `it` once the
lambda references the parameter more than once or the logic isn't trivial.
:::

Next: [Null Safety](/basics/nullable-types)
