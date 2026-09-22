# Properties and Fields

In Java, a class typically has private **fields** plus public **getter and
setter methods** that wrap them — two concepts, glued together by convention.
Kotlin collapses this into one concept: a **property**. Every `val`/`var`
you declare in a class already behaves like a getter (and setter, for `var`)
from the outside, even though you write it like a field.

```kotlin-runnable
class Temperature {
    var celsius: Double = 0.0
}

fun main() {
    val t = Temperature()
    t.celsius = 25.0       // looks like field access...
    println(t.celsius)     // ...but it's actually calling a generated getter/setter
}
```

Under the hood, the compiler generates a private backing field plus a
default `get()` and `set()` for `celsius`. You never see that code, but you
can replace it with your own.

## Custom getters

A property doesn't need to store anything at all — it can compute its value
every time it's read:

```kotlin-runnable
class Rectangle(val width: Double, val height: Double) {
    val area: Double
        get() = width * height
}

fun main() {
    val r = Rectangle(3.0, 4.0)
    println(r.area)
    // r.area = 10.0 // would not compile — no setter, and no backing field to set
}
```

`area` here has **no backing field** — there's nothing to store, since it's
recomputed from `width` and `height` on every access. This is a genuinely
different mental model from Java: a "property" in Kotlin can be pure
computation, not just a value with accessor sugar around it.

## Custom setters and the `field` identifier

When you *do* want to store a value but need to intercept reads or writes,
use the special identifier `field` inside your accessor — it refers to the
compiler-generated backing field. You can't reference it anywhere else:

```kotlin-runnable
class User {
    var name: String = ""
        set(value) {
            field = value.trim().replaceFirstChar { it.uppercase() }
        }
}

fun main() {
    val u = User()
    u.name = "  ada  "
    println("[${u.name}]")
}
```

If your accessor body never mentions `field`, Kotlin knows the property has
no backing storage at all (like `area` above). If it does mention `field`
anywhere in a getter or setter, the compiler generates one.

Here's a property with both a custom getter and setter, enforcing an
invariant:

```kotlin-runnable
class Person {
    var age: Int = 0
        set(value) {
            if (value < 0) throw IllegalArgumentException("Age can't be negative")
            field = value
        }

    val isAdult: Boolean
        get() = age >= 18
}

fun main() {
    val p = Person()
    p.age = 20
    println(p.isAdult)
    p.age = -5 // throws
}
```

## `lateinit var`

Sometimes a property genuinely can't be given a value in the constructor —
common with dependency injection, or in test setup functions — but you
still don't want it nullable just to work around that. `lateinit` lets you
promise the compiler "this will be set before it's used":

```kotlin-runnable
class Report {
    lateinit var title: String

    fun printTitle() {
        if (::title.isInitialized) {
            println(title)
        } else {
            println("Title not set yet")
        }
    }
}

fun main() {
    val report = Report()
    report.printTitle()
    report.title = "Q3 Results"
    report.printTitle()
}
```

`lateinit` only works with `var` properties of non-nullable, non-primitive
types (no `Int`, `Boolean`, etc.). Reading a `lateinit` property before it's
set throws `UninitializedPropertyAccessException` — better than a silent
`null`, but still a runtime crash, so use it sparingly and only when
initialization order genuinely can't happen in the constructor.

## `by lazy { }`, briefly

Related, but for read-only properties: `by lazy { }` defers computing a
`val` until its first read, then caches the result:

```kotlin-runnable
class Config {
    val expensiveValue: String by lazy {
        println("Computing...")
        "result"
    }
}

fun main() {
    val config = Config()
    println("Config created")
    println(config.expensiveValue) // "Computing..." prints here, not before
    println(config.expensiveValue) // cached, no recomputation
}
```

`by lazy` is one example of a **delegated property** — a whole mechanism for
handing off a property's get/set logic to a reusable helper object. We'll
cover it properly, along with writing your own delegates, in
[Delegation](/oop/delegation).

## Tasks

### Task 1: Full name property

Define a class `Person(val firstName: String, val lastName: String)` with a
read-only computed property `fullName` that returns `"$firstName $lastName"`
without storing it.

```kotlin-runnable
// Your code here

fun main() {

}
```

::: details Solution
```kotlin
class Person(val firstName: String, val lastName: String) {
    val fullName: String
        get() = "$firstName $lastName"
}

fun main() {
    val p = Person("Ada", "Lovelace")
    println(p.fullName)
}
```
:::

### Task 2: Validated password

Define a class `Account` with a `var password: String` property whose
setter rejects (throws `IllegalArgumentException`) any value shorter than 8
characters, otherwise stores it normally.

::: details Solution
```kotlin
class Account {
    var password: String = ""
        set(value) {
            if (value.length < 8) {
                throw IllegalArgumentException("Password too short")
            }
            field = value
        }
}

fun main() {
    val account = Account()
    account.password = "supersecret"
    println("Password set")
    account.password = "short" // throws
}
```
:::

Next: [Constructors](/oop/constructors)
