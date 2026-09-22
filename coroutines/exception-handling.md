# Exception Handling

Exceptions thrown inside a coroutine don't behave quite the way you'd expect
from `try`/`catch` alone — how they propagate depends heavily on whether the
coroutine was started with `launch` or `async`, and structured concurrency
means a single failure can bring down a lot more than the coroutine that
threw it.

## `launch`: exceptions propagate immediately

A coroutine started with `launch` is fire-and-forget — nothing is waiting to
receive a result. So when it throws, there's no natural place to "catch" it
at the call site; instead, the exception propagates up to the parent
coroutine immediately, as soon as it's thrown, and by default crashes the
whole scope (and, in a plain program, the app).

```kotlin-runnable
import kotlinx.coroutines.*

fun main() = runBlocking {
    launch {
        println("About to fail")
        throw RuntimeException("boom")
    }
    // This never gets a chance to print — the exception has already
    // brought down the runBlocking scope by the time we'd reach it.
    delay(500L)
    println("This won't print")
}
```

Wrapping the `launch { ... }` call itself in `try`/`catch` does **not**
help — the coroutine's body runs independently, and by the time it throws,
the `try` around `launch` has already returned:

```kotlin-runnable
import kotlinx.coroutines.*

fun main() = runBlocking {
    try {
        launch {
            throw RuntimeException("boom")
        }
    } catch (e: Exception) {
        // Never reached.
        println("Caught: ${e.message}")
    }
    delay(100L)
}
```

If you want to react to a failure inside the coroutine itself, put the
`try`/`catch` *inside* the `launch` block, around the code that can throw.

## `async`: exceptions are deferred until `await()`

`async` behaves differently because it *does* have a natural place for the
exception to surface: the call to `.await()`. An exception thrown inside an
`async` block is stored in the resulting `Deferred` and re-thrown when (and
only when) you call `.await()` on it.

```kotlin-runnable
import kotlinx.coroutines.*

fun main() = runBlocking {
    val deferred = async {
        println("Computing...")
        throw RuntimeException("computation failed")
        @Suppress("UNREACHABLE_CODE") 42
    }

    delay(100L)
    println("Deferred started, exception hasn't surfaced yet")

    try {
        deferred.await()
    } catch (e: RuntimeException) {
        println("Caught at await(): ${e.message}")
    }
}
```

This means a top-level `async` whose result is never awaited can silently
swallow an exception — worth remembering if you use `async` purely for its
concurrency and never actually call `.await()`.

## `CoroutineExceptionHandler`

For `launch`ed coroutines (where there's no `.await()` to catch around),
you can install a `CoroutineExceptionHandler` in the context to handle
otherwise-uncaught exceptions in a central place — logging them, reporting
them, etc. It's invoked only for exceptions that would otherwise propagate
uncaught out of a `launch` (or a coroutine's own top-level scope); it is
**not** invoked for `async`, since `async` always defers its exception to
`.await()` instead.

```kotlin-runnable
import kotlinx.coroutines.*

fun main() = runBlocking {
    val handler = CoroutineExceptionHandler { _, exception ->
        println("Caught by handler: ${exception.message}")
    }

    val job = launch(handler) {
        throw RuntimeException("something went wrong")
    }
    job.join()
    println("Program continues normally")
}
```

The handler is a last line of defense for logging/reporting, not a
substitute for handling expected failures with `try`/`catch` where you can.

## `SupervisorJob` and `supervisorScope`: isolating sibling failures

By default, structured concurrency means a failing child cancels its
**parent**, which in turn cancels all of the parent's *other* children —
one failure takes down the whole family:

```kotlin-runnable
import kotlinx.coroutines.*

fun main() = runBlocking {
    launch {
        launch {
            delay(100L)
            throw RuntimeException("child 1 failed")
        }
        launch {
            delay(500L)
            // Never reached: sibling failure cancels this coroutine first.
            println("child 2 finished")
        }
    }
    delay(1000L)
    println("main continues")
}
```

Sometimes that's exactly wrong — think of a UI with several independent
widgets, each backed by its own coroutine; one widget's data failing to load
shouldn't cancel the others. `SupervisorJob` (as the context passed to a
scope) or the `supervisorScope` builder change the propagation rule so a
child's failure is contained to that child, instead of cancelling its
siblings or its parent.

```kotlin-runnable
import kotlinx.coroutines.*

fun main() = runBlocking {
    supervisorScope {
        launch {
            delay(100L)
            throw RuntimeException("child 1 failed")
        }
        launch {
            delay(300L)
            println("child 2 finished normally")
        }
    }
    println("main continues")
}
```

Here child 2 completes normally even though child 1 failed. Note that with
`supervisorScope`, an uncaught exception in a child still needs to be dealt
with somehow — via a `CoroutineExceptionHandler`, or a `try`/`catch` inside
the child itself — otherwise it's simply logged as uncaught; supervision
changes *propagation*, not whether the exception existed. For a
longer-lived custom scope (rather than a one-off `supervisorScope` block),
you'd build it with `CoroutineScope(SupervisorJob())` so every direct child
of that scope is isolated from its siblings' failures the same way.

## Tasks

### Task 1: Catch inside `async`

Write a `main` using `runBlocking` that starts an `async` computing
`10 / 0` (which throws `ArithmeticException`). Await it inside a
`try`/`catch` and print a friendly message instead of letting the exception
crash the program.

```kotlin-runnable
import kotlinx.coroutines.*

fun main() = runBlocking {
    // Your code here
}
```

::: details Solution
```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    val deferred = async {
        10 / 0
    }
    try {
        println(deferred.await())
    } catch (e: ArithmeticException) {
        println("Division failed: ${e.message}")
    }
}
```
:::

### Task 2: Isolate failures with `supervisorScope`

Write a `main` using `runBlocking` and `supervisorScope` that launches three
children: the first throws an exception after 100ms, the second and third
each print a success message after 200ms and 300ms respectively. Install a
`CoroutineExceptionHandler` on the failing child so the exception is logged
instead of crashing the program, and confirm the other two children still
complete.

::: details Solution
```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    val handler = CoroutineExceptionHandler { _, e ->
        println("Handled failure: ${e.message}")
    }

    supervisorScope {
        launch(handler) {
            delay(100L)
            throw RuntimeException("child 1 failed")
        }
        launch {
            delay(200L)
            println("child 2 succeeded")
        }
        launch {
            delay(300L)
            println("child 3 succeeded")
        }
    }
    println("all children settled")
}
```
Because this is a `supervisorScope`, child 1's failure doesn't cancel
children 2 and 3, and the `CoroutineExceptionHandler` prevents the failure
from being reported as an unhandled crash.
:::

Next: [Flow](/coroutines/flow)
