# Interfaces

Kotlin interfaces look like Java interfaces, but without the historical
baggage: from day one, Kotlin interfaces could declare abstract members,
default method bodies, and even properties — no separate `default` keyword
required, no version where they could only hold constants.

```kotlin-runnable
interface Greeter {
    fun greet(): String
}

class EnglishGreeter : Greeter {
    override fun greet() = "Hello!"
}

fun main() {
    val greeter: Greeter = EnglishGreeter()
    println(greeter.greet())
}
```

Note there's no `open` needed anywhere here — interface members are
abstract (or have a default body) and implementations always use
`override`, same rule as class inheritance.

## Default method bodies

An interface method can provide a body directly. Implementers can use it as-is
or override it:

```kotlin-runnable
interface Greeter {
    fun greet(): String = "Hello, stranger"
}

class FriendlyGreeter : Greeter // uses the default

class FormalGreeter : Greeter {
    override fun greet() = "Good day to you"
}

fun main() {
    println(FriendlyGreeter().greet())
    println(FormalGreeter().greet())
}
```

## Properties in interfaces

Interfaces can declare properties — but only abstract ones or ones with a
computed getter. They **cannot hold state**: no backing field is allowed in
an interface, so an interface property can't be initialized with `= value`
directly.

```kotlin-runnable
interface Shape {
    val area: Double          // abstract — implementers must provide it
    val description: String  // has a body, but it's computed, not stored
        get() = "A shape with area $area"
}

class Circle(val radius: Double) : Shape {
    override val area: Double
        get() = Math.PI * radius * radius
}

fun main() {
    val circle = Circle(2.0)
    println(circle.area)
    println(circle.description)
}
```

If you need actual storage, the implementing *class* provides it (as
`Circle` does above by overriding `area` with a real getter, or as a class
could with a `val`/`var` that backs the interface property).

## Implementing multiple interfaces

A class can implement as many interfaces as it wants — this is where Kotlin
recovers some of the "multiple inheritance" power Java interfaces (post-Java
8) also have:

```kotlin-runnable
interface Flyable {
    fun fly() = "Flying"
}

interface Swimmable {
    fun swim() = "Swimming"
}

class Duck : Flyable, Swimmable

fun main() {
    val duck = Duck()
    println(duck.fly())
    println(duck.swim())
}
```

## Resolving diamond conflicts

If two interfaces provide *default* bodies for a member with the same
signature, and a class implements both without overriding it, that's an
ambiguity the compiler refuses to guess about — you must override the
member yourself and explicitly say which parent implementation you mean,
using `super<InterfaceName>.member()`:

```kotlin-runnable
interface Flyable {
    fun move(): String = "Flying"
}

interface Swimmable {
    fun move(): String = "Swimming"
}

class Duck : Flyable, Swimmable {
    override fun move(): String {
        return "${super<Flyable>.move()} and ${super<Swimmable>.move()}"
    }
}

fun main() {
    println(Duck().move())
}
```

Leaving out the `override fun move()` entirely here is a compile error:
`Class 'Duck' must override public open fun move() because it inherits
multiple implementations of it.` This is a real advantage over Java's
default-method conflict rules, which require the same kind of explicit
resolution but are easy to get subtly wrong — Kotlin forces you to be
explicit at the call site with `super<Type>.method()` rather than relying on
`Type.super.method()` syntax tucked away in an override.

## Tasks

### Task 1: `Playable` interface

Define `interface Playable` with an abstract `fun play(): String` and a
default `fun stop(): String = "Stopped"`. Implement it in `class Song(val
title: String) : Playable` where `play()` returns `"Playing $title"`. Call
both methods on an instance.

```kotlin-runnable
// Your code here

fun main() {

}
```

::: details Solution
```kotlin
interface Playable {
    fun play(): String
    fun stop(): String = "Stopped"
}

class Song(val title: String) : Playable {
    override fun play(): String = "Playing $title"
}

fun main() {
    val song = Song("Bohemian Rhapsody")
    println(song.play())
    println(song.stop())
}
```
:::

### Task 2: Diamond conflict

Define two interfaces, `Loggable` and `Auditable`, each with a default
method `fun record(): String` returning a different string (e.g. `"Logged"`
and `"Audited"`). Create `class Transaction : Loggable, Auditable` that
overrides `record()` to combine both parent implementations using
`super<...>.record()`, separated by `" + "`.

::: details Solution
```kotlin
interface Loggable {
    fun record(): String = "Logged"
}

interface Auditable {
    fun record(): String = "Audited"
}

class Transaction : Loggable, Auditable {
    override fun record(): String {
        return "${super<Loggable>.record()} + ${super<Auditable>.record()}"
    }
}

fun main() {
    println(Transaction().record())
}
```
:::

Next: [Abstract Classes](/oop/abstract-classes)
