<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const movie = ref(null)
const isLoading = ref(false)
const error = ref('')

const inWatchlist = ref(false)
const isAdding = ref(false)
const addError = ref('')
const addInfo = ref('')

async function load(id) {
  error.value = ''
  movie.value = null
  inWatchlist.value = false
  addError.value = ''
  addInfo.value = ''
  isLoading.value = true
  try {
    movie.value = await api(`/movies/${id}`)
    if (auth.token) {
      const items = await api('/watchlist/me', 'GET', null, auth.token).catch(() => [])
      inWatchlist.value = items.some((i) => i.tmdbId === Number(id))
    }
  } catch (e) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}

async function addToWatchlist() {
  addError.value = ''
  addInfo.value = ''
  if (!auth.token) {
    router.push('/login')
    return
  }
  isAdding.value = true
  try {
    await api('/watchlist/me', 'POST', { tmdbId: movie.value.id }, auth.token)
    inWatchlist.value = true
    addInfo.value = 'Ajouté à ta watchlist ✓'
  } catch (e) {
    addError.value = e.message
  } finally {
    isAdding.value = false
  }
}

onMounted(() => load(route.params.id))
watch(() => route.params.id, (id) => { if (id) load(id) })

const posterUrl = computed(() => {
  if (!movie.value?.poster_path) return null
  return `https://image.tmdb.org/t/p/w500${movie.value.poster_path}`
})

const backdropUrl = computed(() => {
  if (!movie.value?.backdrop_path) return null
  return `https://image.tmdb.org/t/p/original${movie.value.backdrop_path}`
})

const year = computed(() => movie.value?.release_date?.slice(0, 4) ?? '—')
const rating = computed(() => movie.value?.vote_average ? movie.value.vote_average.toFixed(1) : '—')

function formatRuntime(min) {
  if (!min) return '—'
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? `${h}h ${m.toString().padStart(2, '0')}` : `${m} min`
}

function formatMoney(value) {
  if (!value) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}
</script>

<template>
  <main class="page detail">
    <button class="back-btn" @click="router.back()">← Retour</button>

    <p v-if="error" class="message message-error">{{ error }}</p>

    <div v-if="isLoading" class="loading-block">
      <div class="skeleton-poster" />
      <div class="skeleton-text" />
    </div>

    <article v-else-if="movie" class="movie-detail">
      <div
        class="backdrop"
        :style="backdropUrl ? `background-image: linear-gradient(180deg, rgba(7,18,26,0.55), rgba(7,18,26,0.95)), url('${backdropUrl}')` : null"
      />

      <div class="detail-grid">
        <div class="poster-col">
          <img v-if="posterUrl" :src="posterUrl" :alt="movie.title" class="poster" />
          <div v-else class="poster poster-placeholder">
            <span>{{ movie.title[0] }}</span>
          </div>
        </div>

        <div class="info-col">
          <h1 class="title">{{ movie.title }}</h1>
          <p v-if="movie.tagline" class="tagline">« {{ movie.tagline }} »</p>

          <div class="meta-row">
            <span class="meta-pill rating">★ {{ rating }}</span>
            <span class="meta-pill">{{ year }}</span>
            <span class="meta-pill">{{ formatRuntime(movie.runtime) }}</span>
            <span v-if="movie.status" class="meta-pill ghost">{{ movie.status }}</span>
          </div>

          <div v-if="movie.genres?.length" class="genres">
            <span v-for="g in movie.genres" :key="g.id" class="genre-chip">{{ g.name }}</span>
          </div>

          <div class="watchlist-action">
            <button
              class="btn-add"
              :disabled="isAdding || inWatchlist"
              @click="addToWatchlist"
            >
              <span v-if="inWatchlist">✓ Dans ta watchlist</span>
              <span v-else-if="isAdding">Ajout…</span>
              <span v-else>+ Ajouter à ma watchlist</span>
            </button>
            <p v-if="addInfo" class="message message-info">{{ addInfo }}</p>
            <p v-if="addError" class="message message-error">{{ addError }}</p>
          </div>

          <section v-if="movie.overview" class="overview">
            <h2>Synopsis</h2>
            <p>{{ movie.overview }}</p>
          </section>

          <section class="stats">
            <div class="stat">
              <span class="stat-label">Budget</span>
              <span class="stat-value">{{ formatMoney(movie.budget) }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Recettes</span>
              <span class="stat-value">{{ formatMoney(movie.revenue) }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Votes</span>
              <span class="stat-value">{{ movie.vote_count?.toLocaleString('fr-FR') ?? '—' }}</span>
            </div>
          </section>
        </div>
      </div>
    </article>
  </main>
</template>

<style scoped>
.detail {
  position: relative;
}

.back-btn {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--muted);
  padding: 0.4rem 0.9rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.85rem;
  width: auto;
  margin-bottom: 1rem;
  transition: all 0.15s;
}

.back-btn:hover {
  border-color: var(--green);
  color: var(--text);
}

.movie-detail {
  position: relative;
}

.backdrop {
  position: absolute;
  inset: 0 -2rem auto -2rem;
  height: 360px;
  background-size: cover;
  background-position: center top;
  border-radius: 0 0 16px 16px;
  z-index: 0;
  pointer-events: none;
}

.detail-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 1.75rem;
  padding-top: 140px;
}

