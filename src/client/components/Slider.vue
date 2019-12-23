<template>
  <div
    ref="dataColumn"
    v-drag
    class="approxi-slider"
  >
    <div class="approxi-slider__inset">
      <div
        v-if="!showStats"
        class="approxi-slider__track"
      />
      <div
        v-if="showStats"
        class="approxi-slider__bar approxi-slider__bar--others"
        :style="makeBarPositionStyle(mean)"
      />
      <div
        class="approxi-slider__bar approxi-slider__bar--guess"
        :style="makeBarPositionStyle(currentValue)"
      />
      <div
        v-if="showStats"
        class="approxi-slider__bar approxi-slider__bar--answer"
        :style="makeBarPositionStyle(answer)"
      />
      <div
        v-if="showStatsStaticLabels && showStats"
        class="approxi-slider__stats approxi-slider__stats--others"
        :style="makeStatPositionStyle(mean)"
      >
        ∅ Schätzung
      </div>
      <div
        v-if="showStatsStaticLabels && showStats"
        class="approxi-slider__stats approxi-slider__stats--guess"
        :style="makeStatPositionStyle(value)"
      >
        Du
      </div>
      <div
        v-if="showStats"
        class="approxi-slider__stats approxi-slider__stats--answer"
        :style="makeStatPositionStyle(answer)"
      >
        Antwort: {{ formatNumber(answer) }}
      </div>
      <div
        v-if="!showStats"
        :class="['approxi-slider__handle', { 'approxi-slider__handle--active': dragging }]"
        :style="{ left: `${valueToPosition(currentValue)}px` }"
      />
    </div>
  </div>
</template>

<script>
import { scaleLinear } from 'd3-scale';
import debounce from 'lodash/debounce';
import drag from '@/directives/drag.js';

export default {
  name: 'Slider',
  directives: {
    drag
  },
  components: {
  },
  props: {
    enabled: {
      type: Boolean,
      default: true
    },
    answer: {
      type: Number,
      default: 0
    },
    mean: {
      type: Number,
      default: 0
    },
    value: {
      type: Number,
      default: 0
    },
    step: {
      type: Number,
      default: 0
    },
    left: {
      type: Number,
      default: 0
    },
    right: {
      type: Number,
      default: 0
    },
    format: {
      type: Function,
      default() {
        return x => x;
      }
    },
    formatNumber: {
      type: Function,
      default() {
        return x => x;
      }
    },
    showStats: Boolean,
    showStatsStaticLabels: Boolean
  },
  data() {
    return {
      dataColumnWidth: 0,
      dragging: false
    };
  },
  computed: {
    min() {
      return Math.min(this.left, this.right);
    },
    max() {
      return Math.max(this.left, this.right);
    },
    valueToPosition() {
      return scaleLinear()
        .domain([this.left, this.right])
        .rangeRound([0, this.dataColumnWidth])
        .clamp(true);
    },
    currentValue() {
      return (this.value === undefined || this.value === null) ? this.defaultValue : this.value;
    },
    defaultValue() {
      if (this.min <= 0 && this.max >= 0) {
        return 0;
      }
      return this.min + 0.1 * Math.abs(this.max - this.min);
    },
    anchorPosition() {
      let anchorValue;
      if (this.min <= 0 && this.max >= 0) {
        anchorValue = 0;
      } else if (this.min < 0) {
        anchorValue = this.max;
      } else {
        anchorValue = this.min;
      }
      return this.valueToPosition(anchorValue);
    },
    draggable() {
      return this.enabled && !this.showStats;
    }
  },
  watch: {
    draggable: {
      handler(newVal) {
        if (newVal) {
          this.$on('drag-start', this.dragStart);
          this.$on('drag-start', this.dragMove);
          this.$on('drag-move', this.dragMove);
          this.$on('drag-end', this.dragEnd);
        } else {
          this.$off('drag-start');
          this.$off('drag-move');
          this.$off('drag-end');
        }
      },
      immediate: true
    }
  },
  mounted() {
    const onResize = () => {
      if (!this.$refs.dataColumn) {
        return;
      }
      this.dataColumnWidth = this.$refs.dataColumn.getBoundingClientRect().width;
    };
    this.resize = debounce(onResize, 300);
    this.$on('resize', this.resize);
    window.addEventListener('resize', this.resize, { passive: true });
    this.$nextTick(function () {
      this.resize();
    });
  },
  beforeDestroy() {
    this.$off('resize');
    window.removeEventListener('resize', this.resize);
  },
  methods: {
    makeBarPositionStyle(value) {
      const x0 = this.anchorPosition;
      const x1 = this.valueToPosition(value);
      const left = `${Math.min(x0, x1)}px`;
      const right = `${this.dataColumnWidth - Math.max(x0, x1)}px`;
      return { left, right };
    },
    makeStatPositionStyle(value) {
      const d = this.valueToPosition(value);
      const [align, pos] = (d >= this.anchorPosition) ? ['left', d + 5] : ['right', this.dataColumnWidth - d + 5];
      return {
        [align]: `${pos}px`,
        'text-align': align
      };
    },
    dragStart() {
      this.dragging = true;
    },
    dragMove(event) {
      let newValue = this.valueToPosition.invert(event.x);
      if (this.step) {
        newValue = Math.round(newValue / this.step) * this.step;
        newValue = Math.max(newValue, this.min);
        newValue = Math.min(newValue, this.max);
      }
      this.$emit('input', newValue);
    },
    dragEnd(event) {
      this.dragging = false;
      this.$emit('change', this.value);
    },
    resize() {}
  }
};
</script>

<style lang="less">
@import '~assets/stylesheets/config/colors';
@import '~assets/stylesheets/config/shadows';

.approxi-slider {
  position: relative;
  width: 100%;
  height: 56px;
  -webkit-touch-callout: none;
  user-select: none;
}

.approxi-slider__inset {
  width: 100%;
  heigt: 56px;
}

.approxi-slider__track {
  position: absolute;
  top: 27px;
  width: 100%;
  height: 2px;
  background-color: @silver;
}

.approxi-slider__bar {
  position: absolute;
  height: 22px;
  min-width: 1px;
  border: 1px solid @white;

  &--guess {
    background-color: @primary-color;
    top: 16px;
  }

  &--others {
    background-color: @inactive-color;
    top: 6px;
  }

  &--answer {
    background-color: @secondary-color;
    top: 29px;
  }
}

.approxi-slider__handle {
  position: absolute;
  top: 0;
  left: 0;
  width: 56px;
  height: 56px;
  margin-top: 0px;
  margin-left: -28px;
  box-sizing: border-box;
  border: 4px solid @white;
  border-radius: 28px;
  background-color: @primary-color;
  box-shadow: @shadow;

  &--active {
    width: 72px;
    height: 72px;
    margin-top: -8px;
    margin-left: -36px;
    border-radius: 36px;
    box-shadow: @medium-shadow;
  }
}

.approxi-slider__stats {
  position: absolute;
  font-size: 0.875em;
  font-weight: 700;
  text-shadow: 1px 1px 0 @white, -1px -1px 0 @white, 1px -1px 0 @white, -1px 1px 0 @white;

  &--guess {
    top: 8px;
    color: @primary-color;
  }

  &--answer {
    top: 42px;
    color: @secondary-color;
  }

  &--others {
    top: -12px;
    color: @inactive-color;
  }
}
</style>
