# Basic Types

Kotlin has the same basic numeric and text types you'd expect from any
statically-typed language, but it handles them a bit differently from Java:
there's no visible split between primitives and boxed wrapper types, and
there are no implicit widening conversions.

## Numbers

```kotlin-runnable
fun main() {
    val byteVal: Byte = 127
    val shortVal: Short = 32_000
    val intVal: Int = 2_147_483_647
    val longVal: Long = 9_000_000_000L
    val floatVal: Float = 3.14f
    val doubleVal: Double = 3.14159265358979

    println("$byteVal $shortVal $intVal $longVal $floatVal $doubleVal")
}
```

- `Byte` — 8-bit, `Short` — 16-bit, `Int` — 32-bit, `Long` — 64-bit.
- `Float` — 32-bit IEEE 754, `Double` — 64-bit IEEE 754.
- Integer literals default to `Int` unless they overflow it (in which case
  Kotlin infers `Long`) or you add an `L` suffix explicitly.
- Floating-point literals default to `Double` unless you add an `f`/`F`
  suffix for `Float`.

Underscores can be used anywhere inside a numeric literal to group digits —
they're purely for readability and don't affect the value:

```kotlin-runnable
fun main() {
    val creditCardNumber = 1234_5678_9012_3456L
    val socialSecurityNumber = 999_99_9999L
    val hexBytes = 0xFF_EC_DE_5E
    val bytes = 0b0100_1010_1110_1101

    println(creditCardNumber)
    println(hexBytes)
    println(bytes)
}
```

Hex literals use the `0x` prefix and binary literals use `0b` — there's no
octal literal syntax in Kotlin.

## Everything is an object

Unlike Java, Kotlin doesn't expose a separate "primitive" and "boxed"
version of `Int` in source code — there's just `Int`, and it has member
functions and can be used anywhere an object is expected (as a generic type
argument, for instance).

```kotlin-runnable
fun main() {
    val x: Int = 42
    println(x.toString())
    println(x.coerceAtLeast(50))

    val numbers: List<Int> = listOf(1, 2, 3)
    println(numbers)
}
```

Under the hood, the Kotlin compiler still uses the JVM's primitive `int`,
`long`, `double`, etc. wherever it can for performance, and only boxes to the
wrapper classes (`java.lang.Integer` and friends) when a nullable type or a
generic type parameter requires an actual object reference. That's purely an
implementation detail — from Kotlin code, `Int` always looks and behaves
like a single, consistent type.

## No implicit widening conversions

This is the biggest practical difference from Java: Kotlin will not
silently convert a smaller numeric type into a bigger one, even when no
precision could be lost.

```kotlin-runnable
fun main() {
    val i: Int = 100
    // val l: Long = i        // compile error in Kotlin!
    val l: Long = i.toLong()  // must convert explicitly

    println(l)
}
```

In Java, `long l = i;` compiles fine because `int` widens to `long`
automatically. Kotlin requires an explicit conversion function for every
numeric type: `toByte()`, `toShort()`, `toInt()`, `toLong()`, `toFloat()`,
`toDouble()`, and `toChar()` are defined on every number type.

```kotlin-runnable
fun main() {
    val d: Double = 3.99
    val i: Int = d.toInt()      // truncates toward zero, not rounds
    val backToDouble = i.toDouble()

    println("$d -> $i -> $backToDouble")
}
```

The rationale: implicit widening in Java has caused real bugs (an `Int`
silently participating in `Double` arithmetic and losing precision
unexpectedly). Kotlin makes every conversion visible in the source.

For converting text to numbers, use `toInt()`, `toDouble()`, etc. on
`String` — or the safer `toIntOrNull()` family, which returns `null` instead
of throwing when the string isn't a valid number (more on handling that
`null` in [Null Safety](/basics/nullable-types)).

```kotlin-runnable
fun main() {
    val validText = "42"
    val invalidText = "not a number"

    println(validText.toInt())
    println(invalidText.toIntOrNull())
}
```

## `Char` and `Boolean`

`Char` represents a single UTF-16 code unit and is written in single quotes
— it is *not* a numeric type in Kotlin, unlike C, so you can't use a `Char`
directly where an `Int` is expected.

```kotlin-runnable
fun main() {
    val letter: Char = 'K'
    val digit: Char = '7'

    println(letter.isLetter())
    println(digit.digitToInt())
    println(letter + 1)   // Char + Int = Char, this yields 'L'
}
```

`Boolean` has exactly two values, `true` and `false`, and supports the usual
`&&`, `||`, and `!` operators, which you'll see in full in
[Operators](/basics/operators).

## Arithmetic and overflow

Standard arithmetic operators (`+ - * / %`) work as you'd expect, but
integer division truncates, and fixed-width integer types wrap around on
overflow rather than throwing an exception.

```kotlin-runnable
fun main() {
    println(7 / 2)          // 3, integer division
    println(7.0 / 2)        // 3.5, one operand is a Double

    val maxInt = Int.MAX_VALUE
    println(maxInt + 1)     // wraps around to Int.MIN_VALUE
}
```

If you need arithmetic that throws on overflow instead of wrapping, the
standard library provides `addExact`-style checked operations via
`Math.addExact` (from Java interop) or you can reach for `Long`/`BigInteger`
when the range matters.

## Tasks

### Task 1: Fix the conversion

The following code doesn't compile. Fix it without changing the declared
types of `count` or `total`.

```kotlin-runnable
fun main() {
    val count: Int = 5
    val total: Long = 10_000_000_000L

    val combined: Long = total + count
    println(combined)
}
```

::: details Solution
```kotlin
fun main() {
    val count: Int = 5
    val total: Long = 10_000_000_000L

    val combined: Long = total + count.toLong()
    println(combined)
}
```
Kotlin's `+` on `Long` and `Int` actually is defined (arithmetic operators
have overloads across numeric type pairs and the result widens to `Long`
automatically), so this particular line would compile as written. The fix
that's *always* needed is when you assign across types directly, e.g.
`val combined: Long = count` — that requires `count.toLong()`. If your
snippet used direct assignment instead of `+`, the explicit `.toLong()` call
is the fix.
:::

### Task 2: Hex and binary literals

Declare an `Int` named `flags` using a binary literal representing the bits
`1010`, and an `Int` named `color` using a hex literal for `0xC0FFEE`. Print
both.

::: details Solution
```kotlin
fun main() {
    val flags = 0b1010
    val color = 0xC0FFEE

    println(flags)
    println(color)
}
```
:::

### Task 3: Safe string-to-number conversion

Write a function `parseOrZero(text: String): Int` that returns the parsed
integer, or `0` if `text` isn't a valid integer. Use it on `"123"` and
`"oops"`.

::: details Solution
```kotlin
fun parseOrZero(text: String): Int {
    return text.toIntOrNull() ?: 0
}

fun main() {
    println(parseOrZero("123"))
    println(parseOrZero("oops"))
}
```
`toIntOrNull()` returns `Int?` instead of throwing a `NumberFormatException`,
and the Elvis operator `?:` supplies the fallback. Full details on both are
in [Null Safety](/basics/nullable-types).
:::

Next: [Strings](/basics/strings)
