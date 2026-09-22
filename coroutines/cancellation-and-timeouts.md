# Cancellation & Timeouts

Long-running work eventually needs to be cancellable — a user navigates
away, a request times out, one branch of a search finds the answer before
the others. Coroutines make cancellation explicit and cooperative rather
than something that happens to a coroutine violently and unpredictably.

## Cancelling a `Job`

Every coroutine started with `launch` gives you back a `Job`. Calling
`job.cancel()` requests cancellation; `job.join()` (or `cancelAndJoin()`,
which does both) suspends until the coroutine has actually finished.

```kotlin-runnable
import kotlinx.coroutines.*

fun main() = runBlocking {
    val job = launch {
        repeat(1000) { i ->
            println("Working... $i")
            delay(200L)
        }
    }
    delay(500L)
    println("Cancelling now")
    job.cancelAndJoin()
    println("Cancelled")
}
```

Notice the loop stops around iteration 2 or 3, not at 1000 — `cancel()`
actually interrupted the ongoing work.

## Cancellation is cooperative

Here's the part that trips people up: cancelling a `Job` doesn't forcibly
kill the coroutine the way `Thread.stop()` (unsafely) kills a thread. It
sets a flag and relies on the coroutine's code to notice. A coroutine
"notices" cancellation in one of two ways: by calling a suspending function
from `kotlinx.coroutines` (like `delay`, which checks for cancellation every
time it's called and throws `CancellationException` if the job was
cancelled), or by explicitly checking `isActive`.

A tight loop that never suspends and never checks `isActive` will **not**
stop when cancelled:

```kotlin-runnable
import kotlinx.coroutines.*

fun main() = runBlocking {
    val job = launch(Dispatchers.Default) {
        var i = 0
        val start = System.currentTimeMillis()
        while (System.currentTimeMillis() - start < 2000L) {
            // Pure CPU work, no delay(), no isActive check —
            // cancellation has no opportunity to take effect.
            i++
        }
        println("Loop finished on its own after computing $i iterations")
    }
    delay(300L)
    println("Requesting cancellation")
    job.cancelAndJoin()
    println("cancelAndJoin() returned")
}
```

Run it and you'll see `cancelAndJoin()` doesn't return until the full two
seconds elapse — cancellation was requested, but the loop body never checked
for it. Fix it by checking `isActive` (available inside any
`CoroutineScope`):

```kotlin-runnable
import kotlinx.coroutines.*

fun main() = runBlocking {
    val job = launch(Dispatchers.Default) {
        var i = 0
        val start = System.currentTimeMillis()
        while (isActive && System.currentTimeMillis() - start < 2000L) {
            i++
        }
        println("Loop stopped after computing $i iterations")
    }
    delay(300L)
    println("Requesting cancellation")
    job.cancelAndJoin()
    println("cancelAndJoin() returned promptly")
}
```

The takeaway: writing a coroutine that's genuinely cancellable is your
responsibility. Call suspending functions regularly, or check `isActive` in
CPU-bound loops.

## `withTimeout` and `withTimeoutOrNull`

Rather than manually tracking elapsed time, wrap work in `withTimeout` to
cancel it automatically after a duration. It throws
`TimeoutCancellationException` (a subtype of `CancellationException`) if the
block doesn't finish in time.

```kotlin-runnable
import kotlinx.coroutines.*

fun main() = runBlocking {
    try {
        withTimeout(500L) {
            repeat(10) { i ->
                println("Step $i")
                delay(150L)
            }
        }
    } catch (e: TimeoutCancellationException) {
        println("Timed out: ${e.message}")
    }
}
```

If you'd rather get `null` back instead of catching an exception,
`withTimeoutOrNull` does exactly that:

```kotlin-runnable
import kotlinx.coroutines.*

suspend fun fetchWithDelay(delayMs: Long): String {
    delay(delayMs)
    return "result after ${delayMs}ms"
}

fun main() = runBlocking {
    val result = withTimeoutOrNull(300L) {
        fetchWithDelay(1000L)
    }
    println(result ?: "gave up waiting")
}
```

## Cleanup with `finally`

A cancelled coroutine throws `CancellationException` at its next suspension
point, so ordinary `try`/`finally` works for cleanup exactly like it does for
any other exception:

```kotlin-runnable
import kotlinx.coroutines.*

fun main() = runBlocking {
    val job = launch {
        try {
            repeat(1000) { i ->
                println("Working $i")
                delay(200L)
            }
        } finally {
            println("Cleaning up resources")
        }
    }
    delay(500L)
    job.cancelAndJoin()
}
```

## Suspending cleanup needs `NonCancellable`

There's a trap here: once a coroutine is in the process of being cancelled,
calling *another* suspending function inside `finally` — like `delay` for a
graceful shutdown, or a suspending "flush to disk" call — will itself throw
`CancellationException` immediately, because the coroutine is already
cancelled. If your cleanup genuinely needs to suspend, wrap it in
`withContext(NonCancellable)`, which creates a scope immune to the
cancellation already in progress:

```kotlin-runnable
import kotlinx.coroutines.*

fun main() = runBlocking {
    val job = launch {
        try {
            repeat(1000) { i ->
                println("Working $i")
                delay(200L)
            }
        } finally {
            withContext(NonCancellable) {
                println("Starting suspending cleanup...")
                delay(300L) // would throw immediately without NonCancellable
                println("Cleanup finished")
            }
        }
    }
    delay(500L)
    job.cancelAndJoin()
}
```

Without `NonCancellable`, the `delay(300L)` inside `finally` would throw
right away and `"Cleanup finished"` would never print. `NonCancellable`
should be used sparingly and for genuinely short cleanup work — it's an
escape hatch, not a way to ignore cancellation.

## Tasks

### Task 1: A cancellable countdown

Write a `main` using `runBlocking` that launches a coroutine counting down
from 10 to 1, printing each number with a 200ms delay between them, then
printing `"Liftoff!"`. From the outer `runBlocking`, wait 700ms and then
cancel the job. Confirm the countdown stops partway through and
`"Liftoff!"` never prints.

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
    val job = launch {
        for (i in 10 downTo 1) {
            println(i)
            delay(200L)
        }
        println("Liftoff!")
    }
    delay(700L)
    job.cancelAndJoin()
    println("Countdown cancelled")
}
```
`delay` checks for cancellation on every call, so the loop stops cleanly
partway through, and `"Liftoff!"` is never reached because the job is
cancelled before the loop completes.
:::

### Task 2: Timeout a slow fetch

Write a `suspend fun fetchData(): String` that delays 800ms and returns
`"data"`. Write a `main` that tries to fetch it with a 300ms timeout using
`withTimeoutOrNull`, printing the result if it succeeds or `"fetch timed
out"` if it doesn't.

::: details Solution
```kotlin
import kotlinx.coroutines.*

suspend fun fetchData(): String {
    delay(800L)
    return "data"
}

fun main() = runBlocking {
    val result = withTimeoutOrNull(300L) { fetchData() }
    println(result ?: "fetch timed out")
}
```
:::

Next: [Dispatchers & Context](/coroutines/dispatchers-and-context)
