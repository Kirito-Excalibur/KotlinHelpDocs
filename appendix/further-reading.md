# Further Reading

That's the tutorial. You've gone from `fun main()` through classes and
objects, functional programming, collections, error handling, coroutines,
and a look at what lies beyond the JVM with Kotlin Multiplatform. That's
enough to read and write real Kotlin comfortably — the rest is depth, not
new fundamentals.

## Where to go next

- **[Official Kotlin documentation](https://kotlinlang.org/docs/home.html)**
  — the exhaustive reference this tutorial was conceptually structured
  after. Go here for anything this tutorial only touched on lightly,
  including full guides for:
  - **Kotlin Multiplatform**, in depth — Gradle source set configuration,
    publishing shared libraries, connecting to real Android and iOS
    projects.
  - **[Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)**
    — sharing UI code across Android, iOS, desktop, and web.
  - **[Ktor](https://ktor.io/)** — Kotlin's asynchronous framework for
    building backends and HTTP clients, built directly on coroutines.
  - **Kotlin/Wasm** — compiling Kotlin to WebAssembly for the browser.
  - **[Arrow](https://arrow-kt.io/)** — a library for more advanced
    functional programming patterns in Kotlin (typed error handling,
    optics, and more) beyond what the standard library provides.

- **[Kotlin Playground](https://play.kotlinlang.org/)** — the same
  environment powering the runnable examples throughout this tutorial,
  standalone. Good for trying out ideas, checking a bytecode/JS output, or
  sharing a snippet with someone else.

## Build something

The fastest way to turn "I read about Kotlin" into "I know Kotlin" is to
build something small end to end. A few good first projects, roughly in
order of how much they lean on what this tutorial covered:

- A **command-line tool** — a file organizer, a text-based to-do list, a
  simple calculator — using nothing but what you already know: classes,
  collections, and error handling.
- A **small backend with Ktor** — a REST API backed by an in-memory store or
  a real database, exercising coroutines for real I/O instead of toy
  examples.
- An **Android app** — puts classes, null safety, collections, and
  coroutines to work in a real UI, and is a natural on-ramp if you want to
  explore Kotlin Multiplatform next.

Pick whichever sounds least like homework. You'll hit real questions that no
tutorial anticipates, and that's exactly when the official documentation
above becomes genuinely useful instead of just background reading.
