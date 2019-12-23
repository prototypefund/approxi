<template>
  <div class="approxi-viewer">
    <section
      v-if="normalizedSurvey"
      class="approxi-section"
    >
      <SurveyViewerHeader
        :title="normalizedSurvey.title"
        :alternative-title="tooltip"
        :class="{ 'approxi-header--sticky': stickyHeader }"
      />
      <div class="approxi-grid">
        <div class="approxi-grid__row approxi-grid__row--header">
          <div class="approxi-grid__column approxi-grid__column--label" />
          <div class="approxi-grid__column">
            <div ref="dataColumn" class="approxi-ticks">
              <div class="approxi-ticks approxi-ticks__tick approxi-ticks__tick--min">
                {{ format(normalizedSurvey.range[0]) }}
              </div>
              <div class="approxi-ticks approxi-ticks__tick approxi-ticks__tick--mid" />
              <div class="approxi-ticks approxi-ticks__tick approxi-ticks__tick--max">
                {{ format(normalizedSurvey.range[1]) }}
              </div>
            </div>
          </div>
        </div>
        <template v-for="(value, index) in normalizedSurvey.values">
          <div
            :key="'slider-' + index"
            class="approxi-grid__row approxi-grid__row--data"
          >
            <div class="approxi-grid__column approxi-grid__column--label">
              <p>{{ value.label }}</p>
            </div>
            <div class="approxi-grid__column approxi-grid__column--control">
              <slider
                :value="values[index]"
                :left="normalizedSurvey.range[0]"
                :right="normalizedSurvey.range[1]"
                :step="normalizedSurvey.step"
                :mean="(stats && stats.means) ? stats.means[index] : 0"
                :answer="value.value"
                :format="format"
                :format-number="formatNumber"
                :show-stats="solved"
                :show-stats-static-labels="index === 0"
                :enabled="enabled"
                @change="tooltip = null"
                @input="$set(values, index, $event); tooltip = format($event)"
              />
            </div>
          </div>
          <div
            v-if="!!value.note"
            :key="'note' + index"
            class="approxi-grid__row approxi-grid__row--data"
          >
            <div class="approxi-grid__column approxi-grid__column--label">
              <div class="approxi-grid__column--label--decorator" />
            </div>
            <div class="approxi-grid__column approxi-grid__column--control">
              <p>{{ value.note }}</p>
            </div>
          </div>
        </template>
      </div>
      <div v-if="solved" class="approxi-viewer__result">
        <div v-if="!!normalizedSurvey.explanation" class="approxi-viewer__result-text">
          {{ normalizedSurvey.explanation }}
        </div>
        <div v-if="!!normalizedSurvey.source" class="approxi-viewer__source">
          <span class="approxi-viewer__source-label">Datenquelle: </span>
          <span class="approxi-viewer__source-text" v-html="normalizedSurvey.source | linkify" />
        </div>
      </div>
      <p v-if="solved && rankingText">
        {{ rankingText }}
      </p>
      <button
        is="Button"
        v-if="preview"
        :caption="solved ? 'Frage anzeigen' : 'Resultat anzeigen'"
        :enabled="enabled && normalizedSurvey.values.length > 0"
        :wide="true"
        @input="solved = !solved"
      />
      <button
        is="Button"
        v-else-if="normalizedSurvey.values.length && !solved"
        caption="Resultat anzeigen"
        :enabled="enabled && canSolve"
        :wide="true"
        @input="solve"
      />
      <button
        is="Button"
        v-if="solved && showNext"
        caption="Nächste Schätzung"
        :enabled="enabled"
        :wide="true"
        @input="$emit('next')"
      />
      <footer v-if="showFooter && !preview" class="approxi-section__footer">
        <b>Hinweis:</b> Bei zweifelhaften Zahlen überprüfe bitte die Quelle. Approxi ist nicht Urheber der Umfragen und nicht für ihren Inhalt verantwortlich. <a :href="`mailto:abuse@approxi.de?subject=Abuse Report ${normalizedSurvey.id}&body=https://approxi.de/view/${normalizedSurvey.id}`">Missbrauch bitte melden.</a>
      </footer>
    </section>
    <section
      v-else-if="!preview"
      class="approxi-section"
    >
      <p>Invalid data</p>
    </section>
  </div>
