<template>
  <div class="approxi-editor">
    <section class="approxi-section">
      <input
        v-model.trim="$v.survey.title.$model"
        type="text"
        class="approxi-input approxi-input--full"
        :class="{
          'approxi-input--invalid': $v.survey.title.$error,
          'approxi-input--focus': !$v.survey.title.$error
        }"
        :disabled="!enabled"
        autocapitalize="sentences"
        autocomplete="off"
        autofocus
        placeholder="Deine Frage"
      >
      <small
        v-if="$v.survey.title.$error"
        class="approxi-label approxi-label--invalid"
      >
        Bitte gib eine Frage ein
      </small>
      <table style="width: 100%; table-layout: fixed; border-collapse: collapse; border-spacing: 0px; border: 0; margin: 1em 0;">
        <tbody>
          <tr
            v-for="(value, index) in $v.survey.values.$each.$iter"
            :key="`${index}-${value.value}-${value.label}`"
            style="vertical-align: top"
          >
            <td style="padding-right: 1em; width: 20%;">
              <input
                ref="surveyValuesInputs"
                v-model.number="value.value.$model"
                type="number"
                class="approxi-input"
                inputmode="decimal"
                :class="{
                  'approxi-input--invalid': value.value.$error,
                  'approxi-input--focus': !value.value.$error
                }"
                autocomplete="off"
                placeholder="Antwort"
                :disabled="!enabled"
                :step="survey.step ? survey.step : defaultStep"
                :min="Math.min(normalizedBounds[0], normalizedBounds[1])"
                :max="Math.max(normalizedBounds[0], normalizedBounds[1])"
                @keypress.enter.stop="newValue(index)"
                @keypress="valueInput"
              >
              <small
                v-if="value.value.$anyError"
                class="approxi-label approxi-label--invalid"
              >
                Bitte gib eine Zahl ein
              </small>
            </td>
            <td style="padding-right: 1em; width: 35%;">
              <input
                v-model.trim.lazy="value.label.$model"
                type="text"
                class="approxi-input"
                autocomplete="off"
                placeholder="Beschriftung (optional)"
                :disabled="!enabled"
                @keypress.enter.stop="newValue(index)"
              >
            </td>
            <td style="padding-right: 1em;">
              <input
                v-model.trim.lazy="value.note.$model"
                type="text"
                class="approxi-input"
                autocomplete="off"
                placeholder="Hilfetext (optional)"
                :disabled="!enabled"
                @keypress.enter.stop="newValue(index)"
              >
            </td>
            <td style="width: 40px;">
              <button
                is="Button"
                caption="+"
                help="Weitere Antwort"
                style="margin: 0;"
                :enabled="enabled"
                @input="newValue(index)"
              />
            </td>
            <td
              v-if="survey.values.length > 1"
              style="width: 40px;"
            >
              <button
                is="Button"
                caption="−"
                style="margin: 0;"
                :enabled="enabled"
                @input="survey.values.splice(index, 1)"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <div style="display: flex; flex-wrap: wrap; justify-content: space-between;">
        <label
          class="approxi-label approxi-label--stackable"
          :class="{ 'approxi-label--invalid': $v.survey.range[0].$error }"
        >
          Grenze links
          <input
            v-model.number="$v.survey.range[0].$model"
            type="number"
            class="approxi-input"
            inputmode="decimal"
            :class="{ 'approxi-input--invalid': $v.survey.range[0].$error }"
            :step="survey.step ? survey.step : defaultStep"
            :disabled="!enabled"
            :placeholder="defaultBounds.left"
          >
          <small
            v-if="$v.survey.range[0].$error"
            class="approxi-label approxi-label--invalid"
          >
            Manche Antwortwerte liegen außerhalb dieser Grenze
          </small>
        </label>
        <label
          class="approxi-label approxi-label--stackable"
          :class="{ 'approxi-label--invalid': $v.survey.range[1].$error }"
        >
          Grenze rechts
          <input
            v-model.number="$v.survey.range[1].$model"
            type="number"
            class="approxi-input"
            inputmode="decimal"
            :class="{ 'approxi-input--invalid': $v.survey.range[1].$error }"
            :step="survey.step ? survey.step : defaultStep"
            :disabled="!enabled"
            :placeholder="defaultBounds.right"
          >
          <small
            v-if="$v.survey.range[1].$error"
            class="approxi-label approxi-label--invalid"
          >
            Manche Antwortwerte liegen außerhalb dieser Grenze
          </small>
        </label>
        <label class="approxi-label approxi-label--stackable">
          Präfix (optional)
          <input
            v-model="$v.survey.format.prefix.$model"
            type="text"
            class="approxi-input"
            maxlength="30"
            placeholder="z. B. €"
            :disabled="!enabled"
          >
        </label>
        <label class="approxi-label approxi-label--stackable">
          Suffix (optional)
          <input
            v-model="$v.survey.format.suffix.$model"
            type="text"
            class="approxi-input"
            maxlength="30"
            placeholder="z. B. %"
            :disabled="!enabled"
          >
        </label>
        <label
          class="approxi-label approxi-label--stackable"
          :class="{
            'approxi-label--invalid': $v.survey.step.$error,
            'approxi-label--focus': !$v.survey.step.$invalid && $v.survey.step.$dirty && stepWarning
          }"
        >
          Schätzschritte
          <input
            v-model.number="$v.survey.step.$model"
            type="number"
            class="approxi-input"
            inputmode="decimal"
            :class="{ 'approxi-input--invalid': $v.survey.step.$error }"
            step="any"
            :disabled="!enabled"
            :max="stepMax"
            :placeholder="defaultStep"
          >
          <small
            v-if="!$v.survey.step.number"
            class="approxi-label approxi-label--invalid"
          >
            Ungültige Zahl
          </small>
          <small
            v-else-if="!$v.survey.step.greaterThanZero"
            class="approxi-label approxi-label--invalid"
          >
            Schritt muss positiv sein
          </small>
          <small
            v-else-if="!$v.survey.step.maxValue"
            class="approxi-label approxi-label--invalid"
          >
            Schritt ist zu groß
          </small>
          <small
            v-else-if="$v.survey.step.$dirty && stepWarning"
            class="approxi-label approxi-label--focus"
          >
            Mit diesem Schritt lassen sich manche Antwortwerte nicht genau schätzen
          </small>
        </label>
      </div>
    </section>
    <section
      v-if="$v.survey.$anyDirty && !$v.survey.$invalid"
      class="approxi-section approxi-section--glossy"
    >
      <survey-viewer
        :survey="normalizedSurvey"
        :show-solution.sync="showSolution"
        :preview="true"
        :sticky-header="false"
        :enabled="enabled"
      />
    </section>
    <section class="approxi-section">
      <label class="approxi-label">
        Erklärtext
        <textarea
          v-model.trim="$v.survey.explanation.$model"
          class="approxi-input"
          style="height: 5em"
          placeholder="(optional)"
          :disabled="!enabled"
          @focus="showSolution = true"
        />
      </label>
      <br>
      <label class="approxi-label">
        Datenquelle
        <input
          v-model.trim="$v.survey.source.$model"
          type="text"
          class="approxi-input"
          placeholder="(optional, aber besser mit)"
          :disabled="!enabled"
          @focus="showSolution = true"
        >
      </label>
    </section>
    <section class="approxi-section">
      <p>
        <b>Wichtig:</b> Eine gespeicherte Umfragen kann nicht mehr bearbeitet und auch nicht mehr gelöscht werden (keine Sorge, ohne Link findet sie auch niemand). Sobald du die Umfrage speicherst, erhältst du einen Link zur ihr, den du teilen und verbreiten kannst. Um eine Umfrage zu korrigieren, lade ihre Daten (siehe oben) und erstelle einfach eine neue.
      </p>
      <button
        is="Button"
        caption="Bereit? Umfrage erstellen!"
        :enabled="enabled"
        :wide="true"
        @input="submit"
      />
    </section>
  </div>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { helpers, maxValue, minLength, required } from 'vuelidate/lib/validators';
