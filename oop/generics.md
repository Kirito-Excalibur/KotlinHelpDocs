# Generics

Kotlin generics look close to Java's at first glance, but the variance
model is meaningfully cleaner. Let's build up from the basics.

## Generic classes

```kotlin-runnable
class Box<T>(val value: T)

fun main() {
    val intBox = Box(42)
    val stringBox = Box("hello")
    println(intBox.value)
    println(stringBox.value)
}
```

Kotlin usually infers `T` from the constructor argument, so you rarely need
to write `Box<Int>(42)` explicitly — though you can.

## Generic functions

A function can introduce its own type parameter, written before the
function name:

```kotlin-runnable
fun <T> firstOf(list: List<T>): T = list[0]

fun main() {
    println(firstOf(listOf(1, 2, 3)))
    println(firstOf(listOf("a", "b", "c")))
}
```

## Type parameter constraints

Just like Java's `<T extends Comparable<T>>`, you can bound a type
parameter with `:`:

```kotlin-runnable
fun <T : Comparable<T>> max(a: T, b: T): T {
    return if (a > b) a else b
}

fun main() {
    println(max(3, 7))
    println(max("banana", "apple"))
}
```

This restricts `T` to types that implement `Comparable<T>`, which is what
makes `a > b` valid inside the function body — the compiler wouldn't allow
comparing two arbitrary, unconstrained `T` values with `>`.

## Variance: `out` and `in`

Here's where Kotlin diverges from Java in a genuinely nice way. In Java,
`List<Dog>` is not a `List<Animal>` — generics are *invariant* by default —
and you work around it at each call site with wildcards:
`List<? extends Animal>`. Kotlin instead lets you declare variance **once,
on the class itself**, called declaration-site variance.

### `out`: covariance (read-only producers)

If a generic type only ever *produces* or returns values of `T` — never
accepts a `T` as a parameter — mark it `out`. This makes `Box<Dog>` usable
wherever a `Box<Animal>` is expected:

```kotlin-runnable
open class Animal(val name: String)
class Dog(name: String) : Animal(name)

class Box<out T>(val value: T)

fun printAnimalBox(box: Box<Animal>) {
    println(box.value.name)
}

fun main() {
    val dogBox: Box<Dog> = Box(Dog("Rex"))
    printAnimalBox(dogBox) // fine: Box<Dog> is a Box<out Animal>
}
```

Without `out`, that call wouldn't compile — `Box<Dog>` and `Box<Animal>`
would be unrelated types, just like in Java. `List<T>` in Kotlin's standard
library is itself declared `out`, which is exactly why `List<Dog>` can be
passed where `List<Animal>` is expected, but `MutableList<T>` is *not*
`out` — because it also has methods that *accept* a `T` (like `add`), and
allowing that would let you insert a `Cat` into what's actually a
`MutableList<Dog>` behind the scenes.

### `in`: contravariance (write-only consumers)

The opposite case: if a generic type only ever *consumes* `T` — takes it as
a parameter, never returns it — mark it `in`. This makes `Comparator<Animal>`
usable wherever a `Comparator<Dog>` is expected:

```kotlin-runnable
open class Animal(val name: String)
class Dog(name: String) : Animal(name)

class Container<in T> {
    fun accept(item: T) {
        println("Accepted an item")
    }
}

fun feedDog(container: Container<Dog>) {
    container.accept(Dog("Rex"))
}

fun main() {
    val animalContainer: Container<Animal> = Container()
    feedDog(animalContainer) // fine: Container<Animal> is a Container<in Dog>
}
```

A `Container<Animal>` can safely stand in for a `Container<Dog>`, because
anything that knows how to accept *any* `Animal` can certainly accept a
`Dog` specifically. This is exactly the relationship `Comparator<T>` has in
the standard library: `Comparator<Animal>` can compare `Dog`s just fine, so
it's declared `in`.

The mnemonic: `out` means `T` only comes **out** of the API (return
positions); `in` means `T` only goes **in** (parameter positions). Kotlin's
compiler actually enforces this — try using an `out` type parameter in an
`in` position and you'll get a compile error pointing at exactly that.

## Star projection

When you don't care about the specific type argument — just that *some*
type is there — use `*`, the star projection:

```kotlin-runnable
fun printSize(list: List<*>) {
    println("Size: ${list.size}")
}

fun main() {
    printSize(listOf(1, 2, 3))
    printSize(listOf("a", "b"))
}
```

`List<*>` roughly means "a `List` of something, I'm not going to touch the
elements as anything more specific than `Any?`." It's the Kotlin analog of
Java's unbounded wildcard `List<?>`, useful when writing generic utility
code that only needs to inspect structure (size, iteration) rather than
work with typed elements.

## Tasks

### Task 1: Generic `Pair`-like class

Define `class Wrapper<T>(val value: T)` with a member function
`fun <R> map(transform: (T) -> R): Wrapper<R>` that applies `transform` to
`value` and returns a new `Wrapper`. Use it to turn a `Wrapper<Int>` into a
`Wrapper<String>`.

```kotlin-runnable
// Your code here

fun main() {

}
```

::: details Solution
```kotlin
class Wrapper<T>(val value: T) {
    fun <R> map(transform: (T) -> R): Wrapper<R> {
        return Wrapper(transform(value))
    }
}

fun main() {
    val intWrapper = Wrapper(42)
    val stringWrapper = intWrapper.map { "Value is $it" }
    println(stringWrapper.value)
}
```
:::

### Task 2: Covariant `ReadOnlyStack`

Define a covariant class `class ReadOnlyStack<out T>(private val items: List<T>)`
with a function `fun peek(): T` returning the last item. Write a function
`fun printTop(stack: ReadOnlyStack<Any>)` that prints `stack.peek()`, and
call it with a `ReadOnlyStack<String>`, demonstrating that the covariance
allows it.

::: details Solution
```kotlin
class ReadOnlyStack<out T>(private val items: List<T>) {
    fun peek(): T = items.last()
}

fun printTop(stack: ReadOnlyStack<Any>) {
    println(stack.peek())
}

fun main() {
    val stringStack: ReadOnlyStack<String> = ReadOnlyStack(listOf("a", "b", "c"))
    printTop(stringStack) // works because ReadOnlyStack is declared `out T`
}
```
:::

Next: [Nested & Inner Classes](/oop/nested-and-inner-classes)
