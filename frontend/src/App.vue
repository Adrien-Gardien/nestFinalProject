<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import NavBar from './components/NavBar.vue'

const auth = useAuthStore()

onMounted(async () => {
  if (auth.token) {
    try {
      await auth.loadUser()
    } catch {
      auth.logout()
    }
  }
})
</script>

<template>
  <NavBar />
  <RouterView />
</template>
