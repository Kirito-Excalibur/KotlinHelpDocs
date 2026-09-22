# Visibility Modifiers

Kotlin has four visibility modifiers. Three will feel familiar from Java;
the fourth — `internal` — covers a gap Java simply doesn't have a keyword
for.

| Modifier | Visible from |
|---|---|
| `public` (default) | Everywhere |
| `internal` | Anywhere in the same module |
| `protected` | The class and its subclasses |
| `private` | The declaration's own scope (class, or file) |

## `public` by default

Unlike some languages, Kotlin defaults to `public` if you write nothing —
same default as Java's package-private-if-unspecified is *not* the analogy
here; Kotlin has no package-private visibility at all.

```kotlin-runnable
class Greeter {
    fun greet() = "Hello!" // public, same as `public fun greet()`
}

fun main() {
    println(Greeter().greet())
}
```

## `private`

Inside a class, `private` means "only visible inside this class" — no
subclass, no outside code:

```kotlin-runnable
class Wallet(private var balance: Double) {
    fun deposit(amount: Double) {
        balance += amount
    }

    fun currentBalance(): Double = balance
}

fun main() {
    val wallet = Wallet(100.0)
    wallet.deposit(50.0)
    println(wallet.currentBalance())
    // wallet.balance // would not compile — balance is private
}
```

`private` behaves differently **at the top level of a file** (outside any
class): there, it means "visible only within this file" — closer to a
file-scoped helper than to Java's package-private:

```kotlin
// In SomeFile.kt
private fun helper() = "only usable inside SomeFile.kt"

fun publicApi() = helper() // fine, same file
```

## `protected`

Same idea as Java: visible in the declaring class and any subclass, but not
to arbitrary outside code. Unlike Java, it does *not* also expose the member
to other classes in the same package — because Kotlin doesn't have
packages-as-a-visibility-boundary in the first place.

```kotlin-runnable
open class Employee(protected val salary: Double) {
    protected fun baseDescription() = "Earns $salary"
}

class Manager(salary: Double, private val bonus: Double) : Employee(salary) {
    fun describe() = "${baseDescription()}, plus $bonus bonus"
}

fun main() {
    val manager = Manager(60000.0, 10000.0)
    println(manager.describe())
    // manager.salary // would not compile — protected, not accessible from outside
}
```

`protected` (like `private`) doesn't apply at the top level — there's no
"subclass" concept for a free function, so only `public`, `internal`, and
file-`private` make sense there.

## `internal`: the one Java doesn't have

`internal` means "visible anywhere in the same **module**" — roughly, the
same compiled unit (a Gradle/Maven module, an IntelliJ module, or similar).
Code outside your module can't see it, but unlike `private`, code in any
file *within* your module can:

```kotlin-runnable
internal class InternalHelper {
    fun help() = "internal helpers can be used across files in the same module"
}

fun useIt(): String {
    return InternalHelper().help()
}

fun main() {
    println(useIt())
}
```

Why does this matter? Java's closest tool for "public within our library,
hidden from consumers" is package-private — but that only works if
everything lives in one package, which gets awkward fast in a real
multi-package codebase. `internal` gives you that boundary at the level
that actually matches how projects are built and published: you can freely
use `internal` classes across all your packages, while consumers who add
your library as a dependency can't see them at all. This is exactly how
library authors expose a large public API while keeping implementation
details, factory internals, and helper types hidden from consumers without
resorting to a single giant package.

## Constructors can have visibility too

The primary constructor itself can be marked, which requires the explicit
`constructor` keyword:

```kotlin-runnable
class Password private constructor(val hash: String) {
    companion object {
        fun fromPlainText(text: String): Password {
            // (pretend this does real hashing)
            return Password("hashed:$text")
        }
    }
}

fun main() {
    val password = Password.fromPlainText("hunter2")
    println(password.hash)
    // Password("raw") // would not compile — constructor is private
}
```

(`companion object` is covered in
[Object Expressions & Declarations](/oop/object-expressions-and-declarations)
— for now just read it as "a place to put factory-style functions".) This
pattern — private constructor plus a public factory function — is a common
way to force construction through validation or naming that a bare
constructor call can't express.

## Tasks

### Task 1: Encapsulated counter

Define `class Counter` with a `private var count: Int = 0`, plus public
functions `increment()` and `current(): Int`. Verify from `main` that
`count` can't be accessed directly (leave the failing line commented out).

```kotlin-runnable
// Your code here

fun main() {

}
```

::: details Solution
```kotlin
class Counter {
    private var count: Int = 0

    fun increment() {
        count++
    }

    fun current(): Int = count
}

fun main() {
    val counter = Counter()
    counter.increment()
    counter.increment()
    println(counter.current())
    // counter.count // would not compile — private
}
```
:::

### Task 2: `protected` in a hierarchy

Define `open class Account(protected var balance: Double)` with a
`protected fun logChange(amount: Double)` that just prints a message. Define
`class SavingsAccount(balance: Double) : Account(balance)` with a function
`addInterest(rate: Double)` that increases `balance` by `balance * rate` and
calls `logChange`.

::: details Solution
```kotlin
open class Account(protected var balance: Double) {
    protected fun logChange(amount: Double) {
        println("Balance changed by $amount")
    }
}

class SavingsAccount(balance: Double) : Account(balance) {
    fun addInterest(rate: Double) {
        val amount = balance * rate
        balance += amount
        logChange(amount)
    }
}

fun main() {
    val savings = SavingsAccount(1000.0)
    savings.addInterest(0.05)
}
```
:::

Next: [Interfaces](/oop/interfaces)