import cloneDeep from 'lodash/cloneDeep';
import calculateStep from '../../util/math/calculate-step';
import decimalPlaces from '../../util/math/decimal-places';
import isDivisible from '../../util/math/is-divisible';
import SurveyViewer from './SurveyViewer.vue';
import Button from '@/components/Button.vue';

// const numberRegex = /-?(\d+|\d+\.\d+|\.\d+)([eE][-+]?\d+)?/; // from Chromium
// const prefixNumberSuffixRegex = /^([^-+\.,e\d]+?)?([-+]?(?:(?:\d+[\.\,]?\d*)|(?:[\.\,]\d+))(?:[eE][-+]?\d+)?)(.*?)$/;

function emptySurvey() {
  return {
    title: null,
    explanation: null,
    source: null,
    range: {
      0: null,
      1: null
    },
    step: null,
    values: [{
      label: null,
      note: null,
      value: null
    }],
    format: {
      prefix: null,
      suffix: null
    }
  };
}

function outOfValueRange(index) {
  index &= 1;
  const otherIndex = +(!index);
  const boundProps = ['left', 'right'];
  const prop = boundProps[index];
  const otherProp = boundProps[otherIndex];
  return function (value) {
    const s = this.survey;
    if (!Number.isFinite(value)) {
      value = this.defaultBounds[prop];
    }
    let otherValue = s.range[otherIndex];
    if (!Number.isFinite(otherValue)) {
      otherValue = this.defaultBounds[otherProp];
    }
    if (value <= otherValue) {
      return value <= this.range.min && otherValue >= this.range.min;
    } else {
      return value >= this.range.max && otherValue <= this.range.max;
    }
  };
}