.poster {
  width: 100%;
  border-radius: 12px;
  display: block;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(145, 172, 170, 0.2);
  aspect-ratio: 2 / 3;
  object-fit: cover;
}

.poster-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(155deg, #1a3040, #0d2030);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 4rem;
  color: var(--muted);
}

.title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2rem;
  margin: 0 0 0.4rem;
  line-height: 1.15;
}

.tagline {
  color: var(--muted);
  font-style: italic;
  margin: 0 0 1rem;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
}

.meta-pill {
  background: rgba(133, 169, 168, 0.15);
  border: 1px solid var(--line);
  color: var(--text);
  padding: 0.25rem 0.7rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.meta-pill.rating {
  background: rgba(67, 212, 119, 0.85);
  border-color: transparent;
  color: #04220f;
  font-weight: 700;
}

.meta-pill.ghost {
  background: transparent;
  color: var(--muted);
}

.genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}

.watchlist-action {
  margin-bottom: 1.5rem;
}

.btn-add {
  background: var(--green);
  border: none;
  color: #04220f;
  padding: 0.65rem 1.2rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  width: auto;
  transition: filter 0.15s, opacity 0.15s;
}

.btn-add:hover:not(:disabled) {
  filter: brightness(1.08);
}

.btn-add:disabled {
  opacity: 0.7;
  cursor: default;
}

.genre-chip {
  font-size: 0.78rem;
  color: var(--muted);
  border: 1px solid var(--line);
  padding: 0.18rem 0.65rem;
  border-radius: 16px;
}

.overview h2,
.stats h2 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  margin: 0 0 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
}

.overview p {
  line-height: 1.6;
  margin: 0 0 1.5rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  border-top: 1px solid var(--line);
  padding-top: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.stat-label {
  font-size: 0.72rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.stat-value {
  font-weight: 600;
  font-size: 0.95rem;
}

.loading-block {
  padding-top: 2rem;
}

.skeleton-poster,
.skeleton-text {
  background: linear-gradient(90deg, #0d1e28 25%, #142433 50%, #0d1e28 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 12px;
}

.skeleton-poster {
  width: 240px;
  aspect-ratio: 2 / 3;
  margin-bottom: 1rem;
}

.skeleton-text {
  height: 180px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 700px) {
  .detail-grid {
    grid-template-columns: 1fr;
    padding-top: 100px;
    gap: 1.25rem;
  }

  .poster-col {
    max-width: 200px;
    margin: 0 auto;
  }

  .backdrop {
    height: 240px;
  }

  .title {
    font-size: 1.5rem;
    text-align: center;
  }

  .tagline,
  .meta-row,
  .genres {
    justify-content: center;
    text-align: center;
  }

  .meta-row,
  .genres {
    justify-content: center;
  }
}
</style>
