# Abstract Classes

An `abstract class` sits between a regular class and an interface: like a
regular class it can hold state (backing fields, constructor logic, `init`
blocks), but like an interface it can declare members with no
implementation at all, deferring them to subclasses.

```kotlin-runnable
abstract class Shape {
    abstract val area: Double

    fun describe(): String = "A shape with area $area"
}

class Square(val side: Double) : Shape() {
    override val area: Double
        get() = side * side
}

fun main() {
    val square = Square(4.0)
    println(square.describe())
}
```

Note the `()` after `Shape` in `class Square(val side: Double) : Shape()` —
even though `Shape` is abstract and can never be instantiated directly,
subclassing it still uses the same constructor-call syntax as any other
class inheritance, because `Shape` still *has* a (possibly trivial)
constructor that runs.

## Abstract members are implicitly `open`

You never write `open abstract` — `abstract` already implies overridable,
and in fact **requires** an override eventually, since an abstract member
has no body to fall back on:

```kotlin-runnable
abstract class Animal(val name: String) {
    abstract fun speak(): String

    // a concrete, non-abstract member — subclasses can use or override it
    open fun introduce(): String = "$name says ${speak()}"
}

class Dog(name: String) : Animal(name) {
    override fun speak(): String = "Woof"
}

fun main() {
    println(Dog("Rex").introduce())
}
```

You can't instantiate an abstract class directly, even if every member
happens to have a body:

```kotlin-runnable
abstract class Base {
    fun greet() = "Hello from Base"
}

fun main() {
    // val b = Base() // would not compile — Base is abstract
    val b = object : Base() {} // anonymous subclass — covered in the next few chapters
    println(b.greet())
}
```

## Abstract class vs. interface: which one?

Both let you define a contract with default behavior. The deciding
questions are usually:

- **Does it need to hold state** (a constructor, a backing field, mutable
  properties initialized once)? Interfaces can't store anything — only
  abstract or computed properties. If you need real stored state shared
  across subclasses, use an abstract class.
- **Does the type need to extend something else too?** A class can
  implement many interfaces but extend only one class (abstract or not). If
  a type might need to inherit from multiple contracts, prefer interfaces —
  the single-inheritance slot is precious.
- **Is it a "kind of X" relationship, or a "can do X" capability?** Abstract
  classes model *is-a* hierarchies with shared implementation (`Shape` →
  `Circle`, `Square`); interfaces model *capabilities* that unrelated types
  can share (`Comparable`, `Flyable`).

In practice, favor interfaces by default — they're more flexible — and reach
for an abstract class specifically when you need constructor logic or
shared mutable state across all subclasses.

## Mixing abstract and concrete members

A realistic abstract class usually has both kinds of members: some fully
implemented and shared, some deferred:

```kotlin-runnable
abstract class PaymentMethod(val accountId: String) {
    // concrete, shared logic
    fun logTransaction(amount: Double) {
        println("[$accountId] Charging $amount via ${methodName()}")
    }

    // deferred to each subclass
    abstract fun methodName(): String
    abstract fun charge(amount: Double): Boolean
}

class CreditCard(accountId: String, val cardNumber: String) : PaymentMethod(accountId) {
    override fun methodName() = "Credit Card"
    override fun charge(amount: Double): Boolean {
        logTransaction(amount)
        return true // pretend it succeeded
    }
}

fun main() {
    val payment = CreditCard("acct-1", "4111111111111111")
    payment.charge(49.99)
}
```

`PaymentMethod` centralizes the logging logic once, while leaving the
actual charging mechanism — which genuinely differs per payment type — to
each subclass.

## Tasks

### Task 1: `Employee` abstract class

Define `abstract class Employee(val name: String)` with an abstract
`fun monthlySalary(): Double` and a concrete `fun payslip(): String`
returning `"$name earns ${monthlySalary()} per month"`. Create a
`class Developer(name: String, val baseSalary: Double) : Employee(name)`
that implements `monthlySalary()` to just return `baseSalary`.

```kotlin-runnable
// Your code here

fun main() {

}
```

::: details Solution
```kotlin
abstract class Employee(val name: String) {
    abstract fun monthlySalary(): Double

    fun payslip(): String = "$name earns ${monthlySalary()} per month"
}

class Developer(name: String, val baseSalary: Double) : Employee(name) {
    override fun monthlySalary(): Double = baseSalary
}

fun main() {
    val dev = Developer("Ada", 8000.0)
    println(dev.payslip())
}
```
:::

### Task 2: Abstract class with shared state

Define `abstract class Vehicle(val brand: String)` with a mutable
`protected var mileage: Double = 0.0`, a concrete `fun drive(km: Double)`
that adds to `mileage`, and an abstract `fun fuelType(): String`. Implement
`class ElectricCar(brand: String) : Vehicle(brand)` where `fuelType()`
returns `"Electric"`. Drive it, then print `mileage` via a concrete
`fun status(): String` on `Vehicle` returning `"$brand has driven $mileage km, runs on ${fuelType()}"`.

::: details Solution
```kotlin
abstract class Vehicle(val brand: String) {
    protected var mileage: Double = 0.0

    fun drive(km: Double) {
        mileage += km
    }

    abstract fun fuelType(): String

    fun status(): String = "$brand has driven $mileage km, runs on ${fuelType()}"
}

class ElectricCar(brand: String) : Vehicle(brand) {
    override fun fuelType(): String = "Electric"
}

fun main() {
    val car = ElectricCar("Tesla")
    car.drive(120.0)
    println(car.status())
}
```
:::

Next: [Data Classes](/oop/data-classes)
