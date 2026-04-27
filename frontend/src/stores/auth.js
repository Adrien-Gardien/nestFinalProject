import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('watchlist_token') ?? '')
  const user = ref(null)

  function setToken(t) {
    token.value = t
    localStorage.setItem('watchlist_token', t)
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('watchlist_token')
  }

  async function loadUser() {
    user.value = await api('/auth/me', 'GET', null, token.value)
  }

  return { token, user, setToken, logout, loadUser }
})
