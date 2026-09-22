# Sealed Classes

A `sealed class` (or `sealed interface`) restricts who's allowed to
subclass it: every direct subclass must be known to the compiler at compile
time, typically because it's declared in the same file (or, since more
recent Kotlin versions, the same compilation module). You can't have some
random other module adding a surprise subclass later.

```kotlin-runnable
sealed class Shape

class Circle(val radius: Double) : Shape()
class Rectangle(val width: Double, val height: Double) : Shape()

fun area(shape: Shape): Double = when (shape) {
    is Circle -> Math.PI * shape.radius * shape.radius
    is Rectangle -> shape.width * shape.height
}

fun main() {
    println(area(Circle(2.0)))
    println(area(Rectangle(3.0, 4.0)))
}
```

## Why bother — exhaustive `when`

The payoff is in that `when` expression: because the compiler knows the
*complete* set of possible subclasses, it can check that every one of them
is handled — no `else` branch needed. If you later add a `Triangle : Shape()`
and forget to update this `when`, the compiler stops you immediately at
`area()`'s call site, rather than at runtime with a missed case.

Compare this to a regular open class, or an enum-free hierarchy in Java:
the compiler has no way to know all the subtypes exist, so it either forces
you to write a (potentially dead) `else` branch, or lets you silently miss
a case.

```kotlin-runnable
sealed class Shape

class Circle(val radius: Double) : Shape()
class Rectangle(val width: Double, val height: Double) : Shape()
class Triangle(val base: Double, val height: Double) : Shape()

fun area(shape: Shape): Double = when (shape) {
    is Circle -> Math.PI * shape.radius * shape.radius
    is Rectangle -> shape.width * shape.height
    is Triangle -> 0.5 * shape.base * shape.height
    // remove any one branch above and this file fails to compile
}

fun main() {
    println(area(Triangle(6.0, 4.0)))
}
```

## `sealed interface`

Sealed also works on interfaces, which is handy when your variants need to
extend different classes but still share one restricted contract:

```kotlin-runnable
sealed interface Event

class Click(val x: Int, val y: Int) : Event
class KeyPress(val key: Char) : Event
object Scroll : Event

fun handle(event: Event): String = when (event) {
    is Click -> "Clicked at (${event.x}, ${event.y})"
    is KeyPress -> "Pressed '${event.key}'"
    Scroll -> "Scrolled"
}

fun main() {
    println(handle(Click(10, 20)))
    println(handle(KeyPress('A')))
    println(handle(Scroll))
}
```

(`object Scroll : Event` declares a singleton variant with no data of its
own — covered properly in
[Object Expressions & Declarations](/oop/object-expressions-and-declarations).)

## A realistic example: modeling a result type

Sealed classes are the idiomatic Kotlin way to model "one of several
distinct outcomes," replacing patterns Java code often reaches for with
nullable return values, exceptions, or a loosely-typed status field:

```kotlin-runnable
sealed class ApiResponse<out T>

data class Success<T>(val data: T) : ApiResponse<T>()
data class Error(val message: String, val code: Int) : ApiResponse<Nothing>()
object Loading : ApiResponse<Nothing>()

fun render(response: ApiResponse<String>): String = when (response) {
    is Success -> "Loaded: ${response.data}"
    is Error -> "Failed (${response.code}): ${response.message}"
    Loading -> "Loading..."
}

fun main() {
    val results = listOf(
        Loading,
        Success("user profile"),
        Error("Not found", 404)
    )
    for (result in results) {
        println(render(result))
    }
}
```

This reads like an enum with payloads — each branch carries exactly the
data relevant to that outcome, `Error` doesn't need a dummy `data` field,
`Success` doesn't need a dummy `message`, and the `when` in `render` is
checked exhaustively by the compiler. (Don't worry about the `<out T>`
syntax yet — that's generic variance, covered in [Generics](/oop/generics).)

## Tasks

### Task 1: Traffic light

Define `sealed class TrafficLight` with three subclasses (or objects, if
they carry no data): `Red`, `Yellow`, `Green`. Write a function
`nextLight(current: TrafficLight): TrafficLight` that returns the next
light in the cycle Red -> Green -> Yellow -> Red, using an exhaustive `when`
with no `else`.

```kotlin-runnable
// Your code here

fun main() {

}
```

::: details Solution
```kotlin
sealed class TrafficLight

object Red : TrafficLight()
object Yellow : TrafficLight()
object Green : TrafficLight()

fun nextLight(current: TrafficLight): TrafficLight = when (current) {
    Red -> Green
    Green -> Yellow
    Yellow -> Red
}

fun main() {
    var light: TrafficLight = Red
    repeat(4) {
        println(light)
        light = nextLight(light)
    }
}
```
:::

### Task 2: Payment result

Define `sealed class PaymentResult` with `data class Approved(val
confirmationCode: String)`, `data class Declined(val reason: String)`, and
`object Pending`. Write `fun describe(result: PaymentResult): String` with
an exhaustive `when` producing an appropriate message for each case.

::: details Solution
```kotlin
sealed class PaymentResult

data class Approved(val confirmationCode: String) : PaymentResult()
data class Declined(val reason: String) : PaymentResult()
object Pending : PaymentResult()

fun describe(result: PaymentResult): String = when (result) {
    is Approved -> "Payment approved: ${result.confirmationCode}"
    is Declined -> "Payment declined: ${result.reason}"
    Pending -> "Payment is still pending"
}

fun main() {
    println(describe(Approved("CONF123")))
    println(describe(Declined("Insufficient funds")))
    println(describe(Pending))
}
```
:::

Next: [Enum Classes](/oop/enum-classes)
