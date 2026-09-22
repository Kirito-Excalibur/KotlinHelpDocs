# Filtering & Mapping

This page covers the standard library functions you'll use constantly to
reshape collections: keeping some elements (`filter`), transforming each
element (`map`), and a handful of variants for common special cases. All of
these work the same on `List`, `Set`, and `Sequence` (from
[Sequences](/collections/sequences)) — they're defined once on `Iterable`
and `Sequence`.

We'll use a small domain model throughout: a `User` with a `name`, `age`,
and an optional `email`.

## filter, filterNot, filterNotNull, filterIsInstance

```kotlin-runnable
data class User(val name: String, val age: Int, val email: String?)

fun main() {
    val users = listOf(
        User("Ana", 30, "ana@example.com"),
        User("Bo", 17, null),
        User("Cy", 25, "cy@example.com"),
    )

    val adults = users.filter { it.age >= 18 }
    println(adults.map { it.name }) // [Ana, Cy]

    val minors = users.filterNot { it.age >= 18 }
    println(minors.map { it.name }) // [Bo]

    val emails = users.map { it.email } // List<String?>
    val realEmails = emails.filterNotNull() // List<String>
    println(realEmails)
}
```

`filterNotNull()` is the standard way to go from a collection that might
contain nulls (like `List<String?>`) to one that provably doesn't
(`List<String>`) — it drops the nulls and changes the compile-time type to
match. `filterIsInstance<T>()` does the analogous thing for a mixed-type
collection, keeping only elements of a given type:

```kotlin-runnable
fun main() {
    val mixed: List<Any> = listOf(1, "two", 3, "four", 5.0)

    val onlyInts = mixed.filterIsInstance<Int>()
    val onlyStrings = mixed.filterIsInstance<String>()

    println(onlyInts)     // [1, 3]
    println(onlyStrings)  // [two, four]
}
```

## map, mapNotNull, mapIndexed

```kotlin-runnable
data class User(val name: String, val age: Int, val email: String?)

fun main() {
    val users = listOf(
        User("Ana", 30, "ana@example.com"),
        User("Bo", 17, null),
        User("Cy", 25, "cy@example.com"),
    )

    val names = users.map { it.name }
    println(names) // [Ana, Bo, Cy]

    // mapNotNull: map, then drop the nulls, in one pass
    val emails = users.mapNotNull { it.email }
    println(emails) // [ana@example.com, cy@example.com]

    val numbered = users.mapIndexed { index, user -> "${index + 1}. ${user.name}" }
    println(numbered) // [1. Ana, 2. Bo, 3. Cy]
}
```

`mapNotNull` is exactly `map { transform(it) }.filterNotNull()`, done in a
single pass — reach for it whenever the transform itself might legitimately
produce `null` for some elements.

## flatMap

`map` gives you one output per input element. `flatMap` is for when each
input maps to a *collection* of outputs, which you want flattened into a
single result list rather than a list of lists:

```kotlin-runnable
data class Order(val id: Int, val items: List<String>)

fun main() {
    val orders = listOf(
        Order(1, listOf("pen", "notebook")),
        Order(2, listOf("stapler")),
        Order(3, listOf("pen", "eraser")),
    )

    val nested = orders.map { it.items }
    println(nested) // [[pen, notebook], [stapler], [pen, eraser]]

    val allItems = orders.flatMap { it.items }
    println(allItems) // [pen, notebook, stapler, pen, eraser]
}
```

## groupBy

`groupBy` partitions elements into a `Map` keyed by whatever your selector
returns, collecting all elements sharing a key into a list:

```kotlin-runnable
data class User(val name: String, val age: Int, val email: String?)

fun main() {
    val users = listOf(
        User("Ana", 30, "ana@example.com"),
        User("Bo", 17, null),
        User("Cy", 25, "cy@example.com"),
        User("Dee", 17, null),
    )

    val byAge = users.groupBy { it.age }
    println(byAge)
    // {30=[User(name=Ana, ...)], 17=[User(name=Bo, ...), User(name=Dee, ...)], 25=[...]}

    val namesByDecade = users.groupBy({ it.age / 10 * 10 }, { it.name })
    println(namesByDecade) // {30=[Ana], 10=[Bo, Dee], 20=[Cy]}
}
```

The two-argument overload lets you supply a separate transform for the
*values*, so you're not stuck storing the whole original element in each
group.

## associateBy, associateWith, associate

These build a `Map` from a collection, and differ in which side of the map
your original elements end up on:

