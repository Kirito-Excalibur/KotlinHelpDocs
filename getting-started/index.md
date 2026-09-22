# Welcome

This is a hands-on tutorial for learning **Kotlin** — a modern, statically-typed
language from JetBrains that runs on the JVM, compiles to JavaScript, and
compiles natively for iOS, Linux, and Windows.

It's organized the way [javascript.info](https://javascript.info/) organizes
JavaScript: short chapters, runnable examples you can edit right on the page,
and practice tasks with hidden solutions at the end of most chapters. The
topics themselves follow the structure of the
[official Kotlin documentation](https://kotlinlang.org/docs/home.html), but
everything here is rewritten from scratch as a guided walkthrough rather than
a reference manual.

## Who this is for

You should already know how to program in *some* language — Java, Python,
JavaScript, Swift, C#, it doesn't matter which. This tutorial won't explain
what a variable or a loop *is* in general; it focuses on how Kotlin does
things, especially where Kotlin differs from the "C-family" languages most
people already know.

## How to read this tutorial

- Work through the **Basics** first — everything later depends on it.
- After that, the **Classes & Objects**, **Functional Programming**,
  **Collections**, **Error Handling**, and **Coroutines** sections are mostly
  independent of each other. Read them in whatever order matches what you're
  trying to build.
- Code blocks with a **Run** button are live. Click it to compile and execute
  the snippet in your browser, courtesy of the official Kotlin Playground.
  Try editing the code before running it — you can't break anything.

```kotlin-runnable
fun main() {
    val name = "Kotlin"
    println("Hello from $name! Try changing this text, then press Run ▶")
}
```

- Chapters ending in a **Tasks** section give you something small to build.
  Try to solve each one yourself before opening the solution.

## What you'll be able to do

By the end of this tutorial you'll be comfortable reading and writing
idiomatic Kotlin: defining classes and data classes, using null safety
instead of `NullPointerException`-driven development, working fluently with
collections and lambdas, handling errors, and writing concurrent code with
coroutines.

Ready? Start with [Installing Kotlin](/getting-started/installing-kotlin).
