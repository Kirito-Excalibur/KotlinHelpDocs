<script setup>
import DefaultTheme from 'vitepress/theme'
import { useRoute } from 'vitepress'
import { watch, onMounted, nextTick } from 'vue'

const route = useRoute()

function loadPlaygroundScript() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve()
    if (window.KotlinPlayground) return resolve()
    const existing = document.getElementById('kotlin-playground-script')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      return
    }
    const script = document.createElement('script')
    script.id = 'kotlin-playground-script'
    script.src = 'https://unpkg.com/kotlin-playground@1'
    script.async = true
    script.onload = () => resolve()
    document.head.appendChild(script)
  })
}

async function initPlaygrounds() {
  if (typeof window === 'undefined') return
  await nextTick()
  if (!document.querySelector('.kotlin-playground')) return
  await loadPlaygroundScript()
  if (window.KotlinPlayground) {
    window.KotlinPlayground('.kotlin-playground')
  }
}

onMounted(initPlaygrounds)
watch(() => route.path, initPlaygrounds)
</script>

<template>
  <DefaultTheme.Layout />
</template>
