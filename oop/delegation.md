# Delegation

"Favor composition over inheritance" is classic advice — instead of
subclassing to reuse behavior, hold a reference to another object and
forward calls to it. Kotlin has first-class syntax for exactly this
pattern, for both whole-class implementation and individual properties.

## Class delegation with `by`

Say you want a class that implements an interface mostly by forwarding to
some other object, but with a few methods tweaked. Normally that means
writing a forwarding method for every single interface member by hand.
Kotlin's `by` clause generates all that forwarding code for you:

```kotlin-runnable
interface SoundMaker {
    fun makeSound(): String
}

class Horn : SoundMaker {
    override fun makeSound() = "Honk!"
}

class Car(private val horn: SoundMaker) : SoundMaker by horn

fun main() {
    val car = Car(Horn())
    println(car.makeSound()) // forwarded straight to horn.makeSound()
}
```

`class Car(private val horn: SoundMaker) : SoundMaker by horn` says: "`Car`
implements `SoundMaker`, and unless I say otherwise, every call to a
`SoundMaker` member on a `Car` should be forwarded to `horn`." You can still
override individual members normally:

```kotlin-runnable
interface SoundMaker {
    fun makeSound(): String
}

class Horn : SoundMaker {
    override fun makeSound() = "Honk!"
}

class Car(private val horn: SoundMaker) : SoundMaker by horn {
    override fun makeSound() = "${horn.makeSound()} (from a car)"
}

fun main() {
    val car = Car(Horn())
    println(car.makeSound())
}
```

This gives you the flexibility of composition (swap in any `SoundMaker`
implementation at runtime, no fragile base class coupling) with the
convenience of inheritance (you don't write nine lines of one-line
forwarding methods for a nine-method interface).

## Delegated properties with `by`

Separately, individual **properties** can delegate their `get`/`set` logic
to a helper object, also using `by`. You already met one of these:

```kotlin-runnable
class Config {
    val expensiveValue: String by lazy {
        println("Computing...")
        "result"
    }
}

fun main() {
    val config = Config()
    println(config.expensiveValue)
    println(config.expensiveValue) // computed once, cached after
}
```

### `Delegates.observable`

The standard library's `kotlin.properties.Delegates` object provides
`observable`, which runs a callback every time the property changes:

```kotlin-runnable
import kotlin.properties.Delegates

class User {
    var name: String by Delegates.observable("Unnamed") { _, old, new ->
        println("name changed from '$old' to '$new'")
    }
}

fun main() {
    val user = User()
    user.name = "Ada"
    user.name = "Grace"
}
```

### Writing your own delegate

A delegated property just needs an object with `getValue` (and `setValue`
for a `var`) functions matching a specific signature. Here's a minimal
custom delegate that trims strings on write:

```kotlin-runnable
import kotlin.reflect.KProperty

class TrimmingDelegate {
    private var value: String = ""

    operator fun getValue(thisRef: Any?, property: KProperty<*>): String {
        return value
    }

    operator fun setValue(thisRef: Any?, property: KProperty<*>, newValue: String) {
        value = newValue.trim()
    }
}

class Form {
    var username: String by TrimmingDelegate()
}

fun main() {
    val form = Form()
    form.username = "  ada_lovelace  "
    println("[${form.username}]")
}
```

`thisRef` is the object the property lives on (`Form`, here) and `property`
gives you reflective metadata like the property's name — both are commonly
ignored, as above, but are there if you need them. Once a class has
`getValue`/`setValue` operators with the right shape, `by SomeDelegate()`
works on any property, and this is exactly how `lazy` and `observable`
themselves are implemented under the hood — there's no special compiler
magic beyond the `by` keyword recognizing that shape.

## Two different `by` clauses, one keyword

Worth being explicit about the distinction, since both use the same
keyword:

- `class Car(...) : SoundMaker by horn` — **interface delegation**. An
  entire class forwards an interface's members to another object.
- `var username: String by TrimmingDelegate()` — **property delegation**. A
  single property's accessors are handled by a helper object.

Different mechanisms, same underlying idea: don't write forwarding
boilerplate by hand when you can name the object doing the real work and
let Kotlin generate the plumbing.

## Tasks

### Task 1: Delegating an interface

Define `interface Repository { fun findById(id: Int): String }`, a class
`InMemoryRepository : Repository` that returns `"Item #$id"` from
`findById`, and a class `CachingRepository(private val inner: Repository) :
Repository by inner` that overrides `findById` to print `"Cache miss for
$id"` before delegating to `inner.findById(id)`.

```kotlin-runnable
// Your code here

fun main() {

}
```

::: details Solution
```kotlin
interface Repository {
    fun findById(id: Int): String
}

class InMemoryRepository : Repository {
    override fun findById(id: Int): String = "Item #$id"
}

class CachingRepository(private val inner: Repository) : Repository by inner {
    override fun findById(id: Int): String {
        println("Cache miss for $id")
        return inner.findById(id)
    }
}

fun main() {
    val repo: Repository = CachingRepository(InMemoryRepository())
    println(repo.findById(42))
}
```
:::

### Task 2: `by lazy` in practice

Define `class ExpensiveResource` whose `init` block prints `"Loading
resource..."`. Define `class Service` with a property `val resource:
ExpensiveResource by lazy { ExpensiveResource() }`. Show, by printing
messages before and after accessing `resource` twice, that the loading
message only appears once, and only after the first access.

::: details Solution
```kotlin
class ExpensiveResource {
    init {
        println("Loading resource...")
    }
}

class Service {
    val resource: ExpensiveResource by lazy { ExpensiveResource() }
}

fun main() {
    val service = Service()
    println("Service created, resource not loaded yet")
    service.resource
    println("First access done")
    service.resource
    println("Second access done, no reload happened")
}
```
:::

Next: [Higher-Order Functions](/functional/higher-order-functions)
