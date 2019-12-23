<template>
  <div
    v-show="enabled"
    :class="{ 'approxi-activity-indicator--on': enabled }"
    class="approxi-activity-indicator"
  />
</template>

<script>
export default {
  name: 'ActivityIndicator',
  props: {
    enabled: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style lang="less">
@import '~assets/stylesheets/config/colors';
@import '~assets/stylesheets/fx/stripes';

@angle: -(1turn / 8);
@height: 0.5rem;
@stripe-width: 0.25rem;

.approxi-activity-indicator {
  height: @height;
  .zebra-striped-background(@stripe-color: @secondary-color; @stripe-width: @stripe-width);
  animation: approxi-activity-indicator 0.2s linear infinite reverse paused;
  will-change: display, animation-play-state;

  &--on {
    animation-play-state: running;
  }
}

// sin(angle) = opp / hyp <=> hyp = opp / sin(angle)
//                                = height / sin(angle)
// cos(angle) = adj / hyp <=> adj = cos(angle) * hyp
//                                = cos(angle) * (height / sin(angle))
//                                = height * (cos(angle) / sin(angle))
//                                = height / tan(angle)
@keyframes approxi-activity-indicator {
  0% {
    background-position-x: 0;
  }
  100% {
    background-position-x: @height / tan(@angle);
  }
}
</style>
