# Channels

`Flow` gives one coroutine a stream to collect from, but it's fundamentally
a recipe: cold, and re-run for every collector. Sometimes what you actually
want is a pipe between two *already-running* coroutines — one sends values,
another receives them, each value delivered to exactly one receiver, exactly
once. That's what a `Channel<T>` is for.

## `Channel` vs. `Flow`

A `Channel` is **hot** and **non-replaying**: values sent into it exist
independently of any particular receiver, and once a value is received, it's
gone — a second receiver won't see it. Compare that to `Flow`, which is
cold and re-runs its producer for every collector. Think of a `Channel` as
a queue shared between coroutines; think of a `Flow` as a description of how
to produce a sequence, executed fresh each time someone asks for it.

## `send` and `receive`

```kotlin-runnable
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
    val channel = Channel<Int>()

    launch {
        for (i in 1..5) {
            channel.send(i * i)
        }
        channel.close()
    }

    for (value in channel) {
        println("Received: $value")
    }
    println("Channel closed, loop ended")
}
```

`send` suspends if the channel is full (an unbuffered `Channel()` can only
hold a value until someone receives it); `receive` suspends if there's
nothing to receive yet. That suspension is exactly how a producer and
consumer running as separate coroutines stay coordinated without you
managing any locks or condition variables yourself.

## Closing a channel

A producer signals "no more values" by calling `channel.close()`. A
`for` loop over a channel (as above) ends automatically once the channel is
closed and drained; without `close()`, the consumer's loop would suspend
forever waiting for a value that never comes.

```kotlin-runnable
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
    val channel = Channel<String>()

    launch {
        channel.send("first")
        channel.send("second")
        channel.close() // without this, the receiving loop never finishes
    }

    for (message in channel) {
        println(message)
    }
}
```

Receiving from an already-closed, already-drained channel returns
immediately rather than suspending, which is what lets the `for` loop above
terminate cleanly instead of hanging.

## `produce`: a channel with a built-in producer

Writing "launch a coroutine that sends values, then close the channel" by
hand is common enough that `kotlinx.coroutines` has a dedicated builder for
it: `produce`, which returns a `ReceiveChannel<T>` and automatically closes
the channel when its block finishes (including if it throws).

```kotlin-runnable
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun CoroutineScope.produceSquares(upTo: Int): ReceiveChannel<Int> = produce {
    for (i in 1..upTo) {
        delay(100L)
        send(i * i)
    }
}

fun main() = runBlocking {
    val squares = produceSquares(5)
    for (value in squares) {
        println(value)
    }
}
```

`produce` is an extension function on `CoroutineScope`, so the channel it
returns is tied to that scope via structured concurrency, same as a
`launch`ed coroutine would be — cancelling the scope cancels the underlying
producer coroutine too.

## A simple producer/consumer pipeline

Channels shine when you want multiple stages of processing running
concurrently, each as its own coroutine, connected by channels:

```kotlin-runnable
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun CoroutineScope.produceNumbers(): ReceiveChannel<Int> = produce {
    for (i in 1..5) {
        send(i)
    }
}

fun CoroutineScope.square(numbers: ReceiveChannel<Int>): ReceiveChannel<Int> = produce {
    for (n in numbers) {
        send(n * n)
    }
}

fun main() = runBlocking {
    val numbers = produceNumbers()
    val squared = square(numbers)
    for (result in squared) {
        println(result)
    }
}
```

Each stage (`produceNumbers`, `square`) is its own coroutine, running
concurrently and communicating purely through channels — no shared mutable
state, no locks. This pipeline pattern scales to arbitrarily many stages,
each doing one transformation and passing results downstream.

## Tasks

### Task 1: Producer and consumer

Write a `main` using `runBlocking` that creates a `Channel<String>`,
launches a coroutine that sends `"apple"`, `"banana"`, `"cherry"` (with a
100ms delay before each) and then closes the channel, and a second part
(in the main coroutine itself) that receives and prints each value using a
`for` loop over the channel.

```kotlin-runnable
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
    // Your code here
}
```

::: details Solution
```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
    val channel = Channel<String>()

    launch {
        for (fruit in listOf("apple", "banana", "cherry")) {
            delay(100L)
            channel.send(fruit)
        }
        channel.close()
    }

    for (fruit in channel) {
        println(fruit)
    }
}
```
:::

### Task 2: A two-stage `produce` pipeline

Using `produce`, write `produceLetters(): ReceiveChannel<Char>` that sends
the characters `'a'` through `'e'`, and `uppercase(letters: ReceiveChannel<Char>): ReceiveChannel<Char>`
that receives from it and sends each letter's uppercase version. Wire them
together in `main` and print every result.

::: details Solution
```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun CoroutineScope.produceLetters(): ReceiveChannel<Char> = produce {
    for (c in 'a'..'e') {
        send(c)
    }
}

fun CoroutineScope.uppercase(letters: ReceiveChannel<Char>): ReceiveChannel<Char> = produce {
    for (c in letters) {
        send(c.uppercaseChar())
    }
}

fun main() = runBlocking {
    val letters = produceLetters()
    val upper = uppercase(letters)
    for (c in upper) {
        println(c)
    }
}
```
Each `produce` call starts its own coroutine immediately; `uppercase`
receives from `letters` as values become available and forwards a
transformed value downstream, exactly like the numeric pipeline above.
:::

Next: [Overview](/multiplatform/overview)
