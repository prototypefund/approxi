<template>
  <button
    class="approxi-button"
    :class="{ 'approxi-button--full': wide }"
    :title="alt"
    :disabled="!enabled"
    @click.stop.prevent="$emit('input')"
  >
    {{ caption }}
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    caption: {
      type: String,
      default: ''
    },
    alt: {
      type: String,
      default: ''
    },
    enabled: {
      type: Boolean,
      default: true
    },
    wide: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style lang="less">
@import '~assets/stylesheets/form/buttons';
</style>
