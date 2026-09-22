# Flow

Everything so far has dealt with a single suspended value: `async` produces
one result, a `suspend fun` returns once. `Flow<T>` extends the same ideas
to a *stream* of values produced over time — the asynchronous counterpart to
[`Sequence`](/collections/sequences).

## Building and collecting a flow

Create a flow with the `flow { ... }` builder and `emit` values from inside
it. A flow does nothing on its own until you `collect` it — like a
`Sequence`, it's **cold**: the producing code only runs once, and only for,
each collector.

```kotlin-runnable
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun numbers(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(200L) // pretend this is expensive, asynchronous work
        emit(i)
    }
}

fun main() = runBlocking {
    numbers().collect { value ->
        println("Collected: $value")
    }
}
```

The key difference from a `Sequence` is that `flow { ... }` can call
suspending functions (`delay`, network calls, anything) inside its builder
block, and `collect` is itself a suspending function. A `Sequence` is
synchronous and blocking; a `Flow` is asynchronous and non-blocking, which
is exactly what you want when each emitted value comes from I/O.

Because a flow is cold, collecting it twice runs the producing code twice:

```kotlin-runnable
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking {
    val numbers = flow {
        println("Flow started")
        emit(1)
        emit(2)
    }

    println("First collection:")
    numbers.collect { println(it) }

    println("Second collection:")
    numbers.collect { println(it) }
}
```

`"Flow started"` prints twice — once per `collect` call.

## Intermediate operators

`Flow` supports the same vocabulary you already know from collections and
sequences — `map`, `filter`, `take`, and friends — except each one is
itself asynchronous and returns a new cold `Flow`, doing no work until a
terminal operator like `collect` runs.

```kotlin-runnable
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking {
    (1..10).asFlow()
        .filter { it % 2 == 0 }
        .map { it * it }
        .take(3)
        .collect { println(it) }
}
```

`asFlow()` turns any range, collection, or sequence into a `Flow` directly —
handy for testing flow pipelines without writing a `flow { }` builder.

## `flowOn`: choosing a dispatcher for upstream work

By default, a flow's producing code runs on whatever dispatcher `collect`
is called from. `flowOn` lets you run everything *upstream* of it — the
`flow { }` builder and any operators before the `flowOn` call — on a
different dispatcher, without affecting the collector itself:

```kotlin-runnable
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun cpuIntensiveFlow(): Flow<Int> = flow {
    for (i in 1..3) {
        println("Emitting on ${Thread.currentThread().name}")
        emit(i * i)
    }
}.flowOn(Dispatchers.Default)

fun main() = runBlocking {
    cpuIntensiveFlow().collect { value ->
        println("Collected $value on ${Thread.currentThread().name}")
    }
}
```

`flowOn` only changes the dispatcher for code *above* it in the chain — this
is the flow equivalent of `withContext`, applied to a stream instead of a
single suspend call.

## Terminal operators

`collect` is the most common terminal operator, but `Flow` has others that
mirror the collection functions you already know: `toList()`, `toSet()`,
`first()`, `count()`, `reduce { ... }`, `fold(initial) { ... }`. Each one
suspends until the flow finishes (or, for `first()`, until the first value
arrives) and produces a plain value rather than another `Flow`.

```kotlin-runnable
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking {
    val total = (1..5).asFlow()
        .map { it * it }
        .fold(0) { acc, value -> acc + value }
    println("Sum of squares: $total")
}
```

## `StateFlow` and `SharedFlow`: hot flows for state

Everything above is a **cold** flow — nothing happens until someone
collects. Sometimes you want the opposite: a stream that's always "live,"
emits regardless of whether anyone is currently listening, and can have
multiple collectors sharing the same emissions. That's a **hot** flow.

- **`StateFlow<T>`** always holds a current value (like an observable
  variable) and immediately gives new collectors that value on
  subscription. It's the natural fit for representing UI state.
- **`SharedFlow<T>`** is a more general hot stream of events, without the
  "always has a current value" requirement — closer to an event bus.

```kotlin-runnable
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking {
    val state = MutableStateFlow(0)

    val watcher = launch {
        state.collect { value ->
            println("Observed state: $value")
        }
    }

    delay(100L)
    state.value = 1
    delay(100L)
    state.value = 2
    delay(100L)

    watcher.cancel()
}
```

`state.value = 1` updates the `StateFlow` directly — no `emit` needed for
simple assignment, though `MutableStateFlow` also has a suspending `emit`
for use inside other coroutines. `StateFlow`/`SharedFlow` are a large enough
topic (especially their role in UI architectures) that this is only an
introduction — the important thing to take away here is the cold/hot
distinction: `flow { }` builds a recipe that runs per-collector, while
`StateFlow`/`SharedFlow` represent an ongoing, shared stream that exists
independently of any particular collector.

## Tasks

### Task 1: Build and transform a flow

Write a flow-returning function `countdown(from: Int): Flow<Int>` that emits
values from `from` down to `1`, delaying 100ms before each emission. In
`main`, collect it after applying `filter` to keep only even numbers.

```kotlin-runnable
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun countdown(from: Int): Flow<Int> = flow {
    // Your code here
}

fun main() = runBlocking {
    countdown(6).filter { it % 2 == 0 }.collect { println(it) }
}
```

::: details Solution
```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun countdown(from: Int): Flow<Int> = flow {
    for (i in from downTo 1) {
        delay(100L)
        emit(i)
    }
}

fun main() = runBlocking {
    countdown(6).filter { it % 2 == 0 }.collect { println(it) }
}
```
Prints `6, 4, 2` — `filter` only lets even values through the pipeline to
`collect`.
:::

### Task 2: Sum with a terminal operator

Using `(1..100).asFlow()`, compute the sum of all multiples of 3 or 5 below
100, using `filter` and a terminal operator (`fold` or `reduce`) — no
`collect` with a mutable external variable.

::: details Solution
```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking {
    val sum = (1..99).asFlow()
        .filter { it % 3 == 0 || it % 5 == 0 }
        .fold(0) { acc, value -> acc + value }
    println(sum)
}
```
`fold` accumulates a running total through the flow, starting from `0`,
which avoids needing a mutable `var` outside the flow pipeline.
:::

Next: [Channels](/coroutines/channels)
