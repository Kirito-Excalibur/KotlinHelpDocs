# Dispatchers & Context

Every coroutine runs *in* a `CoroutineContext`. So far you've been relying
on defaults; this chapter looks at what a context actually is and how to
control which thread(s) your coroutine runs on.

## What is a `CoroutineContext`?

A `CoroutineContext` is a set of elements — think of it like a small
type-safe map — that together describe how and where a coroutine runs. The
two elements you'll interact with most are the **dispatcher** (which
thread or thread pool runs the coroutine) and the **`Job`** (the handle
used for lifecycle and cancellation, covered in the previous two chapters).
A context can also carry a name for debugging, an exception handler
(covered next chapter), and more.

You combine context elements with `+`:

```kotlin-runnable
import kotlinx.coroutines.*

fun main() = runBlocking {
    launch(Dispatchers.Default + CoroutineName("worker")) {
        println("Running on ${Thread.currentThread().name}")
    }
}
```

Combining with `+` overrides only the elements you specify — everything else
is inherited from the parent coroutine's context. That inheritance is part
of structured concurrency: a child coroutine's context is the parent's
context plus whatever overrides you pass to the builder.

## The standard dispatchers

`kotlinx.coroutines` ships with a handful of ready-made dispatchers, each
suited to a different kind of work:

- **`Dispatchers.Default`** — a thread pool sized to the number of CPU
  cores, meant for CPU-intensive work: sorting large lists, parsing,
  computing, anything that keeps a thread genuinely busy.
- **`Dispatchers.IO`** — a larger, elastic thread pool meant for blocking
  I/O: file access, blocking network calls, JDBC queries — work that spends
  most of its time waiting rather than computing, so it's fine to have more
  threads than CPU cores.
- **`Dispatchers.Main`** — the UI thread on platforms that have one
  (Android, Swing, JavaFX). It's provided by a separate platform-specific
  artifact, not the core library, since a plain JVM console app has no
  "main" UI thread to speak of.

```kotlin-runnable
import kotlinx.coroutines.*

fun main() = runBlocking {
    launch(Dispatchers.Default) {
        println("Default: ${Thread.currentThread().name}")
    }
    launch(Dispatchers.IO) {
        println("IO: ${Thread.currentThread().name}")
    }
    launch {
        // No dispatcher specified: inherits runBlocking's dispatcher,
        // which runs on the thread that called runBlocking.
        println("Inherited: ${Thread.currentThread().name}")
    }
}
```

Picking the right dispatcher matters: running blocking I/O on
`Dispatchers.Default` can starve the small CPU-sized pool of threads needed
for actual computation elsewhere in your app, and running heavy computation
on `Dispatchers.IO` wastes its larger thread count on work that doesn't
benefit from it.

## Switching dispatchers with `withContext`

You rarely want an entire function pinned to one dispatcher — typically you
want to do a specific chunk of work on a specific dispatcher, then return to
wherever you were. `withContext` suspends the current coroutine, switches to
the given context for its block, and switches back automatically when the
block finishes — all without spawning a new coroutine or a new `Job`.

```kotlin-runnable
import kotlinx.coroutines.*

suspend fun loadAndProcess(): Int {
    val raw = withContext(Dispatchers.IO) {
        println("Loading on ${Thread.currentThread().name}")
        "42" // pretend this came from a blocking file read
    }
    return withContext(Dispatchers.Default) {
        println("Processing on ${Thread.currentThread().name}")
        raw.toInt() * 2
    }
}

fun main() = runBlocking {
    println("Result: ${loadAndProcess()}")
}
```

This is the idiomatic way to write a `suspend` function that does some
blocking or CPU-heavy work: don't make the *caller* choose a dispatcher —
have the function switch internally with `withContext` for just the part
that needs it, so it's safe to call from anywhere.

## Context is inherited, not global

Because context flows from parent to child, a `launch` or `async` nested
inside a `withContext(Dispatchers.IO) { ... }` block also runs on
`Dispatchers.IO`, unless it specifies its own dispatcher:

```kotlin-runnable
import kotlinx.coroutines.*

fun main() = runBlocking {
    withContext(Dispatchers.IO) {
        println("Outer: ${Thread.currentThread().name}")
        launch {
            println("Inherited IO: ${Thread.currentThread().name}")
        }
        launch(Dispatchers.Default) {
            println("Overridden to Default: ${Thread.currentThread().name}")
        }
    }
}
```

There's no single "current dispatcher" global variable being mutated
anywhere — each coroutine simply carries its own context, inherited down
the structured-concurrency tree and overridden locally when you ask.

## Tasks

### Task 1: Move work to the right dispatcher

Write a `suspend fun computeSum(): Int` that runs on `Dispatchers.Default`
and returns the sum of numbers 1 through 1,000,000 (use `.sum()` on an
`IntRange` converted to a list, or a manual loop — either is fine). Call it
from `runBlocking` and print the thread name inside `computeSum` alongside
the result.

```kotlin-runnable
import kotlinx.coroutines.*

suspend fun computeSum(): Int {
    // Your code here
    return 0
}

fun main() = runBlocking {
    println("Sum: ${computeSum()}")
}
```

::: details Solution
```kotlin
import kotlinx.coroutines.*

suspend fun computeSum(): Int = withContext(Dispatchers.Default) {
    println("Computing on ${Thread.currentThread().name}")
    (1..1_000_000).sum()
}

fun main() = runBlocking {
    println("Sum: ${computeSum()}")
}
```
:::

### Task 2: Two dispatchers, one function

Write a `suspend fun fetchAndCompute(): String` that first "loads" a number
by delaying 200ms on `Dispatchers.IO` and producing `10`, then computes its
square on `Dispatchers.Default`, and returns a string like
`"10 squared is 100"`. Print the thread name in each stage.

::: details Solution
```kotlin
import kotlinx.coroutines.*

suspend fun fetchAndCompute(): String {
    val loaded = withContext(Dispatchers.IO) {
        println("Loading on ${Thread.currentThread().name}")
        delay(200L)
        10
    }
    val squared = withContext(Dispatchers.Default) {
        println("Computing on ${Thread.currentThread().name}")
        loaded * loaded
    }
    return "$loaded squared is $squared"
}

fun main() = runBlocking {
    println(fetchAndCompute())
}
```
Each `withContext` call suspends until its block finishes and hands the
result back to the calling coroutine, which then resumes on its original
dispatcher — here, `runBlocking`'s thread — for the final `return`.
:::

Next: [Exception Handling](/coroutines/exception-handling)
