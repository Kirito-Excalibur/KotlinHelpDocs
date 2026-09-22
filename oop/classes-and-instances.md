# Classes and Instances

A Kotlin class looks like a slimmed-down version of a Java class. Here's the
smallest useful one:

```kotlin-runnable
class Person {
    var name: String = ""
    var age: Int = 0
}

fun main() {
    val person = Person()
    person.name = "Ada"
    person.age = 30
    println("${person.name} is ${person.age}")
}
```

Two things already stand out if you're coming from Java:

- **No `new` keyword.** `Person()` calls the constructor directly.
- `name` and `age` are declared with `var`, and you assign to them like plain
  fields — but they're actually **properties**, not fields. More on the
  difference in [Properties and Fields](/oop/properties-and-fields).

## The primary constructor

Writing empty properties and filling them in after construction is clunky.
Kotlin lets you declare constructor parameters directly in the class header,
and — this is the important part — prefixing a parameter with `val` or `var`
turns it into a property automatically:

```kotlin-runnable
class Person(val name: String, var age: Int)

fun main() {
    val person = Person("Ada", 30)
    println("${person.name} is ${person.age}")
    person.age++
    println("Next year: ${person.age}")
}
```

That's the whole class: one line. Compare it to the Java equivalent you'd
otherwise write — a field for each parameter, a constructor that assigns
each one, a getter for `name`, and a getter *and* setter for `age`. Kotlin
generates all of that for you from `class Person(val name: String, var age: Int)`.

- `val name` gives you a read-only property (`getName()`-equivalent access,
  no way to reassign it).
- `var age` gives you a mutable property (both a getter and a setter).
- Parameters without `val`/`var` are just constructor parameters — they
  aren't stored as properties at all, only usable inside the class body.

```kotlin-runnable
class Greeting(val message: String, punctuation: String) {
    // `punctuation` isn't a property — it only exists inside init/methods
    val full = message + punctuation
}

fun main() {
    val g = Greeting("Hello", "!")
    println(g.full)
    // println(g.punctuation) // would not compile — no such property
}
```

## Member functions

Functions declared inside a class are called on instances the same way you'd
expect, and can freely reference the class's own properties without any
prefix:

```kotlin-runnable
class Rectangle(val width: Double, val height: Double) {
    fun area(): Double = width * height

    fun describe(): String {
        return "A ${width}x${height} rectangle with area ${area()}"
    }
}

fun main() {
    val rect = Rectangle(3.0, 4.0)
    println(rect.area())
    println(rect.describe())
}
```

## `this`

`this` refers to the current instance, exactly like in Java. You mostly only
need it to disambiguate a property from a same-named parameter or local
variable:

```kotlin-runnable
class Counter(private var count: Int) {
    fun resetTo(count: Int) {
        // parameter `count` shadows the property; `this.count` picks the property
        this.count = count
    }

    fun value(): Int = this.count
}

fun main() {
    val c = Counter(10)
    c.resetTo(0)
    println(c.value())
}
```

## Classes are types, instances are values

Just like Java, a `class` declaration introduces a new type, and `Person(...)`
produces a value of that type. Every instance has its own independent copy
of the properties declared in the class:

```kotlin-runnable
class Point(var x: Int, var y: Int)

fun main() {
    val a = Point(0, 0)
    val b = Point(0, 0)
    a.x = 5
    println("a.x = ${a.x}, b.x = ${b.x}")
}
```

Notice `a` is declared `val`, yet `a.x = 5` is legal. `val` only prevents
reassigning the variable `a` to point at a *different* `Point`; it says
nothing about whether the object it refers to can be mutated internally.

## Tasks

### Task 1: A `Book` class

Define a class `Book` with a primary constructor taking `title: String`,
`author: String`, and `pages: Int` (all as read-only properties). Add a
member function `summary()` that returns a string like
`"Dune by Frank Herbert (412 pages)"`. Create one instance and print its
summary.

```kotlin-runnable
// Your code here

fun main() {

}
```

::: details Solution
```kotlin
class Book(val title: String, val author: String, val pages: Int) {
    fun summary(): String = "$title by $author ($pages pages)"
}

fun main() {
    val book = Book("Dune", "Frank Herbert", 412)
    println(book.summary())
}
```
:::

### Task 2: Mutable bank account

Define a class `BankAccount` with a primary constructor taking
`owner: String` (read-only) and `balance: Double` (mutable, default doesn't
matter — just make it a `var`). Add member functions `deposit(amount: Double)`
and `withdraw(amount: Double)` that adjust `balance`, and a function
`describe()` returning something like `"Ada's account: 150.0"`.

::: details Solution
```kotlin
class BankAccount(val owner: String, var balance: Double) {
    fun deposit(amount: Double) {
        balance += amount
    }

    fun withdraw(amount: Double) {
        balance -= amount
    }

    fun describe(): String = "$owner's account: $balance"
}

fun main() {
    val account = BankAccount("Ada", 100.0)
    account.deposit(75.0)
    account.withdraw(25.0)
    println(account.describe())
}
```
:::

Next: [Properties and Fields](/oop/properties-and-fields)
