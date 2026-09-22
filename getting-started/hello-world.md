# Hello, World!

Every Kotlin program needs an entry point: a function called `main`.

```kotlin-runnable
fun main() {
    println("Hello, world!")
}
```

A few things to notice, even in this tiny program:

- No class wrapper is required. In Java you'd need
  `public class Main { public static void main(String[] args) { ... } }`.
  In Kotlin, a top-level function is enough.
- No semicolons. Kotlin statements end at a newline; semicolons are optional
  and rarely used.
- `println` is a top-level function from Kotlin's standard library — not a
  static method on some `System.out` object.

## `main` with command-line arguments

If you need command-line arguments, declare `main` with an `Array<String>`
parameter:

```kotlin-runnable
fun main(args: Array<String>) {
    if (args.isEmpty()) {
        println("No arguments were passed.")
    } else {
        println("Arguments: ${args.joinToString()}")
    }
}
```

(In the Playground there's no real command line, so `args` is always empty
here — but this is exactly how you'd write it in a real project.)

## Comments

```kotlin-runnable
fun main() {
    // A single-line comment

    /*
       A multi-line comment.
       Unlike Java, Kotlin's block comments can be nested:
       /* like this */
    */

    println("Comments don't affect execution")
}
```

## Everything is an expression (mostly)

One theme you'll see throughout this tutorial: Kotlin favors *expressions*
(things that produce a value) over *statements* (things that just do
something). You'll see this with `if`, `when`, and `try`, all of which can
produce a value directly. It's a small thing here, but it will show up
constantly later.

```kotlin-runnable
fun main() {
    val hour = 14
    val greeting = if (hour < 12) "Good morning" else "Good afternoon"
    println(greeting)
}
```

## Tasks

### Task 1: Print your name

Write a `main` function that prints `"Hi, I'm learning Kotlin!"` followed by
a second line with your name.

```kotlin-runnable
fun main() {
    // Your code here
}
```

::: details Solution
```kotlin
fun main() {
    println("Hi, I'm learning Kotlin!")
    println("Ada Lovelace")
}
```
:::

### Task 2: Greet by argument, with a fallback

Write a `main(args: Array<String>)` that prints `"Hello, <name>!"` using the
first argument as the name, or `"Hello, stranger!"` if no arguments were
given.

::: details Solution
```kotlin
fun main(args: Array<String>) {
    val name = args.firstOrNull() ?: "stranger"
    println("Hello, $name!")
}
```
This uses the **Elvis operator** `?:`, which you'll meet properly in
[Null Safety](/basics/nullable-types). For now, read it as "or, if that was
null, use this instead."
:::

Next: [Variables](/basics/variables)
