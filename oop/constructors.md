# Constructors

You've already seen the **primary constructor** — the parameter list right
in the class header:

```kotlin-runnable
class Person(val name: String, var age: Int)

fun main() {
    val p = Person("Ada", 30)
    println("${p.name}, ${p.age}")
}
```

But there's more to constructors than that one line: initialization blocks,
secondary constructors, and default parameter values, which together make
Kotlin classes rarely need the constructor-overload pyramids common in Java.

## `init` blocks

The primary constructor's parameter list can't contain arbitrary code — no
validation logic, no logging, nothing but the parameter declarations. For
that, use one or more `init` blocks, which run as part of construction:

```kotlin-runnable
class Person(val name: String, age: Int) {
    val age: Int

    init {
        require(age >= 0) { "Age can't be negative" }
        this.age = age
        println("Created person: $name")
    }
}

fun main() {
    val p = Person("Ada", 30)
    println(p.age)
}
```

(That example is deliberately roundabout to show `init` explicitly — in
practice you'd just write `class Person(val name: String, val age: Int)`
with the validation in `init`, using the parameter directly.)

A more natural version:

```kotlin-runnable
class Person(val name: String, val age: Int) {
    init {
        require(age >= 0) { "Age can't be negative" }
    }

    val description = "$name is $age years old"
}

fun main() {
    val p = Person("Ada", 30)
    println(p.description)
}
```

### Execution order matters

This is the detail that trips people up: **`init` blocks and property
initializers run in the exact order they appear in the class body**, top to
bottom, interleaved with each other. It's not "all properties, then all
init blocks":

```kotlin-runnable
class Demo(name: String) {
    val first = println("Property 'first' initialized").let { "a" }

    init {
        println("First init block")
    }

    val second = println("Property 'second' initialized").let { "b" }

    init {
        println("Second init block")
    }
}

fun main() {
    Demo("x")
}
```

Run it — the output prints in top-to-bottom source order. A property
initializer that reads a `val` declared *later* in the class will fail or
see an uninitialized value, just like in Java's field-initializer ordering.

## Secondary constructors

A class can declare additional constructors with the `constructor` keyword.
Each secondary constructor must eventually delegate to the primary
constructor, using `: this(...)`:

```kotlin-runnable
class Point(val x: Int, val y: Int) {
    constructor(both: Int) : this(both, both)

    constructor() : this(0, 0)
}

fun main() {
    val a = Point(3, 4)
    val b = Point(5)   // (5, 5)
    val c = Point()    // (0, 0)
    println("${a.x},${a.y}  ${b.x},${b.y}  ${c.x},${c.y}")
}
```

The delegation runs *before* the secondary constructor's own body, and any
`init` blocks / property initializers from the primary constructor still run
as part of that delegation — so they only ever execute once, no matter which
constructor you called.

If a class has no primary constructor at all (no parameter list after the
class name), every secondary constructor must delegate to another one, or
must initialize things itself:

```kotlin-runnable
class Connection {
    val address: String

    constructor(host: String, port: Int) {
        address = "$host:$port"
    }

    constructor(url: String) {
        address = url
    }
}

fun main() {
    val a = Connection("localhost", 8080)
    val b = Connection("example.com/api")
    println(a.address)
    println(b.address)
}
```

## Default parameter values: usually the better tool

In Java, "different ways to construct an object" usually means overloaded
constructors. In Kotlin, the first tool to reach for is **default parameter
values**, not secondary constructors:

```kotlin-runnable
class HttpClient(
    val host: String,
    val port: Int = 80,
    val useTls: Boolean = false,
    val timeoutMs: Int = 5000
)

fun main() {
    val a = HttpClient("example.com")
    val b = HttpClient("example.com", 443, useTls = true)
    val c = HttpClient(host = "internal", timeoutMs = 30000)

    println("${a.host}:${a.port}")
    println("${b.host}:${b.port} tls=${b.useTls}")
    println("${c.host} timeout=${c.timeoutMs}")
}
```

One constructor, four call sites, none of them awkward — thanks to default
values plus **named arguments** (`useTls = true`), which let you skip
earlier defaults and target only the parameters you care about. This is why
idiomatic Kotlin code rarely needs a pile of secondary constructors: reach
for defaults and named arguments first, and reserve secondary constructors
for cases with genuinely different construction *logic* (like parsing a
single string into multiple fields above), not just different combinations
of values.

## Tasks

### Task 1: Validated `Rectangle`

Define `class Rectangle(val width: Double, val height: Double)` with an
`init` block that throws `IllegalArgumentException` if either dimension is
not positive. Add a `val area` property computed from `width * height`.

```kotlin-runnable
// Your code here

fun main() {

}
```

::: details Solution
```kotlin
class Rectangle(val width: Double, val height: Double) {
    init {
        require(width > 0) { "width must be positive" }
        require(height > 0) { "height must be positive" }
    }

    val area: Double = width * height
}

fun main() {
    val r = Rectangle(3.0, 4.0)
    println(r.area)
    val bad = Rectangle(-1.0, 4.0) // throws
}
```
:::

### Task 2: `Color` with a secondary constructor

Define `class Color(val red: Int, val green: Int, val blue: Int)`. Add a
secondary constructor `Color(gray: Int)` that delegates to the primary
constructor with `gray` used for all three channels. Also give `port`-style
defaults a try: add a fourth primary-constructor parameter `alpha: Int = 255`.

::: details Solution
```kotlin
class Color(val red: Int, val green: Int, val blue: Int, val alpha: Int = 255) {
    constructor(gray: Int) : this(gray, gray, gray)
}

fun main() {
    val white = Color(255, 255, 255)
    val gray = Color(128)
    val translucentBlack = Color(0, 0, 0, alpha = 100)

    println("${white.red},${white.green},${white.blue},${white.alpha}")
    println("${gray.red},${gray.green},${gray.blue},${gray.alpha}")
    println("${translucentBlack.red},${translucentBlack.green},${translucentBlack.blue},${translucentBlack.alpha}")
}
```
:::

Next: [Inheritance](/oop/inheritance)
