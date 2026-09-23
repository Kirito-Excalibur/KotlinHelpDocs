import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'The Modern Kotlin Tutorial',
  description: 'A friendly, example-driven guide to Kotlin — with runnable code and practice tasks.',
  lang: 'en-US',
  cleanUrls: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
  ],

  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
    config(md) {
      const defaultFence = md.renderer.rules.fence!.bind(md.renderer.rules)
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        const lang = token.info.trim().split(/\s+/)[0]
        if (lang === 'kotlin-runnable' || lang === 'kotlin-run') {
          const code = md.utils.escapeHtml(token.content.replace(/\n$/, ''))
          return `<div class="kotlin-playground-wrapper"><pre class="kotlin-playground" data-target-platform="jvm">${code}</pre></div>\n`
        }
        return defaultFence(tokens, idx, options, env, self)
      }
    },
  },

  themeConfig: {
    logo: '/favicon.svg',
    nav: [
      { text: 'Tutorial', link: '/getting-started/', activeMatch: '/getting-started/|/basics/' },
      { text: 'OOP', link: '/oop/classes-and-instances' },
      { text: 'Functional', link: '/functional/higher-order-functions' },
      { text: 'Collections', link: '/collections/overview' },
      { text: 'Coroutines', link: '/coroutines/introduction' },
      { text: 'Appendix', link: '/appendix/idioms' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        collapsed: false,
        items: [
          { text: 'Welcome', link: '/getting-started/' },
          { text: 'Installing Kotlin', link: '/getting-started/installing-kotlin' },
          { text: 'Hello, World!', link: '/getting-started/hello-world' },
        ],
      },
      {
        text: 'The Basics',
        collapsed: false,
        items: [
          { text: 'Variables', link: '/basics/variables' },
          { text: 'Basic Types', link: '/basics/basic-types' },
          { text: 'Strings', link: '/basics/strings' },
          { text: 'Operators', link: '/basics/operators' },
          { text: 'Conditions: if and when', link: '/basics/conditions' },
          { text: 'Loops', link: '/basics/loops' },
          { text: 'Functions', link: '/basics/functions' },
          { text: 'Lambdas: a first look', link: '/basics/lambdas-intro' },
          { text: 'Null Safety', link: '/basics/nullable-types' },
          { text: 'Arrays and Collections', link: '/basics/arrays-and-collections-intro' },
        ],
      },
      {
        text: 'Classes & Objects (OOP)',
        collapsed: true,
        items: [
          { text: 'Classes and Instances', link: '/oop/classes-and-instances' },
          { text: 'Properties and Fields', link: '/oop/properties-and-fields' },
          { text: 'Constructors', link: '/oop/constructors' },
          { text: 'Inheritance', link: '/oop/inheritance' },
          { text: 'Visibility Modifiers', link: '/oop/visibility-modifiers' },
          { text: 'Interfaces', link: '/oop/interfaces' },
          { text: 'Abstract Classes', link: '/oop/abstract-classes' },
          { text: 'Data Classes', link: '/oop/data-classes' },
          { text: 'Sealed Classes', link: '/oop/sealed-classes' },
          { text: 'Enum Classes', link: '/oop/enum-classes' },
          { text: 'Object Expressions & Declarations', link: '/oop/object-expressions-and-declarations' },
          { text: 'Extension Functions', link: '/oop/extension-functions' },
          { text: 'Generics', link: '/oop/generics' },
          { text: 'Nested & Inner Classes', link: '/oop/nested-and-inner-classes' },
          { text: 'Delegation', link: '/oop/delegation' },
        ],
      },
      {
        text: 'Functional Programming',
        collapsed: true,
        items: [
          { text: 'Higher-Order Functions', link: '/functional/higher-order-functions' },
          { text: 'Lambda Syntax In Depth', link: '/functional/lambda-syntax-in-depth' },
          { text: 'Inline Functions', link: '/functional/inline-functions' },
          { text: 'Operator Overloading', link: '/functional/operator-overloading' },
          { text: 'Equality', link: '/functional/equality' },
        ],
      },
      {
        text: 'Collections',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/collections/overview' },
          { text: 'Lists', link: '/collections/lists' },
          { text: 'Sets', link: '/collections/sets' },
          { text: 'Maps', link: '/collections/maps' },
          { text: 'Sequences', link: '/collections/sequences' },
          { text: 'Filtering & Mapping', link: '/collections/filtering-and-mapping' },
          { text: 'Aggregate Operations', link: '/collections/aggregate-operations' },
          { text: 'Ranges and Progressions', link: '/collections/ranges-and-progressions' },
        ],
      },
      {
        text: 'Error Handling',
        collapsed: true,
        items: [
          { text: 'Exceptions', link: '/error-handling/exceptions' },
          { text: 'Nullability In Depth', link: '/error-handling/nullability-in-depth' },
        ],
      },
      {
        text: 'Coroutines',
        collapsed: true,
        items: [
          { text: 'Introduction', link: '/coroutines/introduction' },
          { text: 'Basics', link: '/coroutines/basics' },
          { text: 'Cancellation & Timeouts', link: '/coroutines/cancellation-and-timeouts' },
          { text: 'Dispatchers & Context', link: '/coroutines/dispatchers-and-context' },
          { text: 'Exception Handling', link: '/coroutines/exception-handling' },
          { text: 'Flow', link: '/coroutines/flow' },
          { text: 'Channels', link: '/coroutines/channels' },
        ],
      },
      {
        text: 'Kotlin Multiplatform',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/multiplatform/overview' },
        ],
      },
      {
        text: 'Appendix',
        collapsed: true,
        items: [
          { text: 'Kotlin Idioms', link: '/appendix/idioms' },
          { text: 'Coding Conventions', link: '/appendix/coding-conventions' },
          { text: 'Further Reading', link: '/appendix/further-reading' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/JetBrains/kotlin' },
    ],

    search: { provider: 'local' },

    footer: {
      message: 'An independent, community-style tutorial inspired by javascript.info. Not affiliated with JetBrains.',
      copyright: 'Content licensed for personal learning use',
    },

    outline: { level: [2, 3], label: 'On this page' },
  },
})
