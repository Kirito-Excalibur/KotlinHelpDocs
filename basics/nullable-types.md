# Null Safety

Null safety is the feature Kotlin is most famous for. The goal is blunt:
eliminate `NullPointerException` as a runtime surprise by making
nullability part of the type system, checked at compile time instead of
discovered in production.

## Nullable vs non-null types

Every type in Kotlin is non-nullable by default. `String` can never hold
`null`. To allow `null`, you add a `?` to the type: `String?` is a
different, wider type that can hold either a `String` or `null`.

```kotlin-runnable
fun main() {
    var name: String = "Ada"
    // name = null            // compile error: String can't hold null

    var nickname: String? = "Ada"
    nickname = null           // fine: String? can hold null
    println(nickname)
}
```

This distinction is checked entirely at compile time. If a function
parameter is typed `String` (not `String?`), the compiler guarantees no
caller can ever pass `null` — there's no need for a defensive `if (x !=
null)` check inside the function at all.

## The compiler stops you at the point of use

Once you have a `String?`, the compiler won't let you call members on it
directly, because `null` doesn't have a `.length` to call.

```kotlin-runnable
fun main() {
    val nickname: String? = null
    // println(nickname.length)   // compile error: only safe (?.) or non-null asserted (!!) calls are allowed
    println(nickname?.length)
}
```

This is the core of the feature: the compiler forces you to explicitly
decide, right at the call site, what should happen if the value turns out
to be `null`. There are several tools for that decision, covered below.

## Safe call: `?.`

`?.` calls the member only if the receiver isn't `null`; otherwise the
whole expression short-circuits to `null` without throwing.

```kotlin-runnable
fun main() {
    val nickname: String? = null
    val length: Int? = nickname?.length   // null, no exception

    println(length)

    val realNickname: String? = "Ace"
    println(realNickname?.length)          // 3
}
```

Safe calls chain naturally — if any link in the chain is `null`, the whole
expression short-circuits to `null` immediately.

```kotlin-runnable
class Address(val city: String?)
class Person(val address: Address?)

fun main() {
    val person: Person? = Person(Address("Berlin"))
    println(person?.address?.city)

    val noAddress: Person? = Person(null)
    println(noAddress?.address?.city)
}
```

## Elvis operator: `?:`

`?:` supplies a fallback value to use when the expression on its left is
`null`. You already saw this back in [Hello, World!](/getting-started/hello-world).

```kotlin-runnable
fun main() {
    val nickname: String? = null
    val displayName = nickname ?: "Anonymous"

    println(displayName)
}
```

The right-hand side of `?:` can be any expression, including one that
throws or returns from the enclosing function — useful for validating
arguments early:

```kotlin-runnable
fun greet(name: String?) {
    val safeName = name ?: return   // exit the function early if null
    println("Hello, $safeName!")
}

fun main() {
    greet("Ada")
    greet(null)
}
```

Chaining `?.` and `?:` together is an extremely common idiom: "get this
value if it's there, otherwise use a default."

```kotlin-runnable
fun main() {
    val nickname: String? = null
    val length = nickname?.length ?: 0

    println(length)
}
```

## Not-null assertion: `!!`

`!!` converts a `T?` into a `T` by asserting "trust me, this is never null
here" — and if you're wrong, it throws a `NullPointerException` right at
that line.

```kotlin-runnable
fun main() {
    val nickname: String? = "Ace"
    val length: Int = nickname!!.length   // asserts non-null
    println(length)
}
```

Avoid `!!` unless you're certain — it reintroduces exactly the runtime
crash null safety exists to prevent, just relocated to a single explicit
spot. It's occasionally reasonable when you have external knowledge the
compiler can't see (e.g., you just checked a `Map` contains a key a line
above), but `?.`, `?:`, or a proper `if` check are almost always safer and
more idiomatic. Treat `!!` in code review as a flag worth double-checking.

## Safe casts: `as?`

`as` casts a value to a type, throwing a `ClassCastException` if it doesn't
match. `as?` is the safe version: it returns `null` instead of throwing when
the cast fails.

```kotlin-runnable
fun main() {
    val value: Any = "hello"

    val asString: String? = value as? String
    val asInt: Int? = value as? Int

    println(asString)
    println(asInt)
}
```

This combines nicely with the Elvis operator for a cast-with-default
pattern:

```kotlin-runnable
fun main() {
    val value: Any = 42

    val length = (value as? String)?.length ?: -1
    println(length)
}
```

## Scoping a null check with `let`

`?.let { ... }` runs the lambda only when the receiver is non-null, passing
it in as `it`. This is handy for confining a nullable value to a small
block, especially instead of an `if (x != null) { ... }` wrapper.

```kotlin-runnable
fun printLength(text: String?) {
    text?.let {
        println("Length is ${it.length}")
    }
}

fun main() {
    printLength("Kotlin")
    printLength(null)   // prints nothing, lambda never runs
}
```

`let` itself is a general-purpose scope function (not exclusive to null
handling), but `?.let { }` for "do this only if present" is one of its most
common uses in everyday Kotlin.

## Smart casts without an operator

The compiler can also automatically treat a nullable value as non-null
after you've already checked it with a plain `if`, without needing `?.` or
`!!` at all:

```kotlin-runnable
fun printLength(text: String?) {
    if (text != null) {
        println(text.length)   // smart-cast to String inside this block
    } else {
        println("no text")
    }
}

fun main() {
    printLength("Kotlin")
    printLength(null)
}
```

This only works for `val`s (or `var`s the compiler can prove aren't
modified between the check and the use) — a mutable property that another
thread could change wouldn't be safe to smart-cast, so Kotlin doesn't allow
it there.

This chapter covers the everyday tools; there's more nuance around platform
types from Java interop, `lateinit`, and nullable generics in
[Nullability In Depth](/error-handling/nullability-in-depth).

## Tasks

### Task 1: Safe call and Elvis

Write a function `shout(text: String?): String` that returns the uppercase
version of `text`, or `"..."` if `text` is `null`. Solve it in one line
using `?.` and `?:`.

::: details Solution
```kotlin
fun shout(text: String?): String {
    return text?.uppercase() ?: "..."
}

fun main() {
    println(shout("hello"))
    println(shout(null))
}
```
:::

### Task 2: Early return with Elvis

Write a function `firstInitial(name: String?): Char` that returns the first
character of `name`, or `'?'` if `name` is `null` or empty. Use `?:` for the
null case and handle the empty case separately.

::: details Solution
```kotlin
fun firstInitial(name: String?): Char {
    val safeName = name ?: return '?'
    return safeName.firstOrNull() ?: '?'
}

fun main() {
    println(firstInitial("Ada"))
    println(firstInitial(""))
    println(firstInitial(null))
}
```
`firstOrNull()` returns `null` instead of throwing when the string is
empty, so the second `?:` handles that case the same way the first one
handles an outright `null` argument.
:::

### Task 3: Safe cast chain

Write a function `describe(value: Any?): String` that returns
`"String of length N"` if `value` is a non-null `String`, or `"not a
string"` otherwise (including when `value` is `null`). Implement it using
`as?` rather than `is`.

::: details Solution
```kotlin
fun describe(value: Any?): String {
    val text = value as? String ?: return "not a string"
    return "String of length ${text.length}"
}

fun main() {
    println(describe("hello"))
    println(describe(42))
    println(describe(null))
}
```
`as? String` returns `null` both when `value` is a different type and when
`value` is already `null`, so one Elvis check handles both failure cases at
once.
:::

Next: [Arrays and Collections](/basics/arrays-and-collections-intro)
