<template>
  <div>
    <section class="approxi-section approxi-section--hero">
      <p>
        <span class="approxi-text-background"><b>Approxi ist ein neues Umfrage-Tool für Schätzungen.</b> Lass deine Leserinnen und Leser erst schätzen — um gefühlten Wahrheiten tatsächliche Werte gegenüberzustellen!</span>
      </p>

      <p>
        <span class="approxi-text-background">Du kannst die Approxi-Umfragen in deine <b>Artikel</b> integrieren, über <b>soziale Medien</b> teilen oder auch in <b>Vorträge und Vorlesungen</b> einbauen.</span>
      </p>
    </section>
    <section class="approxi-section">
      <nuxt-link
        to="/create"
        class="approxi-button approxi-button--full"
      >
        Eigene Umfrage erstellen
      </nuxt-link>
    </section>
  </div>
</template>

<script>
export default {
  head() {
    return {
      title: 'Approxi'
    };
  }
};
</script>

<style lang="less">
@import '~assets/stylesheets/config/colors';

.approxi-text-background {
  color: white;
  background-color: @primary-color;
  padding: 0.05em 0.25em;
  box-decoration-break: clone;
}
</style>
