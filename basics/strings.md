# Strings

`String` in Kotlin is backed by the same UTF-16 character sequence as Java's
`String`, but the syntax around it is considerably nicer, especially for
building strings out of variables.

```kotlin-runnable
fun main() {
    val greeting: String = "Hello, Kotlin!"
    println(greeting)
    println(greeting.length)
    println(greeting[0])          // indexing returns a Char
}
```

## String templates

Instead of concatenating with `+`, embed expressions directly in a string
with `$name` or `${expression}`.

```kotlin-runnable
fun main() {
    val name = "Ada"
    val age = 36

    println("$name is $age years old")
    println("Next year, $name will be ${age + 1}")
    println("Uppercase name: ${name.uppercase()}")
}
```

`$name` works for a simple variable reference. Anything more complex — a
function call, an arithmetic expression, a property access chain — needs the
`${...}` form. To print a literal `$` or `{`, escape it: `"\$5.00"`.

```kotlin-runnable
fun main() {
    val price = 5
    println("It costs \$$price")
}
```

## Raw strings

Triple-quoted strings (`"""..."""`) are raw: no escape sequences are
processed, so backslashes and quotes inside them are literal. They're ideal
for regular expressions, file paths, and multi-line text.

```kotlin-runnable
fun main() {
    val regexPattern = """\d{3}-\d{4}"""
    val path = """C:\Users\Ada\file.txt"""

    println(regexPattern)
    println(path)
}
```

Template interpolation (`$` and `${}`) still works inside raw strings, since
that's a separate mechanism from escape processing.

For multi-line text, raw strings preserve every line break and leading
space exactly as written, which usually isn't what you want when the string
literal itself is indented to match your code:

```kotlin-runnable
fun main() {
    val message = """
        |Dear Ada,
        |Thanks for signing up.
        |— The Team
    """.trimMargin()

    println(message)
}
```

`trimMargin()` strips everything up to and including a leading marker
character on each line (`|` by default; pass a different one as an argument
if you need `|` itself in the text). If every line is already flush without
a marker and you just want the common leading whitespace stripped,
`trimIndent()` does that automatically:

```kotlin-runnable
fun main() {
    val message = """
        Dear Ada,
        Thanks for signing up.
    """.trimIndent()

    println(message)
}
```

## Common string operations

Most of the `String` API will feel familiar if you've used any other
mainstream language's string type.

```kotlin-runnable
fun main() {
    val text = "  Kotlin is fun  "

    println(text.trim())                     // "Kotlin is fun"
    println(text.trim().uppercase())
    println(text.trim().replace("fun", "great"))
    println(text.trim().split(" "))          // List<String>
    println("Kotlin".substring(0, 3))        // "Kot"
    println("Kotlin".startsWith("Kot"))
    println("Kotlin".contains("otl"))
    println("a,b,,c".split(","))             // keeps empty entries
}
```

`split` returns a `List<String>`; you'll cover lists properly in
[Arrays and Collections](/basics/arrays-and-collections-intro). Strings are
also directly iterable as a sequence of `Char`:

```kotlin-runnable
fun main() {
    for (c in "abc") {
        print(c.uppercaseChar())
    }
    println()
}
```

## String comparison

`==` on strings checks *structural* equality — whether the two strings
contain the same characters — not reference identity. This is the opposite
of Java, where `==` on `String` compares references and you're supposed to
call `.equals()` for content comparison.

```kotlin-runnable
fun main() {
    val a = "kotlin"
    val b = "kot" + "lin"

    println(a == b)          // true: same content
    println(a === b)         // may be true or false: reference identity
}
```

`==` on any Kotlin type calls `equals()` under the hood (with a null check
built in), so strings, data classes, and anything else with a sensible
`equals()` implementation just compare correctly by default. `===` checks
whether two references point to the exact same object — you'll rarely need
it for strings. Both operators get the full treatment in
[Operators](/basics/operators) and [Equality](/functional/equality).

## Tasks

### Task 1: Build a summary with templates

Given a `name: String`, `score: Int`, and `total: Int`, print
`"<name> scored <score>/<total> (<percentage>%)"` where percentage is
computed inline in the template as a whole number.

```kotlin-runnable
fun main() {
    val name = "Grace"
    val score = 42
    val total = 50
    // Your code here
}
```

::: details Solution
```kotlin
fun main() {
    val name = "Grace"
    val score = 42
    val total = 50

    println("$name scored $score/$total (${score * 100 / total}%)")
}
```
`score * 100 / total` is computed before dividing to avoid truncating to `0`
from integer division — multiply first, divide second.
:::

### Task 2: Clean up user input

Write a function `normalize(input: String): String` that trims whitespace
from both ends and converts the result to lowercase. Test it on
`"  Kotlin ROCKS  "`.

::: details Solution
```kotlin
fun normalize(input: String): String {
    return input.trim().lowercase()
}

fun main() {
    println(normalize("  Kotlin ROCKS  "))
}
```
:::

### Task 3: Multi-line raw string

Use a triple-quoted string with `trimMargin()` to build a 3-line receipt:
"Item: Coffee", "Price: $4.50", "Thank you!" — each on its own line, printed
with a single `println`.

::: details Solution
```kotlin
fun main() {
    val receipt = """
        |Item: Coffee
        |Price: ${'$'}4.50
        |Thank you!
    """.trimMargin()

    println(receipt)
}
```
Inside a raw string, `$` still starts a template, so a literal dollar sign
needs `${'$'}` (escaping with backslash doesn't work in raw strings, since
raw strings don't process escape sequences at all).
:::

Next: [Operators](/basics/operators)