export default {
  name: 'SurveyEditor',
  components: {
    Button,
    SurveyViewer
  },
  mixins: [validationMixin],
  props: {
    enabled: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      survey: emptySurvey(),
      showSolution: false
    };
  },
  validations() {
    return {
      survey: {
        title: {
          required
        },
        explanation: {},
        source: {},
        step: {
          number: value => !helpers.req(value) || Number.isFinite(value),
          greaterThanZero: value => !helpers.req(value) || value > 0,
          maxValue: maxValue(this.stepMax)
        },
        values: {
          required,
          minLength: minLength(1),
          $each: {
            label: {},
            note: {},
            value: {
              required
            }
          }
        },
        range: {
          0: {
            outOfValueRange: outOfValueRange(0)
          },
          1: {
            outOfValueRange: outOfValueRange(1)
          }
        },
        format: {
          prefix: {},
          suffix: {}
        }
      }
    };
  },
  computed: {
    range() {
      const values = this.survey.values.map(v => v.value);
      const range = {
        min: values.length ? Math.min.apply(null, values) : 0,
        max: values.length ? Math.max.apply(null, values) : 0
      };
      return range;
    },
    defaultBounds() {
      const { min, max } = this.range;
      const positive = (min >= 0 && max >= 0);
      const negative = (min <= 0 && max <= 0);
      let boundLeft;
      let boundRight;
      if (positive) {
        boundLeft = 0;
        boundRight = max;
      } else if (negative) {
        boundLeft = 0;
        boundRight = min;
      } else {
        const absMaxRange = Math.max(Math.abs(min), Math.abs(max));
        boundLeft = -absMaxRange;
        boundRight = absMaxRange;
      }
      const step = this.survey.step > 0 ? this.survey.step : this.defaultStep;
      const stepify = (b, s) => (~~((b * 1.5) / s) + 1) * s;
      boundLeft = boundLeft && Math.ceil((boundLeft * 1.5) / step) * step;
      boundRight = boundRight && Math.ceil((boundRight * 1.5) / step) * step;
      const bounds = {
        left: boundLeft,
        right: boundRight
      };
      return bounds;
    },
    defaultStep() {
      const s = this.survey;
      const anchor = this.anchorBound(s.range);
      return calculateStep(s.values.map(v => v.value - anchor)) || 1;
    },
    stepWarning() {
      const s = this.survey;
      if (!s.step) {
        return false;
      }
      const anchor = this.anchorBound(this.normalizedBounds);
      return s.values.some(v => !isDivisible((v.value - anchor), s.step));
    },
    stepMax() {
      const [l, r] = this.normalizedBounds;
      return Math.abs(l - r);
    },
    normalizedBounds() {
      let { 0: l, 1: r } = this.survey.range;
      l = Number.isFinite(l) ? l : this.defaultBounds.left;
      r = Number.isFinite(r) ? r : this.defaultBounds.right;
      return [l, r];
    },
    normalizedStep() {
      return this.survey.step > 0 ? this.survey.step : this.defaultStep;
    },
    normalizedSurvey() {
      return {
        ...this.survey,
        range: this.normalizedBounds,
        step: this.normalizedStep
      };
    }
  },
  mounted() {},
  methods: {
    anchorBound(range /* can be Array or Object */) {
      const l = range[0];
      const r = range[1];
      // TODO: This is kinda duplicated in Slider
      if (l <= 0 && r >= 0) { // crossing 0
        return 0;
      } else if (l < 0) { // negative
        return Math.max(
          Number.isFinite(l) ? l : r,
          Number.isFinite(r) ? r : l
        );
      } else { // positive
        return Math.min(
          Number.isFinite(l) ? l : r,
          Number.isFinite(r) ? r : l
        );
      }
    },
    reset() {
      this.survey = emptySurvey();
      this.$v.$reset();
      this.showSolution = false;
    },
    newValue(afterIndex) {
      const values = this.survey.values;
      const newIndex = (afterIndex === undefined) ? values.length : Number(afterIndex) + 1;
      values.splice(newIndex, 0, { label: null, note: null, value: null });
      this.$nextTick(function () {
        const el = this.$refs.surveyValuesInputs[newIndex];
        if (el && typeof el.focus === 'function') {
          el.focus();
        }
      });
    },
    valueInput(event) {
      const key = event.key || '';
      const input = event.target;
      const prop = input.value.length ? 'prefix' : 'suffix';
      if (!key.match(/[0-9eE.,+-]/)) {
        this.survey.format[prop] = (this.survey.format[prop] || '') + key;
        event.stopPropagation();
        event.preventDefault();
      }
    },
    submit() {
      if (this.$v.survey.$invalid) {
        this.$v.survey.$touch();
        scrollTo(0, 0);
        return;
      }
      this.$emit('input', cloneDeep(this.normalizedSurvey), this.reset);
    }
  }
};
</script>

<style lang="less">
@import '~assets/stylesheets/config/colors';
@import '~assets/stylesheets/form/labels';
@import '~assets/stylesheets/form/input';

.approxi-editor {
  // font-size: 1em;
  // line-height: 1.2;
  color: @gray;
  text-rendering: optimizeLegibility;
}
</style>
