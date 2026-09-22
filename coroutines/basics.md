# Basics

[Introduction](/coroutines/introduction) showed `runBlocking` and `launch`
in passing. Here's what each coroutine builder is actually for, and the rule
that ties them all together: structured concurrency.

## `launch`: fire-and-forget

`launch` starts a new coroutine that runs concurrently and doesn't return a
result to the caller. It returns a `Job`, a handle you can use to wait for
completion or cancel it.

```kotlin-runnable
import kotlinx.coroutines.*

fun main() = runBlocking {
    val job = launch {
        delay(500L)
        println("Work done")
    }
    println("Launched, not waiting yet")
    job.join() // suspend until the job completes
    println("Now we know it's done")
}
```

`job.join()` is itself a suspending function — it suspends the calling
coroutine until the target job finishes, without blocking the underlying
thread. Use `launch` whenever you want to start work you don't need a result
back from (writing a log line, updating some UI, firing off an
independent task).

## `async`/`await`: work that produces a result

`async` also starts a new concurrent coroutine, but it returns a
`Deferred<T>` — think of it as a `Job` that will eventually hold a value of
type `T`. Call `.await()` to suspend until that value is ready.

```kotlin-runnable
import kotlinx.coroutines.*

suspend fun fetchUserName(): String {
    delay(500L)
    return "Ada"
}

suspend fun fetchUserScore(): Int {
    delay(300L)
    return 97
}

fun main() = runBlocking {
    val nameDeferred = async { fetchUserName() }
    val scoreDeferred = async { fetchUserScore() }

    // Both fetches are running concurrently already; awaiting just
    // suspends until each one's value is ready.
    println("${nameDeferred.await()} scored ${scoreDeferred.await()}")
}
```

## Sequential vs. concurrent with `async`

This is the classic `async` gotcha. If you call `.await()` immediately after
starting each one, you get concurrency. If you accidentally write them as
two separate sequential steps — or use plain `suspend` function calls
instead of `async` — you get sequential execution instead:

```kotlin-runnable
import kotlinx.coroutines.*
import kotlin.system.measureTimeMillis

suspend fun slowOperation(id: Int): Int {
    delay(1000L)
    return id * id
}

fun main() = runBlocking {
    val sequentialTime = measureTimeMillis {
        val a = slowOperation(1) // waits 1 second...
        val b = slowOperation(2) // ...then waits another second
        println("Sequential result: ${a + b}")
    }
    println("Sequential took ${sequentialTime}ms")

    val concurrentTime = measureTimeMillis {
        val deferredA = async { slowOperation(1) }
        val deferredB = async { slowOperation(2) } // starts immediately, doesn't wait for A
        println("Concurrent result: ${deferredA.await() + deferredB.await()}")
    }
    println("Concurrent took ${concurrentTime}ms")
}
```

The sequential version takes about two seconds (one `delay` after another);
the concurrent version takes about one, because both `slowOperation` calls
are running at the same time and `await()` just waits for each to finish
rather than starting it. The rule of thumb: use plain sequential `suspend`
calls when each step genuinely depends on the previous one's result; use
`async` when independent pieces of work can happen in parallel.

## `runBlocking`: the bridge to blocking code

`runBlocking` is different from `launch` and `async` in one important way:
it's the one builder that *blocks* the calling thread until its body
completes, rather than suspending. That makes it useful almost exclusively
at the boundary between ordinary blocking code and the coroutine world — most
commonly in `main` functions and in tests, where you need a plain, blocking
entry point that can still call `suspend` functions.

```kotlin-runnable
import kotlinx.coroutines.*

fun main() {
    println("Before runBlocking")
    runBlocking {
        delay(200L)
        println("Inside runBlocking")
    }
    println("After runBlocking — this thread was blocked until the above finished")
}
```

You'll almost never use `runBlocking` inside real application code (a
server handler, an Android UI callback) — there, you're usually already
inside a coroutine, or a framework gives you a `CoroutineScope` to launch
from. `runBlocking` is specifically for the handful of places your program
has no choice but to block a thread.

## Structured concurrency

Every coroutine builder you've seen (`launch`, `async`, and `runBlocking`
itself) creates a coroutine that's a **child** of the scope it was called
in. `runBlocking { ... }` establishes a scope; every `launch`/`async` called
directly inside that block is a child of it. This parent-child relationship
is called **structured concurrency**, and it gives you two guarantees for
free:

1. A parent scope won't complete until all of its children have completed.
   You've already seen this — `runBlocking` in the earlier examples always
   waited for its `launch`ed children before returning.
2. If a parent is cancelled, all of its children are cancelled too — you
   never end up with orphaned coroutines nobody is tracking.

```kotlin-runnable
import kotlinx.coroutines.*

fun main() = runBlocking {
    launch {
        launch {
            delay(1000L)
            println("Grandchild finished")
        }
        println("Child launched a grandchild")
    }
    println("Parent (runBlocking) launched a child")
    // runBlocking will not return until the child AND the grandchild
    // it launched are both done, even though neither is referenced here.
}
```

This is a deliberate contrast with raw threads or "fire off a `Thread` and
hope someone remembers to join it": in Kotlin, concurrency has an explicit
tree structure, and the language guarantees you can't accidentally leak a
coroutine that outlives the scope that created it. You'll see the practical
consequences of this — cancellation propagating down the tree, exceptions
propagating up it — in the next few chapters.

## Tasks

### Task 1: Launch two greetings

Using `runBlocking` and `launch`, write a `main` that launches two
coroutines: one that delays 200ms and prints `"Hi"`, and one that delays
100ms and prints `"there"`. Confirm (by reasoning about the delays, or by
running it) that `"there"` prints before `"Hi"`.

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
    launch {
        delay(200L)
        println("Hi")
    }
    launch {
        delay(100L)
        println("there")
    }
}
```
Both coroutines are launched immediately and run concurrently; the one with
the shorter delay finishes first, regardless of launch order.
:::

### Task 2: Fetch two things concurrently

Write two `suspend` functions, `fetchTemperature(): Int` (delays 400ms,
returns `21`) and `fetchHumidity(): Int` (delays 300ms, returns `65`). Then
write a `main` using `runBlocking` and `async` that fetches both
*concurrently* and prints `"Temperature: 21, Humidity: 65"`.

::: details Solution
```kotlin
import kotlinx.coroutines.*

suspend fun fetchTemperature(): Int {
    delay(400L)
    return 21
}

suspend fun fetchHumidity(): Int {
    delay(300L)
    return 65
}

fun main() = runBlocking {
    val temperature = async { fetchTemperature() }
    val humidity = async { fetchHumidity() }
    println("Temperature: ${temperature.await()}, Humidity: ${humidity.await()}")
}
```
Both `async` calls start immediately; the total wait is roughly 400ms (the
slower of the two), not 700ms, because they overlap.
:::

Next: [Cancellation & Timeouts](/coroutines/cancellation-and-timeouts)
