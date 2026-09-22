# Operators

Kotlin's operators look almost identical to C-family languages on the
surface, with a few important additions and one crucial distinction around
equality.

## Arithmetic

```kotlin-runnable
fun main() {
    val a = 17
    val b = 5

    println(a + b)
    println(a - b)
    println(a * b)
    println(a / b)   // 3, integer division
    println(a % b)   // 2, remainder
}
```

Compound assignment operators (`+=`, `-=`, `*=`, `/=`, `%=`) work as
expected, and `++`/`--` exist as both prefix and postfix forms, same as
Java/C.

```kotlin-runnable
fun main() {
    var counter = 0
    counter++
    counter += 5
    println(counter)
}
```

## Comparison

`< > <= >=` compare naturally-ordered types (numbers, `String`, `Char`, and
anything implementing `Comparable`). Under the hood, `a < b` is actually
sugar for `a.compareTo(b) < 0`.

```kotlin-runnable
fun main() {
    println(3 < 5)
    println("apple" < "banana")   // lexicographic
    println('a' < 'b')
}
```

## Logical operators

`&&`, `||`, and `!` work as in most C-family languages, and `&&`/`||` are
short-circuiting.

```kotlin-runnable
fun main() {
    val age = 25
    val hasLicense = true

    println(age >= 18 && hasLicense)
    println(age < 18 || !hasLicense)
}
```

## `==` vs `===`

This is the one place Kotlin's operators genuinely diverge in meaning from
Java's. `==` is *structural* equality — it calls `.equals()` (with a
built-in null check) — while `===` is *referential* equality, checking
whether two variables point to the exact same object in memory.

```kotlin-runnable
fun main() {
    val a = Pair(1, 2)
    val b = Pair(1, 2)

    println(a == b)     // true: same contents
    println(a === b)    // false: different objects

    val c = a
    println(a === c)    // true: same reference
}
```

If you're coming from Java, this is the reverse of what you're used to:
Java's `==` on objects is referential, and you call `.equals()` for content
comparison. Kotlin flips the default because content comparison is what you
want the vast majority of the time. The full story — including how data
classes generate `equals()` automatically — is in
[Equality](/functional/equality).

## Ranges: `..` and `..<`

The `..` operator creates a closed range (inclusive of both ends). `..<`
creates a range that excludes the end value.

```kotlin-runnable
fun main() {
    val closed = 1..5      // 1, 2, 3, 4, 5
    val halfOpen = 1..<5   // 1, 2, 3, 4

    println(closed.toList())
    println(halfOpen.toList())
}
```

`..<` reads naturally as "up to, but not including" and replaces the older
`until` infix function you may see in existing Kotlin code (`1 until 5` is
equivalent to `1..<5`). Ranges are most commonly used with `for` loops,
covered in [Loops](/basics/loops), and with the `in` operator below.

## `in` and `!in`

`in` checks membership — in a range, a collection, or anything defining a
`contains` operator.

```kotlin-runnable
fun main() {
    val hour = 14

    println(hour in 9..17)          // within business hours?
    println(hour !in 0..<9)

    val fruits = listOf("apple", "banana", "cherry")
    println("banana" in fruits)
    println("mango" !in fruits)
}
```

`in` also drives the no-condition form of `for` loops and pattern branches
in `when`, both covered in the next two chapters.

## A precedence gotcha

Range operators bind tighter than you might expect relative to comparisons,
so mixing them without parentheses can surprise you.

```kotlin-runnable
fun main() {
    val x = 5

    // Intent: is x in the range 1 to 10?
    // println(1 <= x <= 10)  // does NOT compile — Kotlin has no operator chaining
    println(x in 1..10)       // this is the correct idiom
}
```

Kotlin doesn't support chained comparisons like `1 <= x <= 10` at all (each
`<=` returns a `Boolean`, and `Boolean <= Int` isn't defined) — always use
`in` with a range instead. Beyond that, standard precedence applies:
multiplicative operators bind tighter than additive ones, and both bind
tighter than comparisons, same as arithmetic in most languages. When in
doubt, add parentheses — they cost nothing and remove ambiguity for readers.

## Tasks

### Task 1: Structural vs referential

Given two separately-constructed `StringBuilder` instances with the same
text, predict and then verify with code what `==` and `===` print for them.

```kotlin-runnable
fun main() {
    val sb1 = StringBuilder("hi")
    val sb2 = StringBuilder("hi")
    // print == and === comparisons here
}
```

::: details Solution
```kotlin
fun main() {
    val sb1 = StringBuilder("hi")
    val sb2 = StringBuilder("hi")

    println(sb1 == sb2)     // true: StringBuilder's equals compares content... 
    println(sb1 === sb2)    // false: two distinct objects
}
```
Note: `StringBuilder` actually inherits `equals()` from `Any` (reference
equality) rather than overriding it, so in real Kotlin/JVM this prints
`false` then `false`. This is a good reminder that `==` is only as good as
the type's `equals()` implementation — for a type without a custom
`equals()`, `==` and `===` behave the same. Data classes and `String`, which
you've already seen, both override `equals()` to compare content.
:::

### Task 2: Range membership

Write a function `isValidPercentage(value: Int): Boolean` that returns
`true` if `value` is between 0 and 100 inclusive, using a range and `in`.

::: details Solution
```kotlin
fun isValidPercentage(value: Int): Boolean {
    return value in 0..100
}

fun main() {
    println(isValidPercentage(50))
    println(isValidPercentage(150))
    println(isValidPercentage(-5))
}
```
:::

### Task 3: Half-open range

Write a function `isValidIndex(index: Int, size: Int): Boolean` that returns
`true` when `index` is a valid index into a collection of the given `size`
(i.e. `0` up to but not including `size`). Use `..<`.

::: details Solution
```kotlin
fun isValidIndex(index: Int, size: Int): Boolean {
    return index in 0..<size
}

fun main() {
    println(isValidIndex(0, 3))
    println(isValidIndex(3, 3))
    println(isValidIndex(-1, 3))
}
```
:::

Next: [Conditions: if and when](/basics/conditions)
