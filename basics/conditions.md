# Conditions: if and when

## `if` as an expression

You've already seen this in passing: `if` in Kotlin produces a value, so it
can replace both the `if` statement *and* the ternary operator (`? :`) that
Kotlin doesn't have.

```kotlin-runnable
fun main() {
    val hour = 20

    // As a statement
    if (hour < 12) {
        println("Morning")
    } else {
        println("Not morning")
    }

    // As an expression
    val label = if (hour < 12) "Morning" else "Evening"
    println(label)
}
```

When `if` is used as an expression with a value you intend to use, every
branch must produce a value, and you must include an `else` — otherwise
there's no value to return when the condition is false.

```kotlin-runnable
fun main() {
    val score = 73

    val grade = if (score >= 90) {
        "A"
    } else if (score >= 80) {
        "B"
    } else if (score >= 70) {
        "C"
    } else {
        "F"
    }

    println(grade)
}
```

## `when`: Kotlin's switch, but stronger

`when` replaces `switch`, but it's far more capable: no fallthrough, no
`break` needed, and each branch can match on values, ranges, types, or
arbitrary boolean conditions.

```kotlin-runnable
fun main() {
    val day = 3

    when (day) {
        1 -> println("Monday")
        2 -> println("Tuesday")
        3 -> println("Wednesday")
        4, 5 -> println("Thursday or Friday")   // multiple values, comma-separated
        else -> println("Weekend")
    }
}
```

Each branch is checked top to bottom and only the first match runs — there's
no need for an explicit `break`, and cases can't accidentally fall into each
other the way C-style `switch` allows.

### Matching ranges and arbitrary conditions

```kotlin-runnable
fun main() {
    val score = 85

    val grade = when (score) {
        in 90..100 -> "A"
        in 80..<90 -> "B"
        in 70..<80 -> "C"
        else -> "F"
    }

    println(grade)
}
```

### Matching types with `is`

`when` can also branch on the runtime type of a value, which is especially
useful with `Any` or a sealed hierarchy.

```kotlin-runnable
fun main() {
    fun describe(x: Any): String = when (x) {
        is Int -> "an Int: $x"
        is String -> "a String of length ${x.length}"
        is Boolean -> "a Boolean: $x"
        else -> "something else"
    }

    println(describe(42))
    println(describe("hello"))
    println(describe(true))
}
```

Notice that inside the `is String ->` branch, `x` is automatically **smart
cast** to `String` — you can call `.length` directly without an explicit
cast. Kotlin's compiler tracks type checks like this throughout `if` and
`when` branches.

### No-argument `when`: an if-else chain

Leave out the subject entirely and each branch becomes an arbitrary boolean
condition, evaluated top to bottom — a cleaner replacement for a long
`if / else if` chain.

```kotlin-runnable
fun main() {
    val temperature = 15

    val description = when {
        temperature < 0 -> "freezing"
        temperature < 15 -> "cold"
        temperature < 25 -> "mild"
        else -> "hot"
    }

    println(description)
}
```

## `when` as an expression must be exhaustive

Just like `if`, `when` can be used as an expression — and when it is, the
compiler requires it to cover every possible case. For an arbitrary type
like `Int` or `String`, that means you need an `else` branch, since there's
no way to enumerate every possible value.

```kotlin-runnable
fun main() {
    val code = 404

    val message = when (code) {
        200 -> "OK"
        404 -> "Not Found"
        500 -> "Server Error"
        else -> "Unknown status"   // required: makes the expression exhaustive
    }

    println(message)
}
```

If you remove `else` there, the code won't compile — the compiler can't
prove every `Int` is handled. The one place `else` isn't required is when
the subject is an `enum class` or a `sealed class`/`sealed interface` and
every subtype has its own branch — the compiler can verify exhaustiveness on
its own in that case. You'll meet sealed classes properly in the
[Classes and Instances](/oop/classes-and-instances) section.

## Tasks

### Task 1: Convert if-chain to when

Rewrite this `if`/`else if` chain as a no-argument `when` expression that
returns the same `String`.

```kotlin-runnable
fun main() {
    val speed = 55

    val message: String
    if (speed <= 30) {
        message = "slow"
    } else if (speed <= 60) {
        message = "normal"
    } else {
        message = "fast"
    }
    println(message)
}
```

::: details Solution
```kotlin
fun main() {
    val speed = 55

    val message = when {
        speed <= 30 -> "slow"
        speed <= 60 -> "normal"
        else -> "fast"
    }

    println(message)
}
```
:::

### Task 2: Type-based dispatch

Write a function `area(shape: Any): Double` that accepts either a `Double`
(representing a circle's radius), a `Pair<Double, Double>` (representing a
rectangle's width and height), or anything else (return `0.0`). Use `when`
with `is` to compute the correct area (`π * r²` for the circle — use
`Math.PI`).

::: details Solution
```kotlin
fun area(shape: Any): Double = when (shape) {
    is Double -> Math.PI * shape * shape
    is Pair<*, *> -> {
        val (width, height) = shape as Pair<Double, Double>
        width * height
    }
    else -> 0.0
}

fun main() {
    println(area(2.0))
    println(area(Pair(3.0, 4.0)))
    println(area("nonsense"))
}
```
`Pair<*, *>` uses a star-projection because generic type parameters aren't
fully known at runtime (type erasure) — matching `is Pair<Double, Double>`
directly isn't allowed. Destructuring (`val (width, height) = ...`) is
covered later; for now, read it as unpacking the pair's two components.
:::

### Task 3: Exhaustive when expression

Write an `enum class TrafficLight { RED, YELLOW, GREEN }` and a function
`action(light: TrafficLight): String` that returns `"Stop"`, `"Slow down"`,
or `"Go"` using a `when` expression with no `else` branch.

::: details Solution
```kotlin
enum class TrafficLight { RED, YELLOW, GREEN }

fun action(light: TrafficLight): String = when (light) {
    TrafficLight.RED -> "Stop"
    TrafficLight.YELLOW -> "Slow down"
    TrafficLight.GREEN -> "Go"
}

fun main() {
    println(action(TrafficLight.RED))
    println(action(TrafficLight.GREEN))
}
```
Because `TrafficLight` is an `enum class` and every constant has a branch,
the compiler can prove exhaustiveness without an `else` — and if you later
add a new enum constant without updating this `when`, it stops compiling
until you do.
:::

Next: [Loops](/basics/loops)
