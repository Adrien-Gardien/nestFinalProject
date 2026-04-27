<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'

const router = useRouter()

const step = ref(1)
const isLoading = ref(false)
const error = ref('')
const info = ref('')

const form = reactive({ displayName: '', email: '', password: '' })
const verifyForm = reactive({ email: '', code: '' })

async function handleRegister() {
  error.value = ''
  isLoading.value = true
  try {
    const res = await api('/auth/register', 'POST', form)
    verifyForm.email = form.email
    info.value = `${res.message} Vérifiez Mailpit sur http://localhost:8025.`
    step.value = 2
  } catch (e) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}

async function handleVerify() {
  error.value = ''
  isLoading.value = true
  try {
    await api('/auth/verify-email', 'POST', verifyForm)
    router.push('/login')
  } catch (e) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">
        <RouterLink to="/"><span class="brand-icon">▶</span> CineList</RouterLink>
      </div>

      <template v-if="step === 1">
        <h1>Créer un compte</h1>
        <p class="auth-sub">Rejoignez CineList et commencez votre watchlist.</p>

        <p v-if="error" class="message message-error">{{ error }}</p>

        <div class="form-stack">
          <label>
            Pseudo
            <input v-model="form.displayName" placeholder="MonPseudo" />
          </label>
          <label>
            Email
            <input v-model="form.email" type="email" placeholder="vous@exemple.com" />
          </label>
          <label>
            Mot de passe
            <input
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              @keyup.enter="handleRegister"
            />
          </label>
          <button :disabled="isLoading" @click="handleRegister">
            {{ isLoading ? 'Création…' : 'Créer mon compte' }}
          </button>
        </div>

        <p class="auth-footer">
          Déjà inscrit ?
          <RouterLink to="/login">Se connecter</RouterLink>
        </p>
      </template>

      <template v-else>
        <h1>Vérifiez votre email</h1>
        <p class="auth-sub">{{ info }}</p>

        <p v-if="error" class="message message-error">{{ error }}</p>

        <div class="form-stack">
          <label>
            Email
            <input v-model="verifyForm.email" type="email" placeholder="vous@exemple.com" />
          </label>
          <label>
            Code de vérification
            <input
              v-model="verifyForm.code"
              placeholder="000000"
              maxlength="6"
              class="code-input"
              @keyup.enter="handleVerify"
            />
          </label>
          <button :disabled="isLoading" @click="handleVerify">
            {{ isLoading ? 'Vérification…' : 'Valider mon email' }}
          </button>
        </div>

        <p class="auth-footer">
          <button class="link-btn" @click="step = 1">← Retour</button>
        </p>
      </template>
    </div>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5rem 1rem 2rem;
}

.auth-card {
  width: 100%;
  max-width: 380px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 2rem;
}

.auth-brand {
  text-align: center;
  margin-bottom: 1.5rem;
}

.auth-brand a {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--green);
  text-decoration: none;
}

.brand-icon {
  color: var(--orange);
}

h1 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  margin: 0 0 0.25rem;
  text-align: center;
}

.auth-sub {
  color: var(--muted);
  text-align: center;
  margin: 0 0 1.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.875rem;
  color: var(--muted);
}

label input {
  margin: 0;
}

button {
  width: 100%;
  padding: 0.7rem;
  font-size: 0.95rem;
}

.code-input {
  font-size: 1.4rem;
  letter-spacing: 0.35em;
  text-align: center;
}

.auth-footer {
  margin: 1.25rem 0 0;
  text-align: center;
  color: var(--muted);
  font-size: 0.875rem;
}

.auth-footer a {
  color: var(--green);
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}

.link-btn {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0;
  width: auto;
  font-weight: normal;
}

.link-btn:hover {
  color: var(--text);
  background: none;
}
</style>
