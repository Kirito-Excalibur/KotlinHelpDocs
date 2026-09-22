# Enum Classes

Kotlin enums start out looking like Java's:

```kotlin-runnable
enum class Direction {
    NORTH, SOUTH, EAST, WEST
}

fun main() {
    val d = Direction.NORTH
    println(d)
}
```

## `.name`, `.ordinal`, and `entries`

Every enum constant automatically has a `name` (the identifier as declared)
and an `ordinal` (its zero-based position in the declaration):

```kotlin-runnable
enum class Direction {
    NORTH, SOUTH, EAST, WEST
}

fun main() {
    val d = Direction.EAST
    println("${d.name} is at position ${d.ordinal}")

    for (direction in Direction.entries) {
        println(direction)
    }
}
```

`Direction.entries` is a `List<Direction>` of every constant, in
declaration order. It's the modern replacement for the older
`Direction.values()` (which returns an `Array` and allocates a new one on
every call); `entries` is preferred in current Kotlin and is what you
should reach for by default.

## Enums with constructor parameters and properties

Unlike Java... actually, this part *is* like Java: enum constants can carry
their own data, passed to the enum class's constructor:

```kotlin-runnable
enum class Planet(val massKg: Double, val radiusM: Double) {
    MERCURY(3.3e23, 2.4e6),
    VENUS(4.9e24, 6.1e6),
    EARTH(5.97e24, 6.4e6);

    fun surfaceGravity(): Double {
        val g = 6.674e-11
        return g * massKg / (radiusM * radiusM)
    }
}

fun main() {
    for (planet in Planet.entries) {
        println("${planet.name}: gravity ${planet.surfaceGravity()}")
    }
}
```

Note the semicolon after the last constant — required whenever the enum
class has a body (functions, properties, `init` blocks) following the
constant list.

## Per-entry method bodies

An individual constant can override a member with its own implementation,
by giving that constant a body:

```kotlin-runnable
enum class Operation {
    ADD {
        override fun apply(a: Int, b: Int) = a + b
    },
    SUBTRACT {
        override fun apply(a: Int, b: Int) = a - b
    },
    MULTIPLY {
        override fun apply(a: Int, b: Int) = a * b
    };

    abstract fun apply(a: Int, b: Int): Int
}

fun main() {
    for (op in Operation.entries) {
        println("$op: ${op.apply(6, 3)}")
    }
}
```

This is a genuinely nice pattern for "a fixed set of strategies," avoiding
a separate `when` dispatch entirely — each constant knows how to behave.

## Enums implementing interfaces

An enum class can implement one or more interfaces, either with a shared
default or per-constant overrides:

```kotlin-runnable
interface HasLabel {
    val label: String
}

enum class Status : HasLabel {
    ACTIVE { override val label = "Active" },
    INACTIVE { override val label = "Inactive" },
    BANNED { override val label = "Banned" }
}

fun main() {
    for (status in Status.entries) {
        println(status.label)
    }
}
```

## Enums in `when`

Same benefit as sealed classes: since the compiler knows every possible
value, a `when` over an enum can be exhaustive without an `else` branch:

```kotlin-runnable
enum class TrafficLight { RED, YELLOW, GREEN }

fun action(light: TrafficLight): String = when (light) {
    TrafficLight.RED -> "Stop"
    TrafficLight.YELLOW -> "Slow down"
    TrafficLight.GREEN -> "Go"
}

fun main() {
    println(action(TrafficLight.GREEN))
}
```

If you'd rather compare enums to
[sealed classes](/oop/sealed-classes): reach for an enum when you have a
fixed set of values that are mostly interchangeable data (each constant is
an instance of the *same* type, just parameterized differently); reach for
a sealed class when each variant needs a genuinely different shape of data
(different properties per case, not just different constructor arguments
to a shared class).

## Tasks

### Task 1: Days of the week

Define `enum class DayOfWeek` with all seven days. Write a function
`isWeekend(day: DayOfWeek): Boolean` using an exhaustive `when` (no `else`)
that returns `true` for `SATURDAY` and `SUNDAY`, `false` otherwise.

```kotlin-runnable
// Your code here

fun main() {

}
```

::: details Solution
```kotlin
enum class DayOfWeek {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}

fun isWeekend(day: DayOfWeek): Boolean = when (day) {
    DayOfWeek.SATURDAY, DayOfWeek.SUNDAY -> true
    else -> false
}

fun main() {
    for (day in DayOfWeek.entries) {
        println("$day: ${isWeekend(day)}")
    }
}
```
Note: since only two of the seven cases return `true`, using `else` here is
actually more idiomatic than listing all five weekday branches individually
— exhaustiveness doesn't mean you must avoid `else`, just that you're free
to when it helps.
:::

### Task 2: Enum with per-entry behavior

Define `enum class Coin(val cents: Int)` with constants `PENNY(1)`,
`NICKEL(5)`, `DIME(10)`, `QUARTER(25)`. Write a function that takes a total
number of cents and greedily converts it into a list of coins (largest
first) using `Coin.entries`.

::: details Solution
```kotlin
enum class Coin(val cents: Int) {
    QUARTER(25), DIME(10), NICKEL(5), PENNY(1)
}

fun makeChange(totalCents: Int): List<Coin> {
    var remaining = totalCents
    val result = mutableListOf<Coin>()
    for (coin in Coin.entries) {
        while (remaining >= coin.cents) {
            result.add(coin)
            remaining -= coin.cents
        }
    }
    return result
}

fun main() {
    println(makeChange(41))
}
```
:::

Next: [Object Expressions & Declarations](/oop/object-expressions-and-declarations)
