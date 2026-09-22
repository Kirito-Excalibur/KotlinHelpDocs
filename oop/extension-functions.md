# Extension Functions

Extension functions let you add new functions to a class you don't own —
including Kotlin's own standard library types — without subclassing it or
using inheritance-based tricks. It's the closest thing Kotlin has to Java's
static utility-method-taking-the-object-as-first-parameter pattern
(`Collections.sort(list)`), except it reads and calls exactly like a normal
method (`list.sort()`).

```kotlin-runnable
fun String.shout(): String = this.uppercase() + "!"

fun main() {
    val message = "hello"
    println(message.shout())
}
```

The syntax is `fun ReceiverType.functionName(...)`. Inside the function
body, `this` refers to the instance the extension was called on — the
**receiver** — exactly as if you'd written the method inside `String`
itself. You can even drop the explicit `this.`:

```kotlin-runnable
fun String.shout(): String = uppercase() + "!"

fun main() {
    println("kotlin".shout())
}
```

## Extending standard library types

This is where extension functions feel most natural — you're adding
exactly the helper the stdlib doesn't happen to provide, right on the type
you're already using:

```kotlin-runnable
fun Int.isEven(): Boolean = this % 2 == 0

fun List<Int>.secondOrNull(): Int? = if (size >= 2) this[1] else null

fun main() {
    println(4.isEven())
    println(listOf(10, 20, 30).secondOrNull())
    println(listOf(10).secondOrNull())
}
```

A huge portion of Kotlin's own standard library — `map`, `filter`,
`joinToString`, `trim`, and dozens more — is *itself* implemented as
extension functions on `Iterable`, `String`, and friends, rather than as
methods baked into those classes. Extension functions aren't a niche
feature; they're how idiomatic Kotlin is largely built.

## Extension properties

Same idea, for properties — though since there's no backing field to add to
an existing class, an extension property must be computed, never store
state directly:

```kotlin-runnable
val String.lastChar: Char
    get() = this[length - 1]

fun main() {
    println("Kotlin".lastChar)
}
```

## A practical example: extending a domain type

Extensions are especially useful for adding presentation or convenience
logic to your own data types without cluttering the core class:

```kotlin-runnable
data class Money(val cents: Long)

fun Money.formatted(): String {
    val dollars = cents / 100
    val remainder = cents % 100
    return "$%d.%02d".format(dollars, remainder)
}

fun main() {
    val price = Money(4999)
    println(price.formatted())
}
```

`Money` itself stays focused on representing an amount; formatting logic —
which might only matter in one part of an app — lives separately as an
extension, callable exactly like a member function.

## The gotcha: extensions are resolved statically

This is the one that catches people off guard: extension functions are
**not** virtual/polymorphic. Which extension gets called is decided at
compile time, based on the *declared* (static) type of the expression — not
the actual runtime type of the object, the way a real overridden member
function would be.

```kotlin-runnable
open class Animal
class Dog : Animal()

fun Animal.describe() = "An animal"
fun Dog.describe() = "A dog"

fun main() {
    val dog: Animal = Dog() // declared type is Animal, actual object is a Dog
    println(dog.describe()) // prints "An animal" — resolved by declared type!
}
```

Compare that to what a real overridden member function would do:

```kotlin-runnable
open class Animal {
    open fun describe() = "An animal"
}
class Dog : Animal() {
    override fun describe() = "A dog"
}

fun main() {
    val dog: Animal = Dog()
    println(dog.describe()) // prints "A dog" — member overrides ARE polymorphic
}
```

The lesson: extension functions are a great tool for adding utility
behavior to types, but they are not a substitute for inheritance or
interfaces when you actually need runtime polymorphism. If different
subtypes need genuinely different behavior selected at runtime, that
behavior belongs in an `open`/`override` member (see
[Inheritance](/oop/inheritance)) or an interface method, not an extension
function.

## Tasks

### Task 1: `String` extension

Write an extension function `fun String.isPalindrome(): Boolean` that
returns whether the string reads the same forwards and backwards (ignore
case). Test it on `"Racecar"` and `"Kotlin"`.

```kotlin-runnable
// Your code here

fun main() {

}
```

::: details Solution
```kotlin
fun String.isPalindrome(): Boolean {
    val normalized = this.lowercase()
    return normalized == normalized.reversed()
}

fun main() {
    println("Racecar".isPalindrome())
    println("Kotlin".isPalindrome())
}
```
:::

### Task 2: Extension on your own data class

Define `data class Rectangle(val width: Double, val height: Double)`, then
write an extension function `fun Rectangle.perimeter(): Double` (outside
the class) that computes `2 * (width + height)`. Also add an extension
property `val Rectangle.isSquare: Boolean` that checks whether `width ==
height`.

::: details Solution
```kotlin
data class Rectangle(val width: Double, val height: Double)

fun Rectangle.perimeter(): Double = 2 * (width + height)

val Rectangle.isSquare: Boolean
    get() = width == height

fun main() {
    val rect = Rectangle(4.0, 4.0)
    println(rect.perimeter())
    println(rect.isSquare)
}
```
:::

Next: [Generics](/oop/generics)
