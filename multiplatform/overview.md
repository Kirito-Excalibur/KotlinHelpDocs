# Overview

Everything up to this point has been about writing Kotlin that runs on the
JVM. That's most of what you'll do day to day, but it's not the whole story:
Kotlin compiles to more than just JVM bytecode, and that lets you share code
across platforms that otherwise share nothing.

## What Kotlin Multiplatform is

**Kotlin Multiplatform (KMP)** is a way to write one Kotlin codebase and
compile it for several targets:

- **JVM** — regular Java bytecode, for backends and Android.
- **Native** — compiled directly to machine code via LLVM, for iOS, macOS,
  Linux, and Windows, with no JVM involved.
- **JS / Wasm** — compiled to JavaScript or WebAssembly, for browsers and
  Node.js.

The point isn't "write once, run anywhere" in the old Java-applet sense —
KMP doesn't pretend platforms are identical, and you still write real
platform-specific UI code where it matters. The point is narrower and more
useful: write the parts of your app that *don't* depend on the platform
— networking, parsing, validation, business rules, database access — once,
and share that single implementation across every target.

A typical shape for a mobile app:

- **Shared module** (Kotlin, compiled to JVM for Android and Native for iOS):
  networking, data models, business logic.
- **Android app**: Kotlin/Compose UI, using the shared module directly as a
  JVM library.
- **iOS app**: Swift/SwiftUI UI, calling into the shared module through a
  generated Objective-C/Swift framework.

Only the UI layer — and anything that genuinely needs a native API — stays
platform-specific. Everything else is written and tested once.

## `expect` / `actual`

Most shared code is just... shared code. It doesn't know or care which
platform it'll run on. But sometimes shared code needs something a platform
provides differently — reading the current time, generating a UUID, making
an HTTP call at the lowest level. For that, Kotlin has the `expect`/`actual`
mechanism.

You declare an `expect` signature in the shared source set, without a body:

```kotlin
// shared code (commonMain)
expect fun currentTimeMillis(): Long
```

And then you provide an `actual` implementation for each platform, in a
source set specific to that platform:

```kotlin
// JVM (jvmMain)
actual fun currentTimeMillis(): Long = System.currentTimeMillis()
```

```kotlin
// Native, e.g. iOS (iosMain)
actual fun currentTimeMillis(): Long = platform.posix.time(null).toLong() * 1000
```

Code in `commonMain` calls `currentTimeMillis()` like any other function. The
compiler links each platform build against its matching `actual`. The same
pattern works for classes, properties, and objects, not just functions —
whatever needs a platform-specific body gets `expect`ed in common code and
`actual`ed per target.

This is the escape hatch, not the everyday tool. Most of your shared code —
data classes, collection processing, coroutines, your actual business
logic — needs no `expect`/`actual` at all, because the standard library and
your own pure-Kotlin code already work identically everywhere.

## Where KMP shows up in practice

- **Mobile apps**: share networking, persistence, and business logic between
  Android and iOS, while keeping native UI on each side (or share the UI too,
  with Compose Multiplatform — see below).
- **Compose Multiplatform**: JetBrains' declarative UI toolkit, built on the
  same ideas as Jetpack Compose, but targeting Android, iOS, desktop
  (Windows/macOS/Linux), and web from one UI codebase. This lets you share UI
  code too, not just logic.
- **Full-stack Kotlin**: a [Ktor](https://ktor.io/) backend and a
  Kotlin/JS or Kotlin/Wasm frontend sharing request/response models and
  validation logic, so the client and server can never disagree about the
  shape of your data.
- **Libraries**: publish a single Kotlin library that JVM, iOS, and JS
  consumers can all depend on natively.

Here's the one part of this that's just ordinary Kotlin — the shared
business logic itself needs nothing special to write or test:

```kotlin-runnable
data class Order(val id: Int, val items: List<String>, val total: Double)

fun applyDiscount(order: Order, percent: Double): Order {
    val discounted = order.total * (1 - percent / 100)
    return order.copy(total = discounted)
}

fun main() {
    val order = Order(1, listOf("Keyboard", "Mouse"), 150.0)
    println(applyDiscount(order, 10.0))
}
```

That function is exactly what you'd put in `commonMain` in a real KMP
project — it doesn't know or care whether it ends up running on a JVM
server, inside an Android app, or in an iOS binary.

## Where to go from here

Setting up an actual multiplatform project — target configuration, Gradle
source sets, generating the iOS framework, wiring up Compose Multiplatform —
is real tooling work with a lot of moving parts, and it's out of scope for
this tutorial. The concepts above are enough to recognize KMP code when you
see it and to know when reaching for it makes sense.

For hands-on setup, JetBrains maintains dedicated, actively updated guides
at the [official Kotlin Multiplatform documentation](https://kotlinlang.org/docs/multiplatform.html),
including a "Get started" path that walks through creating your first shared
module and connecting it to Android and iOS apps.

Next: [Kotlin Idioms](/appendix/idioms)
