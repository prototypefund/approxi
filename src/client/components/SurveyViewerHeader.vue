<template>
  <header class="approxi-header">
    <h1
      :style="{ opacity: alternativeTitle ? 0 : 1 }"
      class="approxi-header__title"
    >
      {{ title }}
    </h1>
    <h1
      v-show="!!alternativeTitle"
      class="approxi-header__title approxi-header__title--alternative"
    >
      {{ alternativeTitle }}
    </h1>
    <activity-indicator
      :enabled="activity"
      class="approxi-header__approxi-activity-indicator"
    />
  </header>
</template>

<script>
import ActivityIndicator from '@/components/ActivityIndicator.vue';

export default {
  name: 'SurveyViewerHeader',
  components: {
    ActivityIndicator
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    alternativeTitle: {
      type: String,
      default: ''
    },
    activity: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style lang="less">
@import '~assets/stylesheets/config/colors';

.approxi-header {
  position: relative;
  margin: -1rem -1rem 0;
  padding: 1em;
  border-bottom: 2px solid @decoration-color;
  background-color: @white;
  text-align: center;
  font-size: 1.2rem;
  line-height: 1.2;
  font-weight: 700;

  @media screen and (min-width: 40rem) {
    margin-left: -2rem;
    margin-right: -2rem;
  }
}

.approxi-header--sticky {
  position: sticky;
  top: 0;
  z-index: 1;
}

.approxi-header__title {
  margin: 0 0;
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1.4;

  &--alternative {
    display: flex !important;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    font-size: 2rem;
  }
}

.approxi-header__approxi-activity-indicator {
  position: absolute;
  z-index: 1;
  right: 0;
  bottom: 0;
  left: 0;
}
</style>
