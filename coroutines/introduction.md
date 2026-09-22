# Introduction

Every language eventually has to answer the same question: how do you run
many things at once without either blocking a thread for each one or
drowning your code in callbacks? Kotlin's answer is **coroutines**.

## The problem

Threads work, but they're expensive. Each OS thread reserves a chunk of
memory for its stack (often around a megabyte) and costs real time to create
and to switch between. A server handling ten thousand concurrent connections
can't reasonably spin up ten thousand threads — most of them would spend
almost all their time doing nothing but waiting on I/O, yet still hold their
memory and get scheduled by the OS.

The traditional fix for I/O-bound work is asynchronous callbacks: instead of
blocking the thread waiting for a network response, you register a callback
and free the thread up for other work. This solves the resource problem, but
it wrecks the *readability* of your code. Sequential logic —
"fetch the user, then fetch their orders, then compute a total" — turns into
a pyramid of nested callbacks, or a chain of `.then()`s, none of which reads
like the straightforward sequence of steps it actually represents. Try
adding a loop, an `if`, or a `try`/`catch` around asynchronous callback code
and see how quickly it turns unpleasant.

## The core idea: suspending, not blocking

A coroutine lets you write code that *looks* sequential and blocking, but
under the hood, gives up the thread instead of blocking it whenever it's
waiting for something. That "giving up the thread" operation is called
**suspending**. When a coroutine suspends, the thread it was running on is
free to go do other work — including running other coroutines — and when
whatever the coroutine was waiting for is ready, the coroutine resumes,
possibly on a different thread, picking up exactly where it left off.

Functions that can suspend are marked with the `suspend` modifier:

```kotlin
suspend fun fetchUser(id: Int): String {
    delay(1000) // pretend this is a network call
    return "User#$id"
}
```

`delay` is a suspending function from `kotlinx.coroutines` — it's the
coroutine equivalent of `Thread.sleep`, except it doesn't block the
underlying thread at all; it just suspends the coroutine and lets the thread
run something else until the delay is over. A `suspend` function can only be
called from another `suspend` function, or from inside a coroutine — that
restriction is what lets the compiler track, at compile time, exactly where
suspension can happen.

Because a suspended coroutine doesn't tie up a thread, coroutines are far
cheaper than threads — you can comfortably run tens of thousands of them
concurrently on a small pool of threads, sometimes even just one.

## A first taste

To actually run coroutines, you need a **coroutine builder**. `runBlocking`
starts a coroutine and blocks the calling thread until it finishes — it's
your bridge from ordinary blocking code (like `main`) into the coroutine
world. `launch` starts a new *child* coroutine that runs concurrently with
whatever comes after it.

```kotlin-runnable
import kotlinx.coroutines.*

fun main() = runBlocking {
    launch {
        delay(1000L)
        println("World!")
    }
    println("Hello,")
}
```

Run it: `"Hello,"` prints immediately, and `"World!"` prints about a second
later — even though `launch` was called *before* the `println`. `launch`
doesn't wait for its block to finish; it starts the coroutine and returns
right away, so execution continues to the next line while the launched
coroutine is suspended on `delay`.

Here's the concurrency more clearly, with two launched coroutines running
side by side:

```kotlin-runnable
import kotlinx.coroutines.*

fun main() = runBlocking {
    launch {
        repeat(3) { i ->
            delay(300L)
            println("Coroutine A: $i")
        }
    }
    launch {
        repeat(3) { i ->
            delay(500L)
            println("Coroutine B: $i")
        }
    }
    println("Both coroutines launched")
}
```

Notice `runBlocking` waits for *both* launched coroutines to finish before
`main` returns — that's not a coincidence, it's a deliberate design called
**structured concurrency**, which the next chapter covers in detail. For
now, the takeaway is simpler: two independent, `delay`-based sequences of
work interleaved on what could be a single thread, with no callbacks, no
manual thread management, and code that reads top-to-bottom like ordinary
sequential logic.

That's the whole pitch for coroutines: sequential-looking code, concurrent
execution, and a cost per unit of concurrency that's closer to "a small
object" than "an OS thread." The next chapter gets into the actual
mechanics — `launch` vs. `async`, `Job`s, and structured concurrency.

Next: [Basics](/coroutines/basics)
