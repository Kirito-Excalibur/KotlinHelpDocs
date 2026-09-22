# Higher-Order Functions

In [Lambdas: a first look](/basics/lambdas-intro) you saw lambdas used inline
with `filter` and `map`. Now let's look at what makes that possible: in
Kotlin, functions are values. You can store them in variables, pass them as
arguments, and return them from other functions — just like an `Int` or a
`String`. A function that takes another function as a parameter, or returns
one, is called a **higher-order function**.

## Function types

The type of a function is written as `(ParameterTypes) -> ReturnType`. A
function that takes two `Int`s and returns an `Int` has type
`(Int, Int) -> Int`. A function that takes no parameters and returns nothing
useful has type `() -> Unit`.

```kotlin-runnable
fun main() {
    val square: (Int) -> Int = { x -> x * x }
    val add: (Int, Int) -> Int = { a, b -> a + b }

    println(square(5))
    println(add(2, 3))
}
```

Here `square` and `add` are ordinary `val`s. Their type just happens to be a
function type instead of `Int` or `String`. Everything you already know about
`val` and `var` still applies.

## Passing functions as parameters

A higher-order function declares a parameter whose type is a function type.
The caller supplies any matching function — a lambda, a named function, or a
function reference (more on that below).

```kotlin-runnable
fun applyTwice(x: Int, op: (Int) -> Int): Int {
    return op(op(x))
}

fun main() {
    val result = applyTwice(3) { it * 2 }
    println(result) // (3 * 2) * 2 = 12
}
```

`applyTwice(3) { it * 2 }` uses the **trailing lambda** convention: when the
last parameter of a function is itself a function type, you can move the
lambda outside the parentheses. If it's the *only* argument, you can drop the
parentheses entirely, as you already saw with `filter { ... }`.

## Returning functions from functions

A function can also produce a function as its result. This is how you build
configurable behavior without a class hierarchy.

```kotlin-runnable
fun multiplier(factor: Int): (Int) -> Int {
    return { number -> number * factor }
}

fun main() {
    val triple = multiplier(3)
    val half = multiplier(0) // trivial, but still a function

    println(triple(10)) // 30
    println(triple(21)) // 63
}
```

`multiplier` returns a lambda that "remembers" `factor`. This is a
**closure** — the returned function captures `factor` from its enclosing
scope even after `multiplier` has finished running. Closures get their own
deep dive in [Lambda Syntax In Depth](/functional/lambda-syntax-in-depth).

## Function references

Writing `{ x -> someFunction(x) }` just to pass along an existing function is
noise. Kotlin lets you refer to a named function directly with `::`:

```kotlin-runnable
fun isEven(n: Int): Boolean = n % 2 == 0

fun main() {
    val numbers = listOf(1, 2, 3, 4, 5, 6)
    val evens = numbers.filter(::isEven)
    println(evens)
}
```

`::isEven` is a **function reference** — a value of type `(Int) -> Boolean`
pointing at the top-level function `isEven`. It behaves exactly like a
lambda that calls `isEven`, but it's shorter and reuses a function you
probably already have.

You can also reference member functions. An *unbound* reference on the class
needs the receiver as its first argument:

```kotlin-runnable
class Person(val name: String, val age: Int) {
    fun isAdult(): Boolean = age >= 18
}

fun main() {
    val people = listOf(Person("Ann", 17), Person("Bo", 25), Person("Cy", 40))

    // Unbound reference: Person::isAdult has type (Person) -> Boolean
    val adults = people.filter(Person::isAdult)
    println(adults.map { it.name })
}
```

A **bound** reference is attached to a specific instance, so it doesn't need
a receiver parameter at all:

```kotlin-runnable
class Person(val name: String, val age: Int) {
    fun getName(): String = name
}

fun main() {
    val bo = Person("Bo", 25)

    val nameSupplier: () -> String = bo::getName
    println(nameSupplier())
}
```

`bo::getName` already knows which `Person` to call the method on, so its
type is `() -> String`, not `(Person) -> String`.

Kotlin also supports references to constructors (`::ClassName`) and
properties (`::propertyName`), but function references to top-level and
member functions are what you'll reach for most often.

## Function references vs. lambdas in practice

Both work anywhere a function type is expected. Prefer a reference when
you're just forwarding to an existing, named function — it reads better and
avoids restating the parameter name:

```kotlin-runnable
data class Employee(val name: String, val salary: Int)

fun main() {
    val employees = listOf(
        Employee("Grace", 95_000),
        Employee("Alan", 88_000),
        Employee("Ada", 105_000)
    )

    // Reference: reads as "sort by salary"
    val bySalary = employees.sortedBy(Employee::salary)

    // Lambda: better when there's real logic, not just a single accessor
    val byNameLength = employees.sortedBy { it.name.length }

    println(bySalary.map { it.name })
    println(byNameLength.map { it.name })
}
```

`Employee::salary` is a reference to the auto-generated getter for the
property `salary`. As a rule of thumb: if your lambda body is just
`{ it.something }` or `{ someFunction(it) }`, a reference usually says the
same thing more directly.

## Tasks

### Task 1: Compose two functions

Write a function `compose(f: (Int) -> Int, g: (Int) -> Int): (Int) -> Int`
that returns a new function equivalent to `f(g(x))`. Test it by composing a
function that doubles a number with one that adds 1.

```kotlin-runnable
fun compose(f: (Int) -> Int, g: (Int) -> Int): (Int) -> Int {
    // Your code here
}

fun main() {
    val double: (Int) -> Int = { it * 2 }
    val addOne: (Int) -> Int = { it + 1 }

    val doubleThenAddOne = compose(addOne, double)
    println(doubleThenAddOne(5)) // double(5) = 10, addOne(10) = 11
}
```

::: details Solution
```kotlin
fun compose(f: (Int) -> Int, g: (Int) -> Int): (Int) -> Int {
    return { x -> f(g(x)) }
}

fun main() {
    val double: (Int) -> Int = { it * 2 }
    val addOne: (Int) -> Int = { it + 1 }

    val doubleThenAddOne = compose(addOne, double)
    println(doubleThenAddOne(5))
}
```
The returned lambda captures both `f` and `g` as a closure. Each call to
`compose` produces a fresh function with its own captured `f`/`g`.
:::

### Task 2: Filter and sort with references

Given a list of `Product(name: String, price: Double, inStock: Boolean)`,
use function references (not lambdas) to: filter to only products that are
in stock, then sort the result by price.

```kotlin-runnable
data class Product(val name: String, val price: Double, val inStock: Boolean)

fun main() {
    val products = listOf(
        Product("Keyboard", 49.99, true),
        Product("Monitor", 199.99, false),
        Product("Mouse", 19.99, true),
        Product("Webcam", 39.99, true)
    )

    // Your code here: filter in-stock, then sort by price, using references
}
```

::: details Solution
```kotlin
data class Product(val name: String, val price: Double, val inStock: Boolean)

fun main() {
    val products = listOf(
        Product("Keyboard", 49.99, true),
        Product("Monitor", 199.99, false),
        Product("Mouse", 19.99, true),
        Product("Webcam", 39.99, true)
    )

    val available = products.filter(Product::inStock).sortedBy(Product::price)
    println(available.map { it.name })
}
```
`Product::inStock` works as a filter predicate because `filter` accepts
`(T) -> Boolean`, and `inStock` is already a `Boolean` property.
:::

Next: [Lambda Syntax In Depth](/functional/lambda-syntax-in-depth)
