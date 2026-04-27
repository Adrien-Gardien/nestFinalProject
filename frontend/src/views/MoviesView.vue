<script setup>
import { onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { api } from '../api'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const watchlistMap = ref(new Map())
const addingId = ref(null)
const addError = ref('')

// ─── état principal ───────────────────────────────────────────────────────────
const movies = ref([])
const genres = ref([])
const totalPages = ref(1)
const isLoading = ref(false)
const error = ref('')

// ─── filtres ──────────────────────────────────────────────────────────────────
const search = ref('')
const sort = ref('popularity.desc')
const activeGenre = ref(null)
const page = ref(1)

let debounceTimer = null

const sortOptions = [
  { value: 'popularity.desc', label: 'Popularité' },
  { value: 'vote_average.desc', label: 'Mieux notés' },
  { value: 'primary_release_date.desc', label: 'Plus récents' },
  { value: 'revenue.desc', label: 'Box-office' },
]

// ─── chargement ───────────────────────────────────────────────────────────────

// Adrien : on construit l'URL manuellement en fonction des filtres actifs
async function load() {
  error.value = ''
  isLoading.value = true

  try {
    let path = '/movies?page=' + page.value
    if (search.value.trim()) {
      path += '&q=' + encodeURIComponent(search.value.trim())
    } else {
      path += '&sort=' + sort.value
      if (activeGenre.value) path += '&genre=' + activeGenre.value
    }

    const data = await api(path)
    movies.value = data.results ?? []
    totalPages.value = Math.min(data.total_pages ?? 1, 500)
  } catch (e) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}

// Adrien : debounce sur la recherche pour éviter une requête par touche
function onSearchInput() {
  clearTimeout(debounceTimer)
  page.value = 1
  debounceTimer = setTimeout(load, 400)
}

function setSort(value) {
  sort.value = value
  page.value = 1
  load()
}

function setGenre(id) {
  activeGenre.value = activeGenre.value === id ? null : id
  page.value = 1
  load()
}

function prevPage() {
  if (page.value > 1) {
    page.value--
    load()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function nextPage() {
  if (page.value < totalPages.value) {
    page.value++
    load()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Adrien : quand la recherche est vidée, on repasse en mode discover
watch(search, (val) => {
  if (val === '') {
    clearTimeout(debounceTimer)
    page.value = 1
    load()
  }
})

function posterUrl(path) {
  if (!path) return null
  return `https://image.tmdb.org/t/p/w342${path}`
}

function year(dateStr) {
  return dateStr ? dateStr.slice(0, 4) : '—'
}

function rating(score) {
  return score ? score.toFixed(1) : '—'
}

function ratingClass(score) {
  if (score >= 7) return 'rating-good'
  if (score >= 5) return 'rating-mid'
  return 'rating-low'
}

async function loadWatchlistIds() {
  if (!auth.token) return
  const items = await api('/watchlist/me', 'GET', null, auth.token).catch(() => [])
  const map = new Map()
  for (const i of items) {
    if (i.tmdbId) map.set(i.tmdbId, i.id)
  }
  watchlistMap.value = map
}

async function toggleWatchlist(movie) {
  addError.value = ''
  if (!auth.token) {
    router.push('/login')
    return
  }
  addingId.value = movie.id
  try {
    if (watchlistMap.value.has(movie.id)) {
      const itemId = watchlistMap.value.get(movie.id)
      await api(`/watchlist/me/${itemId}`, 'DELETE', null, auth.token)
      const next = new Map(watchlistMap.value)
      next.delete(movie.id)
      watchlistMap.value = next
    } else {
      const created = await api('/watchlist/me', 'POST', { tmdbId: movie.id }, auth.token)
      const next = new Map(watchlistMap.value)
      next.set(movie.id, created.id)
      watchlistMap.value = next
    }
  } catch (e) {
    addError.value = e.message
  } finally {
    addingId.value = null
  }
}

onMounted(async () => {
  // on charge genres + films + watchlist en parallèle
  const [genreData] = await Promise.all([
    api('/movies/genres').catch(() => []),
    load(),
    loadWatchlistIds(),
  ])
  genres.value = genreData
})
</script>

<template>
  <main class="page">
    <div class="films-header">
      <h1>Films</h1>
      <p class="films-sub">Parcourez et recherchez parmi des milliers de films.</p>
    </div>

    <!-- Barre de recherche -->
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input
        v-model="search"
        placeholder="Rechercher un film…"
        class="search-input"
        @input="onSearchInput"
      />
      <button v-if="search" class="search-clear" @click="search = ''">&times;</button>
    </div>

    <!-- Filtres (masqués pendant une recherche textuelle) -->
    <div v-if="!search.trim()" class="filters">
      <div class="filter-group">
        <span class="filter-label">Trier par</span>
        <div class="filter-pills">
          <button
            v-for="opt in sortOptions"
            :key="opt.value"
            :class="['pill', { active: sort === opt.value }]"
            @click="setSort(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div v-if="genres.length > 0" class="filter-group">
        <span class="filter-label">Genre</span>
        <div class="filter-pills">
          <button
            v-for="g in genres"
            :key="g.id"
            :class="['pill pill-sm', { active: activeGenre === g.id }]"
            @click="setGenre(g.id)"
          >
            {{ g.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- Message d'erreur -->
    <p v-if="error" class="message message-error">{{ error }}</p>
    <p v-if="addError" class="message message-error">{{ addError }}</p>

    <!-- Loading skeleton -->
    <div v-if="isLoading" class="movie-grid">
      <div v-for="n in 20" :key="n" class="movie-card skeleton" />
    </div>

    <!-- Grille de films -->
    <div v-else-if="movies.length > 0" class="movie-grid">
      <RouterLink
        v-for="movie in movies"
        :key="movie.id"
        :to="{ name: 'movie-detail', params: { id: movie.id } }"
        class="movie-card"
      >
        <div class="poster-wrap">
          <img
            v-if="posterUrl(movie.poster_path)"
            :src="posterUrl(movie.poster_path)"
            :alt="movie.title"
            class="poster"
            loading="lazy"
          />
          <div v-else class="poster poster-placeholder">
            <span>{{ movie.title[0] }}</span>
          </div>
          <span :class="['rating-badge', ratingClass(movie.vote_average)]">
            ★ {{ rating(movie.vote_average) }}
          </span>

          <div class="card-overlay">
            <button
              class="overlay-btn"
              :class="{ 'overlay-btn-active': watchlistMap.has(movie.id) }"
              :title="watchlistMap.has(movie.id) ? 'Retirer de ma watchlist' : 'Ajouter à ma watchlist'"
              :disabled="addingId === movie.id"
              @click.prevent="toggleWatchlist(movie)"
            >
              <template v-if="watchlistMap.has(movie.id)">
                <span class="icon-default">✓</span>
                <span class="icon-hover">✕</span>
              </template>
              <span v-else>+</span>
            </button>
          </div>
        </div>
        <div class="card-info">
          <p class="card-title">{{ movie.title }}</p>
          <p class="card-year">{{ year(movie.release_date) }}</p>
        </div>
      </RouterLink>
    </div>

    <p v-else class="empty">Aucun film trouvé.</p>

    <!-- Pagination -->
    <div v-if="totalPages > 1 && !isLoading" class="pagination">
      <button :disabled="page === 1" @click="prevPage">← Précédent</button>
      <span class="page-info">Page {{ page }} / {{ totalPages }}</span>
      <button :disabled="page === totalPages" @click="nextPage">Suivant →</button>
    </div>
  </main>
</template>

<style scoped>
.films-header {
  padding: 1rem 0 1.25rem;
}

.films-header h1 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.8rem;
  margin: 0 0 0.25rem;
}

.films-sub {
  color: var(--muted);
  margin: 0;
  font-size: 0.9rem;
}

/* Recherche */
.search-bar {
  position: relative;
  margin-bottom: 1.25rem;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.7rem 2.5rem 0.7rem 2.4rem;
  font-size: 0.95rem;
  border-radius: 12px;
}

.search-clear {
  position: absolute;
  right: 0.65rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--muted);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  width: auto;
  line-height: 1;
}

.search-clear:hover {
  color: var(--text);
  background: none;
}

/* Filtres */
.filters {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.filter-group {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-label {
  color: var(--muted);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding-top: 0.35rem;
  flex-shrink: 0;
  min-width: 60px;
}

.filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.pill {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--muted);
  padding: 0.3rem 0.9rem;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s;
  width: auto;
  font-weight: 500;
}

.pill-sm {
  padding: 0.2rem 0.7rem;
  font-size: 0.78rem;
}

.pill:hover {
  background: rgba(133, 169, 168, 0.1);
  color: var(--text);
}

.pill.active {
  background: var(--green);
  border-color: var(--green);
  color: #04220f;
  font-weight: 600;
}

/* Grille */
.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.movie-card {
  cursor: pointer;
  transition: transform 0.15s;
  text-decoration: none;
  color: inherit;
  display: block;
}

.movie-card:hover {
  transform: translateY(-3px);
}

.poster-wrap {
  position: relative;
  aspect-ratio: 2 / 3;
  border-radius: 10px;
  overflow: hidden;
  background: #0d1e28;
  border: 1px solid rgba(145, 172, 170, 0.15);
}

.poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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
  width: 100%;
  height: 100%;
}

.rating-badge {
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;
  padding: 0.15rem 0.4rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  backdrop-filter: blur(4px);
}

.rating-good {
  background: rgba(67, 212, 119, 0.85);
  color: #04220f;
}

.rating-mid {
  background: rgba(255, 157, 63, 0.85);
  color: #341a04;
}

.rating-low {
  background: rgba(255, 111, 111, 0.75);
  color: #300;
}

/* Overlay action (ajout watchlist) */
.card-overlay {
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  justify-content: flex-end;
  gap: 0.4rem;
  padding: 0.5rem;
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
  font-size: 1.05rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-weight: 700;
  line-height: 1;
  transition: all 0.15s;
}

.overlay-btn:hover:not(:disabled) {
  background: var(--green);
  color: #04220f;
  border-color: var(--green);
}

.overlay-btn-active {
  background: var(--green);
  color: #04220f;
  border-color: var(--green);
}

.overlay-btn-active:hover:not(:disabled) {
  background: rgba(220, 100, 100, 0.92);
  border-color: rgba(220, 100, 100, 0.92);
  color: #fff;
}

.overlay-btn .icon-hover {
  display: none;
}

.overlay-btn-active:hover:not(:disabled) .icon-default {
  display: none;
}

.overlay-btn-active:hover:not(:disabled) .icon-hover {
  display: inline;
}

.overlay-btn:disabled {
  cursor: default;
  opacity: 0.6;
}

.card-info {
  padding: 0.45rem 0.1rem 0;
}

.card-title {
  font-size: 0.82rem;
  font-weight: 600;
  margin: 0 0 0.1rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.3;
}

.card-year {
  font-size: 0.75rem;
  color: var(--muted);
  margin: 0;
}

/* Skeleton loader */
.skeleton {
  pointer-events: none;
}

.skeleton .poster-wrap,
.skeleton {
  background: linear-gradient(90deg, #0d1e28 25%, #142433 50%, #0d1e28 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 10px;
  aspect-ratio: 2 / 3;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination button {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--muted);
  padding: 0.5rem 1.2rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.15s;
  width: auto;
  font-weight: 500;
}

.pagination button:hover:not(:disabled) {
  border-color: var(--green);
  color: var(--text);
}

.pagination button:disabled {
  opacity: 0.35;
  cursor: default;
}

.page-info {
  color: var(--muted);
  font-size: 0.875rem;
  min-width: 100px;
  text-align: center;
}

@media (max-width: 500px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 0.75rem;
  }

  /* Sur mobile l'overlay reste visible */
  .card-overlay {
    opacity: 1;
  }
}
</style>
