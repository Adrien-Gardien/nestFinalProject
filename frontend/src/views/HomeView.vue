<script setup>
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
</script>

<template>
  <main class="page">
    <section class="hero">
      <p class="eyebrow">Mini Letterboxd Clone</p>
      <h1>Votre cinémathèque<br /><span class="accent">personnelle</span></h1>
      <p class="subtitle">
        Suivez les films que vous avez vus, gérez votre watchlist et gardez un historique de votre
        parcours cinématographique.
      </p>
      <div class="hero-cta">
        <template v-if="!auth.token">
          <RouterLink class="btn-primary" to="/register">Créer un compte</RouterLink>
          <RouterLink class="btn-ghost" to="/login">Se connecter</RouterLink>
        </template>
        <template v-else>
          <RouterLink class="btn-primary" to="/watchlist">Voir ma watchlist →</RouterLink>
        </template>
      </div>
    </section>

    <section class="features">
      <div class="feature-card">
        <span class="feature-icon">🎬</span>
        <h3>Watchlist</h3>
        <p>Ajoutez les films que vous voulez voir ou que vous avez déjà regardés.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">📊</span>
        <h3>Statistiques</h3>
        <p>Films vus, à voir, année de prédilection — tout d'un coup d'œil.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">🔒</span>
        <h3>Sécurisé</h3>
        <p>Inscription avec vérification email et authentification 2FA à chaque connexion.</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.hero {
  padding: 4rem 0 3rem;
  text-align: center;
}

h1 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  margin: 0 0 1rem;
  line-height: 1.1;
}

.accent {
  color: var(--green);
}

.subtitle {
  color: var(--muted);
  max-width: 480px;
  margin: 0 auto 2rem;
  line-height: 1.7;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  background: var(--green);
  color: #04220f;
  padding: 0.7rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  transition: background 0.15s;
}

.btn-primary:hover {
  background: var(--green-hover);
}

.btn-ghost {
  background: transparent;
  color: var(--text);
  padding: 0.7rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  border: 1px solid var(--line);
  transition: border-color 0.15s;
}

.btn-ghost:hover {
  border-color: rgba(133, 169, 168, 0.5);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.feature-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 1.5rem;
}

.feature-icon {
  font-size: 1.8rem;
  display: block;
  margin-bottom: 0.75rem;
}

.feature-card h3 {
  font-family: 'Space Grotesk', sans-serif;
  margin: 0 0 0.5rem;
}

.feature-card p {
  color: var(--muted);
  margin: 0;
  line-height: 1.6;
  font-size: 0.9rem;
}
</style>