</template>

<script>
import {
  format as d3Format,
  formatDefaultLocale as d3FormatDefaultLocale
} from 'd3-format';
import bsearch from 'binary-search';
import { compare as mathCompare } from 'mathjs';
import calculateStep from '../../util/math/calculate-step';
import decimalPlaces from '../../util/math/decimal-places';
import residualSumOfSquares from '../../util/math/residual-sum-of-squares';
import SurveyViewerHeader from '@/components/SurveyViewerHeader.vue';
import Button from '@/components/Button.vue';
import Slider from '@/components/Slider.vue';

export default {
  name: 'Viewer',
  components: {
    SurveyViewerHeader,
    Button,
    Slider
  },
  // model: {
  //   prop: 'values'
  // },
  props: {
    survey: {
      type: Object,
      default: () => {},
      validator: value => true
    },
    stats: {
      type: Object,
      default: () => {},
      validator: value => true
    },
    enabled: {
      type: Boolean,
      default: true
    },
    preview: {
      type: Boolean,
      default: false
    },
    showSolution: {
      type: Boolean,
      default: false
    },
    stickyHeader: {
      type: Boolean,
      default: true
    },
    showFooter: {
      type: Boolean,
      default: true
    },
    showNext: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      rss: null,
      solved: false,
      tooltip: null,
      values: []
    };
  },
  computed: {
    formatData() {
      d3FormatDefaultLocale({
        decimal: ',',
        thousands: '.',
        grouping: [3],
        currency: [this.normalizedSurvey.format.prefix, this.normalizedSurvey.format.suffix]
      });
      const precision = decimalPlaces(this.normalizedSurvey.step);
      const type = 'f';
      return { precision, type };
    },
    format() {
      const { precision, type } = this.formatData;
      return d3Format(`$,.${precision}${type}`);
    },
    formatNumber() {
      const { precision, type } = this.formatData;
      return d3Format(`,.${precision}${type}`);
    },
    isValidSurvey() {
      if (!this.survey.title) {
        return false;
      }
      if (!this.survey.range || !Number.isFinite(this.survey.range[0]) || !Number.isFinite(this.survey.range[1])) {
        return false;
      }
      if (!this.survey.values || !this.survey.values.length) {
        return false;
      }
      const min = Math.min(this.survey.range[0], this.survey.range[1]);
      const max = Math.max(this.survey.range[0], this.survey.range[1]);
      if (!this.survey.values.every(v => Number.isFinite(v.value) && v.value >= min && v.value <= max)) {
        return false;
      }
      return true;
    },
    normalizedSurvey() {
      if (!this.isValidSurvey) {
        return null;
      }
      const s = {
        id: (this.survey.id || '').trim().toLowerCase(),
        title: (this.survey.title || '').trim(),
        explanation: (this.survey.explanation || '').trim(),
        source: (this.survey.source || '').trim(),
        range: [
          this.survey.range[0],
          this.survey.range[1]
        ],
        values: (this.survey.values || []).map(v => ({
          label: (v.label || '').trim(),
          note: (v.note || '').trim(),
          value: v.value
        })),
        format: {
          prefix: ((this.survey.format && this.survey.format.prefix) || '').trimLeft(),
          suffix: ((this.survey.format && this.survey.format.suffix) || '').trimRight()
        }
      };
      if (this.survey.step) {
        const maxStep = Math.abs(s.range[0] - s.range[1]);
        s.step = Math.min(this.survey.step, maxStep);
      } else {
        const lowerBoundAdjust = Math.min(this.survey.range[0] || this.defaultBounds.left, this.survey.range[1] || this.defaultBounds.right);
        s.step = calculateStep(s.values.map(v => v.value - lowerBoundAdjust)) || 1;
      }
      return s;
    },
    rankingText() {
      if (this.rss === null || !this.stats) {
        return null;
      }
      const stats = this.stats;
      const count = stats.count;
      const topLength = stats.rssTop.length;
      if (count <= 1) {
        return null;
      } else if (count <= topLength) {
        const index = bsearch(stats.rssTop, this.rss, (a, b) => mathCompare(a, b));
        if (index === 0) {
          return `Die beste von ${count} Schätzungen!`;
        } else if (index > 0) {
          return `Platz ${index + 1} von ${count} Schätzungen!`;
        } else {
          return null;
        }
      } else {
        const pSpan = 100 / (stats.rssPercentiles.length + 1);
        const pIndex = stats.rssPercentiles.findIndex((value, index) => {
          return (mathCompare(this.rss, value) > 0);
        });
        if (pIndex < 0) {
          return null;
        } else {
          return `Nur ${pIndex * pSpan} % von ${topLength} schätzten besser!`;
        }
      }
    },
    canSolve() {
      if (!this.values || !this.normalizedSurvey.values) {
        return false;
      }
      return (this.values.length === this.normalizedSurvey.values.length) && (this.values.every(v => v !== null && v !== undefined));
    }
  },
  watch: {
    showSolution(newValue) {
      this.solved = newValue;
    },
    solved(newValue) {
      this.$emit('update:showSolution', newValue);
    },
    survey: {
      handler(newValue) {
        this.solved = false;
        this.rss = null;
        this.tooltip = null;
        this.values = (new Array(newValue.values.length)).fill();
        if (this.preview) {
          window.dispatchEvent(new Event('resize'));
        }
      },
      deep: true
    }
  },
  methods: {
    solve() {
      if (this.solved || !this.canSolve) {
        return;
      }
      const surveyValues = this.normalizedSurvey.values.map(v => v.value);
      this.rss = residualSumOfSquares(surveyValues, this.values);
      this.solved = true;
      this.$emit('input', this.values);
    }
  }
};
</script>

