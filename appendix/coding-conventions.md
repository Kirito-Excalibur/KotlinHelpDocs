# Coding Conventions

Kotlin has an official style guide, and virtually all Kotlin code —
including the standard library itself — follows it. You don't need to
memorize it; IntelliJ and Android Studio format to it by default. This page
is a summary so you can recognize idiomatic style when you see it.

## Naming

- **Packages**: lowercase, no underscores — `com.example.myapp`.
- **Classes, interfaces, objects**: `PascalCase` — `class HttpClient`,
  `interface Repository`.
- **Functions and properties**: `camelCase` — `fun computeTotal()`,
  `val userName`.
- **Constants** — `val`s that are top-level or in an `object`/companion
  object, hold a deeply immutable value, and have no custom getter — use
  `SCREAMING_SNAKE_CASE`:

  ```kotlin
  const val MAX_RETRIES = 3
  ```

  An ordinary instance property, even if it never changes for a given
  object, stays `camelCase`.

## Formatting

- Indent with **4 spaces**, never tabs.
- Keep lines to roughly 120 characters.
- Put the opening brace on the same line as the declaration; `else`,
  `catch`, and `finally` go on the same line as the preceding closing brace.

```kotlin
if (condition) {
    doSomething()
} else {
    doSomethingElse()
}
```

## Trailing lambda syntax

When a function's last parameter is a lambda, move it outside the
parentheses — and drop the parentheses entirely if it's the only argument:

```kotlin
// Preferred
items.forEach { println(it) }

// Not idiomatic
items.forEach({ println(it) })
```

This is why Kotlin DSLs (`apply`, `buildString`, Gradle's Kotlin DSL, Compose)
read like control structures instead of function calls.

## Prefer expression bodies for simple functions

```kotlin
// Preferred for simple, single-expression logic
fun square(x: Int) = x * x

// Reserve block bodies for anything with real control flow
fun classify(x: Int): String {
    return if (x < 0) "negative" else if (x == 0) "zero" else "positive"
}
```

## Prefer immutability

- Default to `val`; reach for `var` only when reassignment is actually
  needed.
- Default to the read-only collection interfaces (`List`, `Set`, `Map`) in
  signatures and properties; use `MutableList`/`MutableSet`/`MutableMap`
  only where mutation is genuinely part of the contract.
- Prefer immutable `data class` instances plus `.copy()` over mutable
  objects you update in place.

None of this is enforced by the compiler — it's a style default because
immutable data is easier to reason about and safe to share across threads
and coroutines without extra locking.

## File naming

A file that contains a single top-level class or interface is named after
it: `HttpClient.kt` contains `class HttpClient`. Files with multiple
top-level declarations, or none (just top-level functions), get a
descriptive name in `PascalCase`, often ending in something like `Utils` or
`Extensions` — e.g. `StringExtensions.kt`.

## Tooling does most of the work

In practice you rarely think about most of this line by line:

- IntelliJ IDEA and Android Studio format Kotlin to the official style by
  default (`Reformat Code`, or format-on-save).
- [`ktlint`](https://pinterest.github.io/ktlint/) and the Kotlin Gradle
  plugin's built-in formatter can enforce these conventions automatically in
  CI, failing a build (or auto-fixing) on violations.

Write code, let the formatter handle whitespace and brace placement, and
save your attention for naming and structure — the parts a tool can't decide
for you.

Next: [Further Reading](/appendix/further-reading)
