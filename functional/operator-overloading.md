# Operator Overloading

Kotlin lets your own types respond to built-in operators like `+`, `-`,
`[]`, and even `()`, by implementing specially-named functions marked with
the `operator` keyword. The compiler translates operator syntax into a call
to that function — nothing more magical than that.

## `plus`, `minus`, `times`: arithmetic operators

Define `operator fun plus(other: T): T` on a class, and `a + b` becomes
`a.plus(b)`.

```kotlin-runnable
data class Vector2D(val x: Double, val y: Double) {
    operator fun plus(other: Vector2D): Vector2D = Vector2D(x + other.x, y + other.y)
    operator fun minus(other: Vector2D): Vector2D = Vector2D(x - other.x, y - other.y)
    operator fun times(scalar: Double): Vector2D = Vector2D(x * scalar, y * scalar)
}

fun main() {
    val a = Vector2D(1.0, 2.0)
    val b = Vector2D(3.0, 4.0)

    println(a + b)       // Vector2D(x=4.0, y=6.0)
    println(a - b)       // Vector2D(x=-2.0, y=-2.0)
    println(a * 2.0)     // Vector2D(x=2.0, y=4.0)
}
```

Each arithmetic symbol maps to a fixed function name the compiler looks for:

| Expression | Function called |
|---|---|
| `a + b` | `a.plus(b)` |
| `a - b` | `a.minus(b)` |
| `a * b` | `a.times(b)` |
| `a / b` | `a.div(b)` |
| `a % b` | `a.rem(b)` |
| `-a` | `a.unaryMinus()` |
| `+a` | `a.unaryPlus()` |

There's nothing special about the parameter or return types — `plus` here
returns another `Vector2D`, but it doesn't have to be the same type. A
`Path + Point` operation, for instance, could reasonably return a `Path`.

Note that `data class` already gives you a correct `toString()` (used
above), plus `equals()` and `hashCode()`, which is why `println(a + b)`
prints a readable `Vector2D(x=4.0, y=6.0)` without any extra code.

## `get` and `set`: indexing

Implement `operator fun get(index: ...)` to support the `container[index]`
syntax, and `operator fun set(index: ..., value: ...)` for
`container[index] = value`.

```kotlin-runnable
class Grid(private val width: Int, private val height: Int) {
    private val cells = IntArray(width * height)

    operator fun get(x: Int, y: Int): Int = cells[y * width + x]

    operator fun set(x: Int, y: Int, value: Int) {
        cells[y * width + x] = value
    }
}

fun main() {
    val grid = Grid(3, 3)
    grid[0, 0] = 1
    grid[1, 1] = 5
    grid[2, 2] = 9

    println(grid[1, 1])
    println(grid[0, 0] + grid[2, 2])
}
```

`grid[1, 1] = 5` calls `grid.set(1, 1, 5)`; `grid[1, 1]` calls
`grid.get(1, 1)`. You can overload `get`/`set` with as many parameters as
you like — this is exactly how `Array`, `List`, and `Map` support `[]` in
the standard library, and how the earlier chapters' `list[0]` syntax works
under the hood.

## `invoke`: calling an instance like a function

`operator fun invoke(...)` lets you call an instance directly with `()`,
as if it were a function itself. This is how you'd build something like a
reusable, configurable action.

```kotlin-runnable
class Greeter(val greeting: String) {
    operator fun invoke(name: String): String = "$greeting, $name!"
}

fun main() {
    val hello = Greeter("Hello")
    val yo = Greeter("Yo")

    println(hello("Ada"))  // Hello, Ada!
    println(yo("Kotlin"))  // Yo, Kotlin!
}
```

`hello("Ada")` is shorthand for `hello.invoke("Ada")`. `invoke` can take any
number of parameters (even zero), and it's overloadable like any other
function.

## `compareTo`: enabling `<`, `>`, `<=`, `>=`

Implementing `operator fun compareTo(other: T): Int` lets the four
relational operators work on your type. It must return a negative number,
zero, or a positive number, the same contract as `Comparable.compareTo`.

