<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { api } from '../api'

const auth = useAuthStore()

const watchlist = ref([])
const stats = ref(null)
const isLoading = ref(false)
const error = ref('')
const info = ref('')
const filter = ref('all')

const movieForm = reactive({ title: '', year: new Date().getFullYear() })

const filters = [
  { value: 'all', label: 'Tous' },
  { value: 'unwatched', label: 'À voir' },
  { value: 'watched', label: 'Vus' },
]

const filteredMovies = computed(() => {
  if (filter.value === 'watched') return watchlist.value.filter((m) => m.watched)
  if (filter.value === 'unwatched') return watchlist.value.filter((m) => !m.watched)
  return watchlist.value
})

function clearMessages() {
  error.value = ''
  info.value = ''
}

async function load() {
  const [mine, myStats] = await Promise.all([
    api('/watchlist/me', 'GET', null, auth.token),
    api('/watchlist/me/stats', 'GET', null, auth.token),
  ])
  watchlist.value = mine
  stats.value = myStats
}

async function addMovie() {
  clearMessages()
  if (!movieForm.title.trim()) return
  isLoading.value = true
  try {
    await api('/watchlist/me', 'POST', movieForm, auth.token)
    movieForm.title = ''
    info.value = 'Film ajouté'
    await load()
  } catch (e) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}

async function toggleWatched(movie) {
  clearMessages()
  isLoading.value = true
  try {
    await api(`/watchlist/me/${movie.id}`, 'PATCH', { watched: !movie.watched }, auth.token)
    await load()
  } catch (e) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}

async function removeMovie(movie) {
  clearMessages()
  isLoading.value = true
  try {
    await api(`/watchlist/me/${movie.id}`, 'DELETE', null, auth.token)
    info.value = 'Film supprimé'
    await load()
  } catch (e) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}

onMounted(load)
</script>

<template>
  <main class="page">
    <div class="wl-header">
      <div class="wl-user">
        <div class="user-avatar">{{ auth.user?.displayName?.[0]?.toUpperCase() ?? '?' }}</div>
        <div>
          <h1>{{ auth.user?.displayName ?? '…' }}</h1>
          <p class="user-email">{{ auth.user?.email }}</p>
        </div>
      </div>
    </div>

    <div v-if="stats" class="stats">
      <div class="stat-box">
        <span class="stat-value">{{ stats.total }}</span>
        <span class="stat-label">Films</span>
      </div>
      <div class="stat-box">
        <span class="stat-value">{{ stats.watched }}</span>
        <span class="stat-label">Vus</span>
      </div>
      <div class="stat-box">
        <span class="stat-value">{{ stats.unwatched }}</span>
        <span class="stat-label">À voir</span>
      </div>
      <div class="stat-box">
        <span class="stat-value">{{ stats.mostWatchedYear ?? '—' }}</span>
        <span class="stat-label">Année fav.</span>
      </div>
    </div>

    <p v-if="info" class="message message-info">{{ info }}</p>
    <p v-if="error" class="message message-error">{{ error }}</p>

    <div class="add-movie">
      <input v-model="movieForm.title" placeholder="Titre du film" @keyup.enter="addMovie" />
      <input v-model.number="movieForm.year" type="number" min="1900" max="2100" />
      <button :disabled="isLoading" @click="addMovie">+ Ajouter</button>
    </div>

    <div class="filter-bar">
      <button
        v-for="f in filters"
        :key="f.value"
        :class="['filter-btn', { active: filter === f.value }]"
        @click="filter = f.value"
      >
        {{ f.label }}
      </button>
    </div>

    <ul v-if="filteredMovies.length > 0" class="movie-list">
      <li v-for="movie in filteredMovies" :key="movie.id">
        <div class="movie-poster" :class="{ watched: movie.watched }">
          {{ movie.title[0]?.toUpperCase() }}
        </div>
        <div class="movie-info">
          <strong :class="{ 'title-watched': movie.watched }">{{ movie.title }}</strong>
          <span class="movie-year">{{ movie.year }}</span>
        </div>
        <div class="movie-actions">
          <label class="watched-toggle">
            <input
              type="checkbox"
              :checked="movie.watched"
              :disabled="isLoading"
              @change="toggleWatched(movie)"
            />
            Vu
          </label>
          <button class="btn-delete" :disabled="isLoading" @click="removeMovie(movie)">✕</button>
        </div>
      </li>
    </ul>
    <p v-else class="empty">Aucun film dans cette catégorie.</p>
  </main>
</template>

<style scoped>
.wl-header {
  padding: 1rem 0 1.25rem;
}

.wl-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--green), #1a8a45);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.2rem;
  color: #04220f;
  flex-shrink: 0;
}

.wl-user h1 {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.4rem;
}

.user-email {
  margin: 0.15rem 0 0;
  color: var(--muted);
  font-size: 0.85rem;
}

/* Stats override — vertical layout */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.stat-box {
  background: rgba(13, 26, 31, 0.88);
  border: 1px solid rgba(145, 172, 170, 0.2);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.stat-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text);
}

.stat-label {
  color: var(--muted);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.filter-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.filter-btn {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--muted);
  padding: 0.3rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s;
  width: auto;
  font-weight: 500;
}

.filter-btn:hover {
  background: rgba(133, 169, 168, 0.1);
  color: var(--text);
}

.filter-btn.active {
  background: var(--green);
  border-color: var(--green);
  color: #04220f;
  font-weight: 600;
}

.movie-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.movie-list li {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  background: rgba(13, 26, 31, 0.88);
  border: 1px solid rgba(145, 172, 170, 0.15);
  border-radius: 12px;
  padding: 0.7rem 0.9rem;
  transition: border-color 0.15s;
}

.movie-list li:hover {
  border-color: rgba(145, 172, 170, 0.3);
}

.movie-poster {
  width: 38px;
  height: 54px;
  border-radius: 5px;
  background: linear-gradient(155deg, #1a3040, #0d2030);
  border: 1px solid rgba(145, 172, 170, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: var(--muted);
  flex-shrink: 0;
}

.movie-poster.watched {
  background: linear-gradient(155deg, #143828, #0d2820);
  color: var(--green);
}

.movie-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.movie-info strong {
  font-size: 0.93rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title-watched {
  color: var(--muted);
  text-decoration: line-through;
}

.movie-year {
  color: var(--muted);
  font-size: 0.8rem;
}

.movie-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.watched-toggle {
  display: flex;
  gap: 0.35rem;
  align-items: center;
  color: var(--muted);
  font-size: 0.85rem;
  cursor: pointer;
  user-select: none;
}

.btn-delete {
  background: transparent;
  border: 1px solid rgba(220, 100, 100, 0.3);
  color: rgba(220, 100, 100, 0.65);
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  font-size: 0.78rem;
  cursor: pointer;
  width: auto;
  font-weight: normal;
  line-height: 1;
  transition: all 0.15s;
}

.btn-delete:hover:not(:disabled) {
  background: rgba(220, 100, 100, 0.1);
  color: #e88;
  border-color: rgba(220, 100, 100, 0.5);
}

@media (max-width: 700px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