```kotlin-runnable
data class User(val name: String, val age: Int, val email: String?)

fun main() {
    val users = listOf(
        User("Ana", 30, "ana@example.com"),
        User("Bo", 17, null),
    )

    // associateBy: elements become VALUES, keyed by the selector
    val byName: Map<String, User> = users.associateBy { it.name }
    println(byName["Ana"]) // User(name=Ana, age=30, email=ana@example.com)

    // associateWith: elements become KEYS, values computed from each one
    val ageByUser: Map<User, Int> = users.associateWith { it.age }
    println(ageByUser.values) // [30, 17]

    // associate: you control both the key and the value
    val nameToAge: Map<String, Int> = users.associate { it.name to it.age }
    println(nameToAge) // {Ana=30, Bo=17}
}
```

Careful with `associateBy` and `associate`: if two elements produce the same
key, the later one silently overwrites the earlier one in the resulting map.
Use `groupBy` instead if you need to keep every element under a shared key.

## partition

`partition` splits a collection into two lists in a single pass — one where
a predicate is true, one where it's false — returned as a `Pair`:

```kotlin-runnable
data class User(val name: String, val age: Int, val email: String?)

fun main() {
    val users = listOf(
        User("Ana", 30, "ana@example.com"),
        User("Bo", 17, null),
        User("Cy", 25, "cy@example.com"),
    )

    val (adults, minors) = users.partition { it.age >= 18 }
    println(adults.map { it.name })  // [Ana, Cy]
    println(minors.map { it.name })  // [Bo]
}
```

`users.partition { it.age >= 18 }` is equivalent to computing
`users.filter { it.age >= 18 }` and `users.filterNot { it.age >= 18 }`
separately, but does it in one traversal instead of two.

## Putting it together

A realistic combined example: given a list of orders, find the names of
all distinct items ordered by customers over 21, sorted alphabetically.

```kotlin-runnable
data class Customer(val name: String, val age: Int)
data class Order(val customer: Customer, val items: List<String>)

fun main() {
    val orders = listOf(
        Order(Customer("Ana", 30), listOf("pen", "notebook")),
        Order(Customer("Bo", 17), listOf("candy")),
        Order(Customer("Cy", 25), listOf("notebook", "eraser")),
    )

    val result = orders
        .filter { it.customer.age > 21 }
        .flatMap { it.items }
        .distinct()
        .sorted()

    println(result) // [eraser, notebook, pen]
}
```

## Tasks

### Task 1: Filter and map together

Given `val words = listOf("kotlin", "is", "fun", "and", "concise")`, produce
a list of the uppercase form of every word with more than 3 letters.

::: details Solution
```kotlin
fun main() {
    val words = listOf("kotlin", "is", "fun", "and", "concise")
    val result = words.filter { it.length > 3 }.map { it.uppercase() }
    println(result) // [KOTLIN, CONCISE]
}
```
:::

### Task 2: Group students by grade

Given a `data class Student(val name: String, val grade: Char)` and a list
of four students with grades `'A'`, `'B'`, `'A'`, `'C'`, produce a
`Map<Char, List<String>>` of grade to student names.

::: details Solution
```kotlin
data class Student(val name: String, val grade: Char)

fun main() {
    val students = listOf(
        Student("Ana", 'A'),
        Student("Bo", 'B'),
        Student("Cy", 'A'),
        Student("Dee", 'C'),
    )

    val byGrade = students.groupBy({ it.grade }, { it.name })
    println(byGrade) // {A=[Ana, Cy], B=[Bo], C=[Dee]}
}
```
:::

### Task 3: Flatten and deduplicate

Given `val playlists = listOf(listOf("a", "b"), listOf("b", "c"), listOf("a", "d"))`,
produce a sorted list of every distinct song across all playlists.

::: details Solution
```kotlin
fun main() {
    val playlists = listOf(listOf("a", "b"), listOf("b", "c"), listOf("a", "d"))
    val allSongs = playlists.flatMap { it }.distinct().sorted()
    println(allSongs) // [a, b, c, d]
}
```
`flatMap { it }` flattens the list of lists; passing the identity lambda
works here because each element is already the list we want to expand. For
this specific "list of lists" shape you could also write `playlists.flatten()`.
:::

### Task 4: Build a lookup table

Given `val users = listOf(User("Ana", 1), User("Bo", 2))` (with
`data class User(val name: String, val id: Int)`), build a
`Map<Int, String>` from id to name using `associate`.

::: details Solution
```kotlin
data class User(val name: String, val id: Int)

fun main() {
    val users = listOf(User("Ana", 1), User("Bo", 2))
    val idToName = users.associate { it.id to it.name }
    println(idToName) // {1=Ana, 2=Bo}
}
```
`users.associateBy { it.id }` would also build a map keyed by id, but its
values would be whole `User` objects, not just names — `associate` is the
right tool when you want to control both sides of the resulting map.
:::

Next: [Aggregate Operations](/collections/aggregate-operations)
