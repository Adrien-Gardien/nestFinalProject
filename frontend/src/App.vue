<script setup>
import { onMounted, reactive, ref } from 'vue'

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const infoMessage = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const sessionToken = ref('')

const accessToken = ref(localStorage.getItem('watchlist_token') ?? '')
const currentUser = ref(null)
const watchlist = ref([])

const registerForm = reactive({
  email: '',
  displayName: '',
  password: '',
})

const verifyEmailForm = reactive({
  email: '',
  code: '',
})

const loginForm = reactive({
  email: '',
  password: '',
})

const twoFactorForm = reactive({
  email: '',
  code: '',
})

const movieForm = reactive({
  title: '',
  year: new Date().getFullYear(),
})

const clearMessages = () => {
  infoMessage.value = ''
  errorMessage.value = ''
}

const asMessage = (value) => {
  if (Array.isArray(value)) {
    return value.join(', ')
  }

  if (typeof value === 'string') {
    return value
  }

  return 'Erreur inconnue'
}

const api = async (path, method = 'GET', body = null, withAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (withAuth && accessToken.value) {
    headers.Authorization = `Bearer ${accessToken.value}`
  }

  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(asMessage(data.message))
  }

  return data
}

const register = async () => {
  clearMessages()
  isLoading.value = true

  try {
    const result = await api('/auth/register', 'POST', registerForm)
    infoMessage.value = `${result.message}. Ouvre Mailpit sur http://localhost:8025.`
    verifyEmailForm.email = registerForm.email
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

const verifyEmail = async () => {
  clearMessages()
  isLoading.value = true

  try {
    const result = await api('/auth/verify-email', 'POST', verifyEmailForm)
    infoMessage.value = result.message
    loginForm.email = verifyEmailForm.email
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

const login = async () => {
  clearMessages()
  isLoading.value = true

  try {
    const result = await api('/auth/login', 'POST', loginForm)
    sessionToken.value = result.sessionToken
    twoFactorForm.email = loginForm.email
    infoMessage.value = `${result.message}. Le code est dans Mailpit (http://localhost:8025).`
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

const verifyTwoFactor = async () => {
  clearMessages()
  isLoading.value = true

  try {
    const result = await api('/auth/verify-2fa', 'POST', {
      email: twoFactorForm.email,
      code: twoFactorForm.code,
      sessionToken: sessionToken.value,
    })

    accessToken.value = result.accessToken
    localStorage.setItem('watchlist_token', result.accessToken)
    sessionToken.value = ''

    await loadPrivateData()
    infoMessage.value = 'Connexion complete, bienvenue sur ta watchlist'
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

const loadPrivateData = async () => {
  const [me, mine] = await Promise.all([
    api('/auth/me', 'GET', null, true),
    api('/watchlist/me', 'GET', null, true),
  ])

  currentUser.value = me
  watchlist.value = mine
}

const addMovie = async () => {
  clearMessages()
  isLoading.value = true

  try {
    await api('/watchlist/me', 'POST', movieForm, true)
    await loadPrivateData()
    infoMessage.value = 'Film ajouté'
    movieForm.title = ''
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

const logout = () => {
  accessToken.value = ''
  currentUser.value = null
  watchlist.value = []
  sessionToken.value = ''
  localStorage.removeItem('watchlist_token')
  clearMessages()
}

onMounted(async () => {
  if (!accessToken.value) {
    return
  }

  try {
    await loadPrivateData()
  } catch {
    logout()
  }
})
</script>

<template>
  <main class="page">
    <section class="hero">
      <p class="eyebrow">Mini Letterbox Clone</p>
      <h1>Watchlist pour tes films déja vus</h1>
      <p class="subtitle">
        Inscription + vérification email + login 2FA par email. Version simple et efficace.
      </p>
    </section>

    <p v-if="infoMessage" class="message message-info">{{ infoMessage }}</p>
    <p v-if="errorMessage" class="message message-error">{{ errorMessage }}</p>

    <section class="grid">
      <article class="card">
        <h2>1) Inscriprion</h2>
        <div class="stack">
          <input v-model="registerForm.displayName" placeholder="Pseudo" />
          <input v-model="registerForm.email" type="email" placeholder="Email" />
          <input v-model="registerForm.password" type="password" placeholder="Mot de passe" />
          <button :disabled="isLoading" @click="register">Créer mon compte</button>
        </div>
      </article>

      <article class="card">
        <h2>2) Verification email</h2>
        <div class="stack">
          <input v-model="verifyEmailForm.email" type="email" placeholder="Email" />
          <input v-model="verifyEmailForm.code" placeholder="Code reçu par email" />
          <button :disabled="isLoading" @click="verifyEmail">Valider mon email</button>
        </div>
      </article>

      <article class="card">
        <h2>3) Login</h2>
        <div class="stack">
          <input v-model="loginForm.email" type="email" placeholder="Email" />
          <input v-model="loginForm.password" type="password" placeholder="Mot de passe" />
          <button :disabled="isLoading" @click="login">Se connecter</button>
        </div>
      </article>

      <article class="card">
        <h2>4) Validation 2FA</h2>
        <div class="stack">
          <input v-model="twoFactorForm.email" type="email" placeholder="Email" />
          <input v-model="twoFactorForm.code" placeholder="Code 2FA" />
          <button :disabled="isLoading || !sessionToken" @click="verifyTwoFactor">
            Valider le code
          </button>
        </div>
      </article>
    </section>

    <section v-if="currentUser" class="watchlist">
      <div class="watchlist-head">
        <div>
          <h2>{{ currentUser.displayName }}</h2>
          <p>{{ currentUser.email }} • role: {{ currentUser.role }}</p>
        </div>
        <button class="logout" @click="logout">Déconnexion</button>
      </div>

      <div class="add-movie">
        <input v-model="movieForm.title" placeholder="Titre du film" />
        <input v-model.number="movieForm.year" type="number" min="1900" max="2100" />
        <button :disabled="isLoading" @click="addMovie">Ajouter</button>
      </div>

      <ul v-if="watchlist.length > 0" class="movie-list">
        <li v-for="movie in watchlist" :key="movie.id">
          <strong>{{ movie.title }}</strong>
          <span>{{ movie.year }}</span>
        </li>
      </ul>
      <p v-else class="empty">Pas encore de film dans ta watchlist.</p>
    </section>
  </main>
</template>