<style lang="less">
@import '~assets/stylesheets/config/colors';

.approxi-viewer {
  font-size: 1rem;
  line-height: 1.5;
  color: @text-color;
  text-rendering: optimizeLegibility;
}

.approxi-ticks {
  display: flex;
  width: auto;
  flex: row nowrap;
  justify-content: space-between;
  padding: 1em 0 0.5em;

  &__tick--min {
    padding-left: 0.5em;
  }

  &__tick--max {
    padding-right: 1.2em;
  }
}

.approxi-viewer__result {
    margin: 2em 0.5em;
    line-height: 1.4;
}

.approxi-viewer__result-text {
  margin: 1em 0;
}

.approxi-viewer__source-label {
  font-weight: bold;
}

.approxi-viewer__source-link {
  color: @silver;

  &:hover {
    color: @blue;
  }
}

.approxi-grid {
  display: table;
  width: 100%;
  border: 0;
  border-collapse: collapse;
}

.approxi-grid__row {
  display: table-row;
  width: 100%;
}

.approxi-grid__column {
  display: table-cell;
  vertical-align: top;

  &--label {
    width: 1%;
    padding-top: 1.1em;
    text-align: right;

    p {
      margin: 0;
    }

    &--decorator {
      display: block;
      content: ' ';
      width: 50%;
      height: 1em;
      margin-top: -1.6em;
      margin-left: auto;
      border-bottom: 1px solid #ccc;
      border-left: 1px solid #ccc;
    }
  }

  &--control {
    width: 99%;
    padding: 0 1.2em 0.9em 0.5em;
    hyphens: auto;

    p {
      line-height: 1.4;
      margin: 0;
    }
  }

  &--description {
    padding-right: 0;
    color: @silver;
  }

  &--single {
    width: 100%;
    padding-left: 0.5em;
  }
}
</style>