```kotlin-runnable
class Money(val cents: Int) : Comparable<Money> {
    override fun compareTo(other: Money): Int = cents.compareTo(other.cents)

    override fun toString(): String = "$${cents / 100}.${(cents % 100).toString().padStart(2, '0')}"
}

fun main() {
    val price = Money(1050)
    val budget = Money(2000)

    println(price < budget)
    println(price > budget)
    println(maxOf(price, budget))
}
```

Implementing `Comparable<T>` (rather than just adding a standalone
`compareTo`) is the idiomatic route — it's what `sorted()`, `maxOf`, and
`sortedBy` on comparable types rely on, and `compareTo` on `Comparable` is
already marked `operator` for you, so `<` and `>` work immediately.

## A worked example: `Money` with `plus`

Putting several operators on one type is common for anything that behaves
like a number — currency, durations, vectors. Here's `Money` extended with
addition and a sanity check:

```kotlin-runnable
data class Money(val cents: Int) : Comparable<Money> {
    operator fun plus(other: Money): Money = Money(cents + other.cents)
    operator fun minus(other: Money): Money {
        val result = cents - other.cents
        require(result >= 0) { "Money can't go negative" }
        return Money(result)
    }

    override fun compareTo(other: Money): Int = cents.compareTo(other.cents)
    override fun toString(): String = "$${cents / 100}.${(cents % 100).toString().padStart(2, '0')}"
}

fun main() {
    val price = Money(1050)
    val tax = Money(84)
    val total = price + tax

    println(total)
    println(total > price)

    val budget = Money(500)
    val refund = budget - price // throws: would go negative
}
```

Running this throws an `IllegalArgumentException` from `require` — a
reminder that operator functions are ordinary functions and can validate
their inputs just like any other method.

## Tasks

### Task 1: `Fraction` with `plus` and `times`

Implement a `data class Fraction(val numerator: Int, val denominator: Int)`
with `operator fun plus` and `operator fun times` for fraction arithmetic
(don't worry about simplifying the result). Recall that
`a/b + c/d = (a*d + c*b) / (b*d)` and `a/b * c/d = (a*c) / (b*d)`.

```kotlin-runnable
data class Fraction(val numerator: Int, val denominator: Int) {
    // Your code here
}

fun main() {
    val half = Fraction(1, 2)
    val third = Fraction(1, 3)

    println(half + third) // Fraction(numerator=5, denominator=6)
    println(half * third) // Fraction(numerator=1, denominator=6)
}
```

::: details Solution
```kotlin
data class Fraction(val numerator: Int, val denominator: Int) {
    operator fun plus(other: Fraction): Fraction =
        Fraction(numerator * other.denominator + other.numerator * denominator, denominator * other.denominator)

    operator fun times(other: Fraction): Fraction =
        Fraction(numerator * other.numerator, denominator * other.denominator)
}

fun main() {
    val half = Fraction(1, 2)
    val third = Fraction(1, 3)

    println(half + third)
    println(half * third)
}
```
:::

### Task 2: A `Matrix2x2` you can index and compare-by-magnitude

Write a `Matrix2x2(private val data: Array<Array<Double>>)` (2x2 only) with
an `operator fun get(row: Int, col: Int): Double`. Then write a small
`main` that builds one and prints `matrix[0, 1]`.

```kotlin-runnable
class Matrix2x2(private val data: Array<Array<Double>>) {
    // Your code here
}

fun main() {
    val m = Matrix2x2(arrayOf(arrayOf(1.0, 2.0), arrayOf(3.0, 4.0)))
    println(m[0, 1]) // 2.0
    println(m[1, 0]) // 3.0
}
```

::: details Solution
```kotlin
class Matrix2x2(private val data: Array<Array<Double>>) {
    operator fun get(row: Int, col: Int): Double = data[row][col]
}

fun main() {
    val m = Matrix2x2(arrayOf(arrayOf(1.0, 2.0), arrayOf(3.0, 4.0)))
    println(m[0, 1])
    println(m[1, 0])
}
```
The `get` operator here just forwards to the underlying nested array's
indexing — the point is that `m[row, col]` reads far better than a method
like `m.valueAt(row, col)` for anything that's conceptually a grid.
:::

Next: [Equality](/functional/equality)
