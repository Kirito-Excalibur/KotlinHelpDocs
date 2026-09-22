# Object Expressions & Declarations

Kotlin's `object` keyword covers three related but distinct jobs: a
built-in singleton pattern, a replacement for Java's `static`, and a
lightweight alternative to anonymous inner classes. All three use the same
keyword because all three are, at heart, "declare a class and immediately
give me its one instance."

## `object` declarations: singletons without the boilerplate

In Java, a singleton means a private constructor, a static field, and
usually a static getter — plus care around thread safety. In Kotlin, you
just write `object` instead of `class`:

```kotlin-runnable
object AppConfig {
    var environment: String = "production"

    fun describe() = "Running in $environment"
}

fun main() {
    println(AppConfig.describe())
    AppConfig.environment = "staging"
    println(AppConfig.describe())
}
```

There is exactly one `AppConfig` for the lifetime of the program, it's
created lazily and thread-safely the first time it's referenced, and you
never call a constructor — you just refer to `AppConfig` by name, the same
way you'd refer to a class to call a static member in Java.

An `object` can extend a class or implement interfaces, just like a regular
class:

```kotlin-runnable
interface Logger {
    fun log(message: String)
}

object ConsoleLogger : Logger {
    override fun log(message: String) = println("[LOG] $message")
}

fun main() {
    ConsoleLogger.log("Application started")
}
```

## `companion object`: replacing `static`

Kotlin has no `static` keyword at all. Instead, a class can declare a
`companion object` inside it — a singleton tied to the class itself rather
than to any instance, used for factory functions, constants, and anything
else you'd have made `static` in Java:

```kotlin-runnable
class User private constructor(val name: String) {
    companion object {
        const val DEFAULT_NAME = "Guest"

        fun createGuest(): User = User(DEFAULT_NAME)

        fun createNamed(name: String): User = User(name)
    }
}

fun main() {
    val guest = User.createGuest()
    val ada = User.createNamed("Ada")
    println(guest.name)
    println(ada.name)
    println(User.DEFAULT_NAME)
}
```

Call members through the class name — `User.createGuest()`, not
`User.Companion.createGuest()` (though `User.Companion` does exist and can
be referenced explicitly if needed). This combination — a `private
constructor` plus a `companion object` factory — is a very common Kotlin
idiom for controlling how instances get created, which you saw briefly in
[Visibility Modifiers](/oop/visibility-modifiers).

A companion object can have a name, implement interfaces, and holds exactly
one instance per class — but a class can have at most one companion object.

```kotlin-runnable
class MathUtils {
    companion object Constants {
        const val PI_APPROX = 3.14159
    }
}

fun main() {
    println(MathUtils.PI_APPROX)          // usual access
    println(MathUtils.Constants.PI_APPROX) // explicit name also works
}
```

## Object expressions: anonymous objects

When you need a one-off instance of an interface or class — no name, used
right where it's created — use an object *expression* instead of a
declaration. This is Kotlin's equivalent of a Java anonymous inner class:

```kotlin-runnable
interface ClickListener {
    fun onClick()
}

fun registerListener(listener: ClickListener) {
    listener.onClick()
}

fun main() {
    registerListener(object : ClickListener {
        override fun onClick() {
            println("Clicked!")
        }
    })
}
```

Unlike an `object` declaration, an object expression is **not** a
singleton — every time that expression runs, it creates a new instance.
It can also access and modify variables from its enclosing scope, useful
for small stateful callbacks:

```kotlin-runnable
interface Counter {
    fun increment()
    fun current(): Int
}

fun main() {
    var count = 0
    val counter = object : Counter {
        override fun increment() {
            count++
        }
        override fun current(): Int = count
    }

    counter.increment()
    counter.increment()
    println(counter.current())
}
```

For most cases where Java would reach for an anonymous class implementing a
single-method interface, idiomatic Kotlin instead uses a plain lambda (a
topic for [Higher-Order Functions](/functional/higher-order-functions)) —
object expressions are what you fall back on when you need to implement an
interface with *more than one* member, or need real object identity.

## Tasks

### Task 1: Singleton ID generator

Define an `object IdGenerator` with a private `var nextId: Int = 1` and a
function `next(): Int` that returns the current value and increments it.
Call `next()` three times from `main` and print each result, proving it's a
single shared instance.

```kotlin-runnable
// Your code here

fun main() {

}
```

::: details Solution
```kotlin
object IdGenerator {
    private var nextId: Int = 1

    fun next(): Int {
        val id = nextId
        nextId++
        return id
    }
}

fun main() {
    println(IdGenerator.next())
    println(IdGenerator.next())
    println(IdGenerator.next())
}
```
:::

### Task 2: Factory via companion object

Define `class Circle private constructor(val radius: Double)` with a
`companion object` containing `fun fromDiameter(diameter: Double): Circle`
(dividing by 2) and `fun fromRadius(radius: Double): Circle`. Create one
circle each way and print their radii.

::: details Solution
```kotlin
class Circle private constructor(val radius: Double) {
    companion object {
        fun fromDiameter(diameter: Double): Circle = Circle(diameter / 2)
        fun fromRadius(radius: Double): Circle = Circle(radius)
    }
}

fun main() {
    val a = Circle.fromDiameter(10.0)
    val b = Circle.fromRadius(5.0)
    println(a.radius)
    println(b.radius)
}
```
:::

Next: [Extension Functions](/oop/extension-functions)
