<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="navbar">
    <div class="nav-inner">
      <RouterLink class="nav-logo" to="/">
        <span class="logo-icon">▶</span> CineList
      </RouterLink>

      <div class="nav-links">
        <RouterLink to="/">Accueil</RouterLink>
        <RouterLink to="/movies">Films</RouterLink>
        <RouterLink v-if="auth.token" to="/watchlist">Ma Watchlist</RouterLink>
      </div>

      <div class="nav-auth">
        <template v-if="!auth.token">
          <RouterLink class="nav-link-ghost" to="/login">Connexion</RouterLink>
          <RouterLink class="nav-btn" to="/register">S'inscrire</RouterLink>
        </template>
        <template v-else>
          <span class="nav-username">{{ auth.user?.displayName ?? '…' }}</span>
          <button class="nav-btn-logout" @click="handleLogout">Déconnexion</button>
        </template>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 56px;
  background: rgba(8, 12, 16, 0.96);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(8px);
}

.nav-inner {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 1.25rem;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-logo {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--green);
  text-decoration: none;
  letter-spacing: 0.03em;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.logo-icon {
  color: var(--orange);
  font-size: 0.75rem;
}

.nav-links {
  display: flex;
  gap: 1.25rem;
  flex: 1;
}

.nav-links a {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.15s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--text);
}

.nav-auth {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
  flex-shrink: 0;
}

.nav-link-ghost {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.15s;
}

.nav-link-ghost:hover {
  color: var(--text);
}

.nav-btn {
  background: var(--green);
  color: #04220f;
  padding: 0.35rem 0.9rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  text-decoration: none;
  transition: background 0.15s;
}

.nav-btn:hover {
  background: var(--green-hover);
}

.nav-username {
  color: var(--text);
  font-size: 0.875rem;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-btn-logout {
  background: transparent;
  border: 1px solid rgba(255, 157, 63, 0.4);
  color: var(--orange);
  padding: 0.35rem 0.9rem;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s;
}

.nav-btn-logout:hover {
  background: rgba(255, 157, 63, 0.1);
}

@media (max-width: 600px) {
  .nav-links {
    display: none;
  }
}
</style>
