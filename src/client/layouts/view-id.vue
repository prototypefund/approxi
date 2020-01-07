<template>
  <div id="app">
    <nuxt />
    <section class="approxi-section">
      <nuxt-link
        v-if="$route.name === 'view-id'"
        to="/create"
        class="approxi-button approxi-button--full"
      >
        Erstelle mit Approxi deine eigene Umfrage!
      </nuxt-link>
    </section>
  </div>
</template>

<style lang="less">
@import '~assets/stylesheets/form/buttons';
</style>
