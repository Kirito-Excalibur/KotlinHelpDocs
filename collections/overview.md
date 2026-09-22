# Overview

You've already seen `listOf`, `mutableListOf`, `setOf`, and `mapOf` in
[Arrays and Collections](/basics/arrays-and-collections-intro). This section
goes deep on each collection type and the operations you can run on them.
First, though, it's worth understanding how the collection types relate to
each other, because that shapes which type you reach for.

## The interface hierarchy

Kotlin's collections aren't its own invention — under the hood they're the
same `java.util` collections the JVM has always had. What Kotlin adds is a
layer of interfaces on top that split every collection type in two: one
version you can only read from, and one you can also modify.

The read-only side looks like this:

```
Iterable<T>
    └── Collection<T>
            ├── List<T>
            └── Set<T>
```

- `Iterable<T>` just means "you can loop over this with `for`." It's the
  most general interface — it only guarantees a way to get an iterator.
- `Collection<T>` adds `size`, `isEmpty()`, `contains()`, and the ability to
  convert to other collection types. Most things you'd call "a collection"
  implement this.
- `List<T>` adds order and indexed access (`list[i]`).
- `Set<T>` adds the guarantee that elements are unique, but drops indexed
  access — a set isn't ordered by position the way a list is.

`Map<K, V>` sits outside this hierarchy entirely. A map isn't a collection of
elements; it's a collection of key-value entries, so it doesn't implement
`Collection<T>`. It does expose `keys` (a `Set<K>`) and `values` (a
`Collection<V>`) if you need to treat parts of it that way.

Every one of these has a mutable counterpart — `MutableIterable`,
`MutableCollection`, `MutableList`, `MutableSet`, `MutableMap` — each adding
the operations that change the collection in place (`add`, `remove`, `put`,
and so on) on top of everything the read-only version already provides.

```kotlin-runnable
fun main() {
    val numbers: List<Int> = listOf(1, 2, 3)
    val words: MutableList<String> = mutableListOf("a", "b")

    // A MutableList *is* a List — you can pass it anywhere a List is expected.
    fun printAll(items: List<String>) = println(items)
    printAll(words)

    words.add("c") // only possible because `words` is declared as MutableList
    printAll(words)
}
```

## Read-only view vs. true immutability

This is the detail that trips people up coming from languages with a real
immutable collection type (like Java's `List.of()` or Python's `tuple`):
**`List` in Kotlin is not a promise that the collection can never change —
it's a promise that *you*, holding a reference typed as `List`, can't change
it through that reference.**

If some other code holds a reference to the same underlying collection typed
as `MutableList`, it can still mutate it, and your `List` reference will see
the change, because it's the same object in memory.

```kotlin-runnable
fun main() {
    val mutable = mutableListOf(1, 2, 3)
    val readOnlyView: List<Int> = mutable // same object, narrower type

    mutable.add(4)
    println(readOnlyView) // [1, 2, 3, 4] — the view sees the mutation
}
```

`listOf()` itself, in practice, usually does return a genuinely fixed-size,
never-mutated list — but that's an implementation detail, not something the
`List` type guarantees. If you need to hand out a collection and be certain
nobody can mutate the data behind your back, don't rely on typing alone;
copy it (`toList()`, `toMutableList()` on your side, or keep the only
mutable reference private) so no shared mutable reference is loose.

## Choosing a collection type

A quick decision guide for the types you'll use constantly:

- **Need order and possibly duplicates, and to look things up by position?**
  Use `List` (or `MutableList` if it needs to change after creation).
- **Need to guarantee no duplicates, and don't care about position?**
  Use `Set` (or `MutableSet`).
- **Need to look values up by a key instead of a position?**
  Use `Map` (or `MutableMap`).
- **Default to the read-only interface** (`List`, `Set`, `Map`) for function
  parameters and return types unless the caller specifically needs to
  mutate what you give them. It documents intent and prevents accidental
  changes.
- **Default to `mutableListOf`/`mutableSetOf`/`mutableMapOf`** only for
  local variables you're actively building up, then expose the result
  through its read-only interface once it's done.

```kotlin-runnable
fun buildGreeting(names: List<String>): String {
    // Only needs to read `names` — takes the read-only interface.
    val builder = mutableListOf<String>() // needs to grow — mutable, but local
    for (name in names) {
        builder.add("Hi, $name!")
    }
    return builder.joinToString(separator = "\n")
}

fun main() {
    println(buildGreeting(listOf("Ana", "Kofi", "Priya")))
}
```

The next few pages cover `List`, `Set`, and `Map` individually, then move on
to sequences and the standard library's rich set of operations for
filtering, transforming, and aggregating collections.

## Tasks

### Task 1: Read-only or mutable?

For each function signature below, say whether the parameter type should be
`List<T>` or `MutableList<T>`, and why:

1. `fun printReport(entries: ???<String>)` — only prints each entry.
2. `fun addDefaults(settings: ???<String>)` — appends a few default values
   to whatever was passed in, in place.

::: details Solution
1. `List<String>` — the function only reads the data, so it should take the
   narrowest interface that supports what it does. This also tells callers
   (and the compiler) that their list won't be changed.
2. `MutableList<String>` — the function needs `add`, which only exists on
   `MutableList`. Using the mutable type here is correct because mutation is
   the whole point of the function.
:::

### Task 2: Predict the output

Without running it, decide what this prints, then check yourself:

```kotlin-runnable
fun main() {
    val source = mutableListOf("x", "y")
    val view: List<String> = source

    source.add("z")
    println(view.size)

    // view.add("w") // uncomment: does this compile?
}
```

::: details Solution
```kotlin
fun main() {
    val source = mutableListOf("x", "y")
    val view: List<String> = source

    source.add("z")
    println(view.size) // 3
}
```
It prints `3`. `view` and `source` refer to the same underlying list, so a
mutation through `source` is visible through `view` too — `List` only
restricts what *you* can do through that reference, it doesn't freeze the
object. The commented-out line would **not** compile: `List` has no `add`
method, regardless of what the object underneath actually is.
:::

Next: [Lists](/collections/lists)
