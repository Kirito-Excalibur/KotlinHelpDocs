# Installing Kotlin

You don't strictly need to install anything to follow this tutorial — every
runnable example on this site executes in your browser. But for real
projects you'll want a local setup.

## Option 1: Just use the Playground (recommended for this tutorial)

Every editable code block on this site is a full copy of the
[Kotlin Playground](https://play.kotlinlang.org/). You can also go to
play.kotlinlang.org directly to experiment freely, share snippets via a link,
and target JVM, JS, or WebAssembly output.

## Option 2: IntelliJ IDEA

IntelliJ IDEA (from JetBrains, the creators of Kotlin) has first-class Kotlin
support built in.

1. Download [IntelliJ IDEA Community Edition](https://www.jetbrains.com/idea/download/) (free).
2. Create a **New Project** → choose **Kotlin** as the language and
   **Gradle** (Kotlin DSL) as the build system.
3. IntelliJ generates a `src/main/kotlin/Main.kt` file you can run immediately
   with the green ▶ gutter icon.

## Option 3: Command line

If you have the Kotlin compiler installed (via [SDKMAN!](https://sdkman.io/),
Homebrew, or your package manager):

```bash
# macOS (Homebrew)
brew install kotlin

# SDKMAN! (Linux/macOS)
sdk install kotlin
```

Then compile and run a file directly:

```bash
kotlinc hello.kt -include-runtime -d hello.jar
java -jar hello.jar
```

Or skip the separate compile step entirely with the Kotlin script runner:

```bash
kotlinc -script hello.kts
```

## What you need for this tutorial

Nothing — just keep reading. Every example has a **Run** button. When you're
ready to build something real, come back to this page and pick option 2.

Next: [Hello, World!](/getting-started/hello-world)
