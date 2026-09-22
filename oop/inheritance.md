# Inheritance

Here's the single biggest culture shock for a Java programmer learning
Kotlin: **classes are `final` by default.** In Java, any class can be
subclassed unless you explicitly write `final`. In Kotlin, it's the exact
opposite — a class can't be subclassed unless you explicitly write `open`.

```kotlin-runnable
open class Animal(val name: String) {
    fun describe() = "$name is an animal"
}

class Dog(name: String) : Animal(name)

fun main() {
    val dog = Dog("Rex")
    println(dog.describe())
}
```

Notice the syntax: `class Dog(name: String) : Animal(name)` — a colon
stands in for Java's `extends`, and the superclass's constructor is called
right there, like a function call.

If you tried to write `class Cat(name: String) : Animal(name)` where
`Animal` was declared as a plain `class` (no `open`), it simply wouldn't
compile: `This type is final, so it cannot be inherited from`. This default
is deliberate — Kotlin's designers consider "designed and documented for
inheritance, or else final" (a well-known piece of Java API design advice)
worth enforcing at the language level rather than leaving to convention.

## Overriding members

Same story for individual functions and properties: a member is only
overridable if it's marked `open`, and the subclass must mark its override
with the `override` keyword — not optional, unlike Java's purely-advisory
`@Override` annotation.

```kotlin-runnable
open class Animal(val name: String) {
    open fun speak(): String = "..."
}

class Dog(name: String) : Animal(name) {
    override fun speak(): String = "$name says Woof!"
}

class Cat(name: String) : Animal(name) {
    override fun speak(): String = "$name says Meow!"
}

fun main() {
    val animals: List<Animal> = listOf(Dog("Rex"), Cat("Whiskers"))
    for (animal in animals) {
        println(animal.speak())
    }
}
```

Because `override` is mandatory, the compiler catches two whole classes of
Java bugs for free:

- Forgetting to override something you meant to (missing `override` on a
  method with the wrong signature is just a new unrelated function in Java
  — in Kotlin, `override` with no matching open member is a compile error).
- Accidentally overriding something you didn't mean to.

Properties can be `open`/`override` too:

```kotlin-runnable
open class Shape {
    open val sides: Int = 0
    open val name: String
        get() = "Shape"
}

class Triangle : Shape() {
    override val sides = 3
    override val name: String
        get() = "Triangle"
}

fun main() {
    val shape: Shape = Triangle()
    println("${shape.name} has ${shape.sides} sides")
}
```

An `override` member is implicitly open to further overriding in classes
further down the hierarchy. If you want to stop that, mark it `final override`.

## Calling superclass members with `super`

Same keyword as Java:

```kotlin-runnable
open class Animal(val name: String) {
    open fun speak(): String = "$name makes a sound"
}

class Dog(name: String) : Animal(name) {
    override fun speak(): String = super.speak() + ", specifically a bark"
}

fun main() {
    println(Dog("Rex").speak())
}
```

## Single inheritance, multiple interfaces

A Kotlin class extends **at most one** superclass, just like Java — no
multiple inheritance of implementation. But a class can implement any
number of interfaces, using the same colon-and-comma syntax whether the
first item is a class or an interface:

```kotlin-runnable
interface Named {
    val name: String
}

interface Describable {
    fun describe(): String
}

open class Animal(override val name: String) : Named

class Dog(name: String) : Animal(name), Describable {
    override fun describe(): String = "$name is a dog"
}

fun main() {
    val dog = Dog("Rex")
    println(dog.describe())
}
```

We'll cover interfaces themselves properly in the next chapter,
[Interfaces](/oop/interfaces); for now just note that the superclass (if
any) always comes first in the list, followed by interfaces.

## Tasks

### Task 1: `Vehicle` hierarchy

Define an `open class Vehicle(val brand: String)` with an `open fun
describe(): String` returning `"$brand vehicle"`. Define `class Car(brand:
String) : Vehicle(brand)` that overrides `describe()` to return `"$brand
car"`. Print the description of a `Car`.

```kotlin-runnable
// Your code here

fun main() {

}
```

::: details Solution
```kotlin
open class Vehicle(val brand: String) {
    open fun describe(): String = "$brand vehicle"
}

class Car(brand: String) : Vehicle(brand) {
    override fun describe(): String = "$brand car"
}

fun main() {
    val car = Car("Toyota")
    println(car.describe())
}
```
:::

### Task 2: Using `super`

Extend the previous solution: make `Car.describe()` reuse the parent's
implementation instead of duplicating the string, so it returns something
like `"Toyota vehicle, specifically a car"`.

::: details Solution
```kotlin
open class Vehicle(val brand: String) {
    open fun describe(): String = "$brand vehicle"
}

class Car(brand: String) : Vehicle(brand) {
    override fun describe(): String = super.describe() + ", specifically a car"
}

fun main() {
    val car = Car("Toyota")
    println(car.describe())
}
```
:::

Next: [Visibility Modifiers](/oop/visibility-modifiers)
