# Ranges and Progressions

A range represents an interval between two values. You've likely already
used one without thinking much about its type, in a `for` loop:

```kotlin-runnable
fun main() {
    for (i in 1..5) {
        print("$i ")
    }
    println()
}
```

## Creating ranges

`..` creates a closed range that includes both endpoints. `..<` (added as a
non-experimental operator in recent Kotlin versions) creates a range that
excludes the upper bound — useful for the common "0 up to, but not
including, size" pattern:

```kotlin-runnable
fun main() {
    val closed = 1..5
    println(closed.first) // 1
    println(closed.last)  // 5

    val list = listOf("a", "b", "c", "d")
    for (i in 0..<list.size) {
        print("${list[i]} ")
    }
    println()

    // Equivalent, older idiom you'll still see a lot:
    for (i in 0 until list.size) {
        print("${list[i]} ")
    }
    println()
}
```

Ranges aren't limited to `Int` — any type with a natural ordering supports
them, including `Char`:

```kotlin-runnable
fun main() {
    val letters = 'a'..'f'
    println(letters.contains('c')) // true

    for (c in 'a'..'e') {
        print(c)
    }
    println()
}
```

## downTo and step

`..` always goes from a lower value to a higher one. For counting
downward, use `downTo`. For skipping values, use `step`:

```kotlin-runnable
fun main() {
    for (i in 10 downTo 1) {
        print("$i ")
    }
    println()

    for (i in 0..20 step 5) {
        print("$i ")
    }
    println()

    for (i in 10 downTo 0 step 2) {
        print("$i ")
    }
    println()
}
```

## Ranges in `when` and `in` checks

Ranges are frequently used with `in` for a readable bounds check, and fit
naturally as `when` branches:

```kotlin-runnable
fun classify(score: Int): String = when (score) {
    in 90..100 -> "A"
    in 80..<90 -> "B"
    in 70..<80 -> "C"
    else -> "F"
}

fun main() {
    println(classify(95)) // A
    println(classify(82)) // B
    println(classify(55)) // F

    val age = 25
    println(age in 18..65) // true — plain boolean check, not just in when
}
```

This is one of the cleanest uses of ranges: `in 90..100` reads naturally as
"is in the range 90 to 100," and the compiler translates it into an
efficient bounds check rather than actually constructing a list of 11
numbers to search through.

## Ranges with a step are Progressions

A plain range like `1..10` is an `IntRange`. Once you add `step`, the result
is an `IntProgression` — a range plus a fixed step size. `IntRange` is
actually implemented as an `IntProgression` with a step of `1`, so
everything you can do with a stepped range, you can also do with a plain
one:

```kotlin-runnable
fun main() {
    val range: IntRange = 1..10
    val progression: IntProgression = 1..10 step 3

    println(range)        // 1..10
    println(progression)  // 1..10 step 3

    for (i in progression) {
        print("$i ")
    }
    println()
}
```

`downTo` also produces a progression, since it implies a step of `-1`
internally — that's why `10 downTo 1 step 2` (from earlier) is legal:
`downTo` and `step` compose because both operate on the same
`IntProgression` family.

## Converting a range to a list

A range or progression is itself `Iterable`, so every collection operation
from earlier pages works on it directly — but sometimes you want an actual
`List` (say, to shuffle it, index into it repeatedly, or pass it to
something expecting a `List`):

```kotlin-runnable
fun main() {
    val numbers = (1..10).toList()
    println(numbers) // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    val everyOtherLetter = ('a'..'j' step 2).toList()
    println(everyOtherLetter) // [a, c, e, g, i]

    // Ranges support the same operations as any other Iterable:
    val evens = (1..20).filter { it % 2 == 0 }
    println(evens)
}
```

## Tasks

### Task 1: FizzBuzz with ranges

Print the numbers 1 through 20, but for multiples of 3 print `"Fizz"`, for
multiples of 5 print `"Buzz"`, and for multiples of both print
`"FizzBuzz"`, using a range in a `for` loop and `when`.

```kotlin-runnable
fun main() {
    // Your code here
}
```

::: details Solution
```kotlin
fun main() {
    for (i in 1..20) {
        val output = when {
            i % 15 == 0 -> "FizzBuzz"
            i % 3 == 0 -> "Fizz"
            i % 5 == 0 -> "Buzz"
            else -> i.toString()
        }
        println(output)
    }
}
```
:::

### Task 2: Countdown with a step

Print a countdown from 20 to 0, decreasing by 4 each time, on a single line
separated by spaces (e.g. `20 16 12 8 4 0`).

::: details Solution
```kotlin
fun main() {
    for (i in 20 downTo 0 step 4) {
        print("$i ")
    }
    println()
}
```
:::

### Task 3: Grade classifier

Write a function `letterGrade(score: Int): Char` that returns `'A'` for
90-100, `'B'` for 80-89, `'C'` for 70-79, and `'F'` below 70, using `when`
with ranges.

::: details Solution
```kotlin
fun letterGrade(score: Int): Char = when (score) {
    in 90..100 -> 'A'
    in 80..89 -> 'B'
    in 70..79 -> 'C'
    else -> 'F'
}

fun main() {
    println(letterGrade(95)) // A
    println(letterGrade(83)) // B
    println(letterGrade(50)) // F
}
```
:::

Next: [Exceptions](/error-handling/exceptions)
