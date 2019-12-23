<template>
  <div id="app">
    <nav class="approxi-nav approxi-stripes">
      <div class="approxi-nav__inset">
        <nuxt-link
          to="/"
          class="approxi-logo approxi-nav__approxi-logo"
        >
          <svg height="48" viewBox="0 0 20 48" width="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 48L14.2 0h6.7L6.7 48H0z" />
          </svg>
          <span>approxi</span><span>.de</span>
        </nuxt-link>
        <nuxt-link
          v-if="$route.name !== 'create'"
          to="/create"
          class="approxi-button approxi-nav__approxi-button"
        >
          Eigene Umfrage erstellen
        </nuxt-link>
      </div>
    </nav>
    <nuxt />
    <footer
      v-if="$route.name !== 'view-id'"
      class="approxi-section approxi-section--glossy approxi-footer"
    >
      <ul class="approxi-footer__link-list">
        <li class="approxi-footer__link-list-item">
          <nuxt-link to="/">
            approxi.de
          </nuxt-link>
        </li>
        <li class="approxi-footer__link-list-item">
          <nuxt-link to="/create">
            Umfrage erstellen
          </nuxt-link>
        </li>
        <li class="approxi-footer__link-list-item">
          <nuxt-link to="/legal">
            Impressum
          </nuxt-link>
        </li>
      </ul>
      <ul class="approxi-footer__link-list">
        <li class="approxi-footer__link-list-item">
          <a href="">Twitter</a>
        </li>
        <li class="approxi-footer__link-list-item">
          <nuxt-link to="/blog">
            Blog
          </nuxt-link>
        </li>
        <li class="approxi-footer__link-list-item">
          <a href="https://gitlab.com/approxi">Gitlab</a>
        </li>
      </ul>
      <img class="approxi-footer__affiliate-banner" src="~assets/funders.svg">
    </footer>
  </div>
</template>

<style lang="less">
@import '~assets/stylesheets/scaffolding/main';
@import '~assets/stylesheets/form/buttons';
</style>
