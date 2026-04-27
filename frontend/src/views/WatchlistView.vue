<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { api } from '../api'

const auth = useAuthStore()

const watchlist = ref([])
const stats = ref(null)
const isLoading = ref(false)
const error = ref('')
const info = ref('')
const filter = ref('all')

const filters = [
  { value: 'all', label: 'Tous' },
  { value: 'unwatched', label: 'À voir' },
  { value: 'watched', label: 'Vus' },
]

function posterUrl(path) {
  if (!path) return null
  return `https://image.tmdb.org/t/p/w342${path}`
}

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

    <RouterLink to="/movies" class="browse-cta">
      + Parcourir le catalogue pour ajouter un film
    </RouterLink>

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

    <div v-if="filteredMovies.length > 0" class="movie-grid">
      <article
        v-for="movie in filteredMovies"
        :key="movie.id"
        class="movie-card"
        :class="{ watched: movie.watched }"
      >
        <component
          :is="movie.tmdbId ? 'router-link' : 'div'"
          :to="movie.tmdbId ? { name: 'movie-detail', params: { id: movie.tmdbId } } : undefined"
          class="poster-wrap"
        >
          <img
            v-if="posterUrl(movie.posterPath)"
            :src="posterUrl(movie.posterPath)"
            :alt="movie.title"
            class="poster"
            loading="lazy"
          />
          <div v-else class="poster poster-placeholder">
            <span>{{ movie.title[0]?.toUpperCase() }}</span>
          </div>

          <span v-if="movie.watched" class="watched-badge">✓ Vu</span>

          <div class="card-overlay">
            <button
              class="overlay-btn"
              :title="movie.watched ? 'Marquer comme non vu' : 'Marquer comme vu'"
              :disabled="isLoading"
              @click.prevent="toggleWatched(movie)"
            >
              {{ movie.watched ? '↺' : '✓' }}
            </button>
            <button
              class="overlay-btn overlay-btn-danger"
              title="Retirer de la watchlist"
              :disabled="isLoading"
              @click.prevent="removeMovie(movie)"
            >
              ✕
            </button>
          </div>
        </component>
        <div class="card-info">
          <p class="card-title" :class="{ 'title-watched': movie.watched }">{{ movie.title }}</p>
          <p class="card-year">{{ movie.year || '—' }}</p>
        </div>
      </article>
    </div>
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

.browse-cta {
  display: block;
  text-align: center;
  background: rgba(67, 212, 119, 0.12);
  border: 1px dashed rgba(67, 212, 119, 0.4);
  color: var(--green);
  padding: 0.65rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 1.25rem;
  transition: background 0.15s;
}

.browse-cta:hover {
  background: rgba(67, 212, 119, 0.2);
}

.filter-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
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

/* Grille (alignée sur MoviesView) */
.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.movie-card {
  transition: transform 0.15s;
}

.movie-card:hover {
  transform: translateY(-3px);
}

.poster-wrap {
  position: relative;
  display: block;
  aspect-ratio: 2 / 3;
  border-radius: 10px;
  overflow: hidden;
  background: #0d1e28;
  border: 1px solid rgba(145, 172, 170, 0.15);
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: opacity 0.2s, filter 0.2s;
}

.movie-card.watched .poster {
  filter: grayscale(0.4);
  opacity: 0.7;
}

.poster-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(155deg, #1a3040, #0d2030);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 2.5rem;
  color: var(--muted);
}

.watched-badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background: rgba(67, 212, 119, 0.92);
  color: #04220f;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.18rem 0.5rem;
  border-radius: 6px;
  letter-spacing: 0.04em;
  backdrop-filter: blur(4px);
}

/* Overlay actions: visible au hover (et toujours sur tactile) */
.card-overlay {
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  justify-content: flex-end;
  gap: 0.4rem;
  padding: 0.5rem;
  background: linear-gradient(180deg, transparent, rgba(7, 18, 26, 0.88));
  opacity: 0;
  transition: opacity 0.15s;
}

.poster-wrap:hover .card-overlay,
.poster-wrap:focus-within .card-overlay {
  opacity: 1;
}

.overlay-btn {
  background: rgba(13, 26, 31, 0.92);
  border: 1px solid rgba(145, 172, 170, 0.4);
  color: var(--text);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-weight: 600;
  transition: all 0.15s;
}

.overlay-btn:hover:not(:disabled) {
  background: var(--green);
  color: #04220f;
  border-color: var(--green);
}

.overlay-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.overlay-btn-danger:hover:not(:disabled) {
  background: rgba(220, 100, 100, 0.9);
  border-color: rgba(220, 100, 100, 0.9);
  color: #fff;
}

.card-info {
  padding: 0.5rem 0.15rem 0;
}

.card-title {
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0 0 0.15rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.3;
}

.title-watched {
  color: var(--muted);
}

.card-year {
  font-size: 0.75rem;
  color: var(--muted);
  margin: 0;
}

@media (max-width: 700px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 500px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  /* Sur mobile l'overlay reste visible */
  .card-overlay {
    opacity: 1;
    background: linear-gradient(180deg, transparent 40%, rgba(7, 18, 26, 0.85));
  }
}
</style>
