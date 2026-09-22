# Loops

Kotlin has `for`, `while`, and `do-while` — but no classic C-style
`for (int i = 0; i < n; i++)`. Instead, `for` always iterates over something
iterable: a range, a collection, or anything exposing an `iterator()`.

## `for` over ranges

```kotlin-runnable
fun main() {
    for (i in 1..5) {
        print(i)
        print(' ')
    }
    println()
}
```

Combine this with what you saw in [Operators](/basics/operators): `1..5` is
inclusive, `1..<5` excludes the end.

```kotlin-runnable
fun main() {
    for (i in 1..<5) {
        print(i)
        print(' ')
    }
    println()
}
```

## `downTo` and `step`

To count downward or skip values, use the `downTo` and `step` infix
functions instead of hand-writing index arithmetic.

```kotlin-runnable
fun main() {
    for (i in 10 downTo 1) {
        print(i)
        print(' ')
    }
    println()

    for (i in 0..20 step 5) {
        print(i)
        print(' ')
    }
    println()

    for (i in 10 downTo 0 step 2) {
        print(i)
        print(' ')
    }
    println()
}
```

## `for` over collections

The same `for` loop works directly over any collection or array — no index
variable required.

```kotlin-runnable
fun main() {
    val languages = listOf("Kotlin", "Swift", "Rust")

    for (language in languages) {
        println(language)
    }
}
```

When you do need the index alongside the value, use `withIndex()` rather
than manually tracking a counter:

```kotlin-runnable
fun main() {
    val languages = listOf("Kotlin", "Swift", "Rust")

    for ((index, language) in languages.withIndex()) {
        println("$index: $language")
    }
}
```

`(index, language)` here is a destructuring declaration — it unpacks the
`IndexedValue` that `withIndex()` produces into two names in one step.

## `while` and `do-while`

These behave exactly as in Java/C: `while` checks the condition before each
iteration, `do-while` checks it after (so the body always runs at least
once).

```kotlin-runnable
fun main() {
    var x = 5
    while (x > 0) {
        print(x)
        print(' ')
        x--
    }
    println()

    var y = 0
    do {
        print(y)
        print(' ')
        y++
    } while (y < 3)
    println()
}
```

## Why no C-style `for`

Kotlin dropped `for (int i = 0; i < n; i++)` entirely — `for` only ever
means "iterate over this sequence." Anything you'd do with a manual counter
is expressed instead as a range (`0..<n`), a `while` loop, or by iterating
the collection directly. This eliminates an entire category of off-by-one
bugs from hand-rolled loop bounds and index arithmetic.

```kotlin-runnable
fun main() {
    val n = 5
    for (i in 0..<n) {
        print(i)
        print(' ')
    }
    println()
}
```

## Labeled loops: `break` and `continue`

Plain `break` and `continue` affect the nearest enclosing loop, same as
everywhere else. To target an outer loop from inside a nested one, label the
loop with `label@` and reference it in `break@label` or `continue@label`.

```kotlin-runnable
fun main() {
    outer@ for (i in 1..3) {
        for (j in 1..3) {
            if (j == 2) continue@outer
            println("i=$i, j=$j")
        }
    }
}
```

```kotlin-runnable
fun main() {
    search@ for (i in 1..5) {
        for (j in 1..5) {
            if (i * j == 12) {
                println("Found: $i x $j = 12")
                break@search
            }
        }
    }
}
```

Without the label, `break`/`continue` would only affect the inner `for (j
...)` loop, and the outer loop would keep running.

## Tasks

### Task 1: Sum of a range

Write a `main` function that sums every integer from 1 to 100 (inclusive)
using a `for` loop and prints the result.

```kotlin-runnable
fun main() {
    // Your code here
}
```

::: details Solution
```kotlin
fun main() {
    var sum = 0
    for (i in 1..100) {
        sum += i
    }
    println(sum)
}
```
:::

### Task 2: Countdown with step

Print every third number from 30 down to 0, inclusive, on one line separated
by spaces, using `downTo` and `step`.

::: details Solution
```kotlin
fun main() {
    for (i in 30 downTo 0 step 3) {
        print(i)
        print(' ')
    }
    println()
}
```
:::

### Task 3: Find the first matching pair

Given two lists of integers, use a labeled nested loop to find and print the
first pair `(a, b)` (one from each list, in order) whose sum equals a target
value, then stop searching immediately.

```kotlin-runnable
fun main() {
    val listA = listOf(1, 4, 6, 9)
    val listB = listOf(2, 5, 7)
    val target = 11
    // Your code here
}
```

::: details Solution
```kotlin
fun main() {
    val listA = listOf(1, 4, 6, 9)
    val listB = listOf(2, 5, 7)
    val target = 11

    search@ for (a in listA) {
        for (b in listB) {
            if (a + b == target) {
                println("Found pair: $a + $b = $target")
                break@search
            }
        }
    }
}
```
Without the `search@` label, `break` alone would only exit the inner loop
over `listB`, and the outer loop would keep trying more values of `a` even
after a match was found.
:::

Next: [Functions](/basics/functions)
