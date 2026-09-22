# Lists

A `List` is an ordered collection with indexed access, and it's the
collection type you'll reach for most often — it's Kotlin's equivalent of a
Python list, a JS array, or a Java `List`.

## Creating lists

```kotlin-runnable
fun main() {
    val readOnly = listOf("Mercury", "Venus", "Earth")
    val mutable = mutableListOf("Mercury", "Venus", "Earth")

    val empty = emptyList<String>() // type argument needed — nothing to infer it from
    val emptyMutable = mutableListOf<Int>()

    println(readOnly)
    println(mutable)
    println(empty)
    println(emptyMutable)
}
```

You can also build a list by computing each element from its index, using
the `List` constructor function:

```kotlin-runnable
fun main() {
    val squares = List(5) { index -> index * index }
    println(squares) // [0, 1, 4, 9, 16]

    val mutableSquares = MutableList(5) { it * it }
    mutableSquares.add(25)
    println(mutableSquares)
}
```

Note this isn't calling a constructor on the `List` interface (interfaces
can't have constructors) — `List(size, init)` and `MutableList(size, init)`
are factory functions that happen to be named like constructors.

## Indexing and basic access

```kotlin-runnable
fun main() {
    val planets = listOf("Mercury", "Venus", "Earth", "Mars")

    println(planets[0])            // Mercury
    println(planets.first())       // Mercury
    println(planets.last())        // Mars
    println(planets.getOrNull(10)) // null — safe, doesn't throw
    // println(planets[10])        // would throw IndexOutOfBoundsException

    println(planets.indexOf("Earth")) // 2
    println("Mars" in planets)        // true
    println(planets.contains("Jupiter")) // false
}
```

`list[i]` and `list.get(i)` are exactly the same call — `[]` is operator
syntax for `get`, covered in [Operator Overloading](/functional/operator-overloading).
Prefer `getOrNull` or check bounds when the index might be out of range;
`get`/`[]` throws if it isn't.

## Modifying a MutableList

```kotlin-runnable
fun main() {
    val cart = mutableListOf("apple", "bread")

    cart.add("milk")
    cart.add(1, "eggs")       // insert at index 1
    cart.remove("bread")      // remove by value
    cart.removeAt(0)          // remove by index
    cart[0] = "oat milk"      // replace by index

    println(cart)

    cart += "cheese"          // operator form of add
    cart -= "cheese"          // operator form of remove
    println(cart)
}
```

`add` returns `true` (it always succeeds for a `List`-backed structure), and
`remove` returns `true` or `false` depending on whether the element was
found. Both `+=` and `-=` on a `MutableList` mutate it in place, unlike `+`
and `-`, which return a *new* list and leave the original untouched:

```kotlin-runnable
fun main() {
    val original = listOf(1, 2, 3)
    val extended = original + 4        // new list
    val withoutTwo = original - 2      // new list

    println(original)   // unchanged: [1, 2, 3]
    println(extended)   // [1, 2, 3, 4]
    println(withoutTwo) // [1, 3]
}
```

## ArrayList vs. List/MutableList

`mutableListOf(...)` actually returns a `java.util.ArrayList` under the
hood — a resizable array. You'll rarely write `ArrayList` explicitly in
Kotlin code; the convention is to declare things as `List` or `MutableList`
and let the standard library pick the concrete implementation. This matters
because it means your code doesn't depend on *which* implementation you get,
just on the interface's guarantees — the same reasoning covered in
[Overview](/collections/overview) for why you should prefer the narrowest
interface that does the job.

You can still write `ArrayList<Int>()` directly if you want, and it's a
completely ordinary class — but there's rarely a reason to, since
`mutableListOf()` is shorter and returns the same thing.

## Converting between List and Array

`Array<T>` is a separate type from `List<T>` — it's the raw, fixed-size JVM
array type, mainly relevant for interop with Java APIs or `main`'s
`args: Array<String>`. Converting between the two is one call either way:

```kotlin-runnable
fun main() {
    val list = listOf(1, 2, 3)
    val array = list.toTypedArray()
    val backToList = array.toList()

    println(array.joinToString())
    println(backToList)

    val fromVarargArray = arrayOf("a", "b", "c").toList()
    println(fromVarargArray)
}
```

In everyday Kotlin code you almost always want `List`, not `Array` — arrays
exist mainly for primitive-heavy performance code and Java interop.

## Tasks

### Task 1: Shopping list edits

Starting from `mutableListOf("bread", "milk", "eggs")`, write code that:
1. adds `"butter"` to the end,
2. removes `"milk"`,
3. replaces the first element with `"sourdough bread"`,
4. prints the final list.

```kotlin-runnable
fun main() {
    val cart = mutableListOf("bread", "milk", "eggs")
    // Your code here
}
```

::: details Solution
```kotlin
fun main() {
    val cart = mutableListOf("bread", "milk", "eggs")
    cart.add("butter")
    cart.remove("milk")
    cart[0] = "sourdough bread"
    println(cart) // [sourdough bread, eggs, butter]
}
```
:::

### Task 2: Safe access

Write a function `secondOrNull(list: List<Int>): Int?` that returns the
second element of the list, or `null` if the list has fewer than two
elements. Don't use a manual bounds check with `if` — use a standard library
function that already does this.

::: details Solution
```kotlin
fun secondOrNull(list: List<Int>): Int? = list.getOrNull(1)

fun main() {
    println(secondOrNull(listOf(10, 20, 30))) // 20
    println(secondOrNull(listOf(10)))         // null
    println(secondOrNull(emptyList()))        // null
}
```
`getOrNull` returns `null` instead of throwing when the index is out of
bounds, which is exactly the "second element, or null" behavior asked for.
:::

### Task 3: Build with the List constructor

Use the `List(size) { ... }` constructor function to build a list of the
first 6 powers of two: `[1, 2, 4, 8, 16, 32]`.

::: details Solution
```kotlin
fun main() {
    val powersOfTwo = List(6) { index -> 1 shl index }
    println(powersOfTwo) // [1, 2, 4, 8, 16, 32]
}
```
`1 shl index` is a bit shift (`1 * 2^index`); you could just as validly write
`Math.pow(2.0, index.toDouble()).toInt()`, but the shift is the idiomatic
way to compute powers of two over small integer ranges.
:::

Next: [Sets](/collections/sets)
