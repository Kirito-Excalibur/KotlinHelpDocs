# Equality

Kotlin draws a sharp line between two kinds of equality that many languages
blur or name differently: **structural equality** (do these two things
represent the same value?) and **referential equality** (are these two
things literally the same object in memory?).

## `==` is structural equality

In Kotlin, `==` does *not* mean "same reference," the way `==` does for
objects in Java. `==` calls `.equals()` under the hood (with a null check
built in), and it's the operator you want almost all the time.

```kotlin-runnable
data class Point(val x: Int, val y: Int)

fun main() {
    val a = Point(1, 2)
    val b = Point(1, 2)

    println(a == b)        // true: same values, calls a.equals(b)
    println(a.equals(b))   // exactly the same thing, spelled out
}
```

`a` and `b` are two separate `Point` instances, but `==` reports them equal
because `data class` generates an `equals()` that compares properties, not
identity.

## `===` is referential equality

`===` asks the question Java's `==` asks for objects: are these two
references pointing at the exact same instance?

```kotlin-runnable
data class Point(val x: Int, val y: Int)

fun main() {
    val a = Point(1, 2)
    val b = Point(1, 2)
    val c = a

    println(a === b) // false: different objects, even though they're equal
    println(a === c) // true: c is literally the same reference as a
    println(a == b)  // true: still structurally equal
}
```

As a rule: reach for `==` when comparing values (which is almost always),
and `===` only when you specifically need to know whether two variables
refer to the identical object — for example, checking a cache hit, or
short-circuiting an expensive equality check when two references are known
to be the same object.

## Why `data class` gives you `equals`/`hashCode` for free

A plain `class` inherits `equals()` from `Any`, which defaults to reference
comparison — so for a plain class, `==` and `===` behave the same way:

```kotlin-runnable
class PlainPoint(val x: Int, val y: Int)

fun main() {
    val a = PlainPoint(1, 2)
    val b = PlainPoint(1, 2)

    println(a == b)  // false! PlainPoint has no custom equals(), so this falls back to reference equality
    println(a === b) // false, as expected
}
```

Marking the class `data` (see [Classes and Instances](/oop/classes-and-instances)
for the rest of what `data class` generates) makes the compiler write
`equals()` and `hashCode()` based on every property listed in the primary
constructor — which is exactly why the `Point` examples above compared by
value automatically.

## Overriding `equals`/`hashCode` yourself

Sometimes a plain class needs custom equality — maybe you only want some
properties to count, or the class isn't a good fit for `data class` (it has
mutable identity-like state, or inheritance you need to manage carefully).
You can override both manually:

```kotlin-runnable
class Point(val x: Int, val y: Int) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Point) return false
        return x == other.x && y == other.y
    }

    override fun hashCode(): Int {
        return 31 * x + y
    }
}

fun main() {
    val a = Point(1, 2)
    val b = Point(1, 2)

    println(a == b)
    println(setOf(a, b).size) // 1: a hash-based collection sees them as duplicates
}
```

Notice the shape of a correct `equals()`:

1. `if (this === other) return true` — a fast path for the identical-object
   case.
2. `if (other !is Point) return false` — reject anything of the wrong type
   (this also handles `null`, since `null !is Point` is `true`).
3. Compare the fields that determine equality.

## The contract you must uphold

If you override `equals()`, you **must** override `hashCode()` consistently,
or you'll break every hash-based collection (`HashSet`, `HashMap`, and
anything built on them). The rule is simple but strict: **if `a == b`, then
`a.hashCode() == b.hashCode()`.** The reverse isn't required — two unequal
objects are allowed to share a hash code (a "hash collision"), just not the
other way around.

```kotlin-runnable
class BrokenPoint(val x: Int, val y: Int) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is BrokenPoint) return false
        return x == other.x && y == other.y
    }
    // hashCode() NOT overridden — still uses the default, identity-based one
}

fun main() {
    val a = BrokenPoint(1, 2)
    val b = BrokenPoint(1, 2)

    println(a == b)                 // true
    println(a.hashCode() == b.hashCode()) // false! contract violated
    println(setOf(a, b).size)       // 2 — a HashSet can't tell they're "equal"
}
```

`setOf(a, b)` should contain one element if `a == b`, but because
`hashCode()` disagrees, a hash-based `Set` puts them in different buckets
and never even calls `equals()` to compare them. This is exactly the bug
class the contract exists to prevent — always override both together, and
`data class` is the easiest way to guarantee you never get this wrong by
hand.

`equals()` also has its own required properties, inherited from `Any`:
it must be *reflexive* (`a == a`), *symmetric* (`a == b` implies `b == a`),
*transitive* (`a == b && b == c` implies `a == c`), and *consistent*
(repeated calls give the same result, provided nothing used in the
comparison changed).

## `hashCode()` on nullable receivers

Because `equals` and `hashCode` are defined on `Any`, not `Any?`, calling
them on a value that might be `null` needs care. Kotlin's standard library
provides an extension so you don't have to null-check by hand:

```kotlin-runnable
fun main() {
    val name: String? = null
    val other: String? = "Kotlin"

    println(name.hashCode())   // 0 — the extension on Any? returns 0 for null
    println(other.hashCode())  // String's own hashCode()
}
```

`Any?.hashCode()` is an extension function defined in the standard library
specifically to make `null` safe to hash: it returns `0` for `null` instead
of throwing, which is what lets nullable keys work correctly in `HashMap`
and `HashSet`.

## Tasks

### Task 1: Predict the output

Without running it first, decide what each line prints, then check your
answer.

```kotlin-runnable
data class Box(val label: String)

fun main() {
    val a = Box("gift")
    val b = Box("gift")
    val c = a

    println(a == b)
    println(a === b)
    println(a === c)
    println(a.hashCode() == b.hashCode())
}
```

::: details Solution
```kotlin
data class Box(val label: String)

fun main() {
    val a = Box("gift")
    val b = Box("gift")
    val c = a

    println(a == b)                    // true: data class compares by value
    println(a === b)                   // false: different objects
    println(a === c)                   // true: c is the same reference as a
    println(a.hashCode() == b.hashCode()) // true: data class keeps equals/hashCode consistent
}
```
:::

### Task 2: Fix the broken equality

This class is meant to treat two `CaseInsensitiveName`s as equal when their
`value`s match ignoring case, but it's broken — a `HashSet` doesn't
deduplicate them correctly. Find and fix the bug.

```kotlin-runnable
class CaseInsensitiveName(val value: String) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is CaseInsensitiveName) return false
        return value.equals(other.value, ignoreCase = true)
    }
    // Bug is somewhere around here
}

fun main() {
    val names = setOf(CaseInsensitiveName("Kotlin"), CaseInsensitiveName("KOTLIN"))
    println(names.size) // should print 1, but doesn't yet
}
```

::: details Solution
```kotlin
class CaseInsensitiveName(val value: String) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is CaseInsensitiveName) return false
        return value.equals(other.value, ignoreCase = true)
    }

    override fun hashCode(): Int {
        return value.lowercase().hashCode()
    }
}

fun main() {
    val names = setOf(CaseInsensitiveName("Kotlin"), CaseInsensitiveName("KOTLIN"))
    println(names.size)
}
```
The class had `equals()` but no matching `hashCode()`, so it inherited the
default identity-based hash — violating the "equal objects must have equal
hash codes" rule. `hashCode()` now normalizes the case the same way
`equals()` does, so two names that compare equal always hash the same.
:::

Next: [Overview](/collections/overview)
