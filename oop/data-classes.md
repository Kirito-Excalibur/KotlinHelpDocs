# Data Classes

Java classes that exist mainly to hold data usually come with a wall of
boilerplate: `equals`, `hashCode`, `toString`, maybe a builder. Kotlin
generates all of that for you if you mark the class `data`:

```kotlin-runnable
data class User(val name: String, val age: Int)

fun main() {
    val user = User("Ada", 30)
    println(user) // toString() is generated
}
```

Run it — you get `User(name=Ada, age=30)`, not the default
`User@1b6d3586`-style output you'd get from a plain class.

## What the compiler generates

For a `data class`, based on the properties declared in the **primary
constructor**, Kotlin generates:

- `toString()` — a readable `ClassName(prop1=value1, prop2=value2)` form.
- `equals()` / `hashCode()` — structural equality, comparing every
  constructor property, instead of the default reference equality.
- `copy()` — produces a new instance with some properties changed, leaving
  the rest as-is.
- `componentN()` functions (`component1()`, `component2()`, ...) — one per
  constructor property, in declaration order, enabling destructuring.

```kotlin-runnable
data class User(val name: String, val age: Int)

fun main() {
    val a = User("Ada", 30)
    val b = User("Ada", 30)
    val c = a.copy(age = 31)

    println(a == b)       // true — structural equality, not reference equality
    println(a === b)      // false — different objects
    println(c)
}
```

`copy()` is especially useful with immutable (`val`-only) data classes:
instead of mutating in place, you produce a modified copy and discard the
original.

## Destructuring declarations

Because a data class gets `componentN()` functions, you can unpack it into
separate variables in one line:

```kotlin-runnable
data class User(val name: String, val age: Int)

fun main() {
    val user = User("Ada", 30)
    val (name, age) = user
    println("$name is $age")
}
```

This works anywhere a `componentN()` sequence is available — including,
handily, when iterating over a `Map`:

```kotlin-runnable
fun main() {
    val scores = mapOf("Ada" to 95, "Grace" to 88)
    for ((name, score) in scores) {
        println("$name: $score")
    }
}
```

(`Map.Entry` provides `component1()`/`component2()` for key and value —
nothing to do with data classes specifically, but it's the same mechanism.)

## Requirements and restrictions

A few rules the compiler enforces:

- The primary constructor must have **at least one parameter**.
- All primary constructor parameters must be `val` or `var`.
- A data class can't be `abstract`, `open`, `sealed`, or `inner`.

```kotlin-runnable
data class Point(val x: Int, val y: Int)

fun main() {
    val p = Point(1, 2)
    println(p)
}
```

### The inheritance gotcha

Data classes *can* extend another class or implement interfaces, but the
generated `equals()`/`hashCode()`/`toString()`/`copy()` only ever consider
properties declared in **that data class's own primary constructor** — never
properties inherited from a superclass, and never properties added in the
class body instead of the constructor:

```kotlin-runnable
open class Named(val name: String)

data class Employee(val id: Int) : Named("placeholder") {
    var department: String = "Unassigned" // not in the constructor
}

fun main() {
    val e1 = Employee(1)
    val e2 = Employee(1)
    e2.department = "Engineering"

    println(e1 == e2) // true! department isn't part of equals()
    println(e1)        // toString() only shows `id`, not `name` or `department`
}
```

This is a real footgun: it's easy to assume `data class` gives you "full"
structural equality when it actually only covers the primary constructor's
own parameters. If you need every field compared, put every field in the
primary constructor, or write `equals()`/`hashCode()` by hand.

## Tasks

### Task 1: `Point` with destructuring

Define `data class Point(val x: Int, val y: Int)`. Create two points with
the same coordinates and print whether they're `==`. Then destructure one
of them into `x` and `y` variables and print `"x=$x, y=$y"`.

```kotlin-runnable
// Your code here

fun main() {

}
```

::: details Solution
```kotlin
data class Point(val x: Int, val y: Int)

fun main() {
    val a = Point(3, 4)
    val b = Point(3, 4)
    println(a == b)

    val (x, y) = a
    println("x=$x, y=$y")
}
```
:::

### Task 2: `copy()` for an immutable update

Define `data class Product(val name: String, val price: Double, val
inStock: Boolean)`. Create a product, then use `copy()` to produce a second
product with the same name and price but `inStock = false`, without
mutating the original. Print both.

::: details Solution
```kotlin
data class Product(val name: String, val price: Double, val inStock: Boolean)

fun main() {
    val original = Product("Keyboard", 49.99, inStock = true)
    val soldOut = original.copy(inStock = false)

    println(original)
    println(soldOut)
}
```
:::

Next: [Sealed Classes](/oop/sealed-classes)
