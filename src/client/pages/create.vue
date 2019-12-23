<template>
  <div>
    <survey-editor
      v-if="!lastSavedId"
      :enabled="!loading"
      @input="submit"
    />
    <section
      v-if="lastSavedId"
      class="approxi-section"
    >
      <h3>Gespeichert! Deine Umfrage ist jetzt erreichbar unter:</h3>
      <nuxt-link
        :to="`/view/${lastSavedId}`"
        class="approxi-create__survey-link"
        target="_blank"
      >
        {{ origin() }}/view/<span class="approxi-create__survey-link__id">{{ lastSavedId }}</span>
      </nuxt-link>
      <button
        is="Button"
        caption="Nächste Umfrage erstellen"
        :wide="true"
        @input="reset"
      />
    </section>
    <section
      v-if="createdSurveys.length"
      class="approxi-section"
    >
      <h3 style="margin-top: 0">
        Deine Umfragen:
      </h3>
      <ul>
        <li
          v-for="survey in createdSurveys"
          :key="survey.id"
        >
          <nuxt-link
            target="_blank"
            :to="`/view/${survey.id}`"
          >
            {{ survey.title }}
          </nuxt-link>
        </li>
      </ul>
    </section>
    <section
      v-if="createdSurveys.length"
      class="approxi-section"
    >
      <h3 style="margin-top: 0">
        Verknüpfe deine Umfragen einfach mit folgendem Link-Schema:
      </h3>
      <p class="approxi-create__survey-link">
        {{ origin() }}/view/
        <template v-for="survey in createdSurveys">
          <span
            :key="`id-${survey.id}`"
            class="approxi-create__survey-link__id"
          >
            {{ survey.id }}
          </span>
          <span
            :key="`sep-${survey.id}`"
            class="approxi-create__survey-link__separator"
          >
            ,
          </span>
        </template>
        <span class="approxi-create__survey-link__id approxi-create__survey-link__id--next">nächste ID</span>
      </p>
    </section>
  </div>
</template>

<script>
import Button from '@/components/Button.vue';
import SurveyEditor from '@/components/SurveyEditor.vue';

export default {
  components: {
    Button,
    SurveyEditor
  },
  data() {
    return {
      createdSurveys: [],
      loading: false,
      lastSavedId: null
    };
  },
  methods: {
    async submit(survey, reset) {
      this.loading = true;
      try {
        const { data: { id } } = await this.$axios.post('surveys', survey);
        if (id) {
          this.createdSurveys.push({ ...survey, id });
          this.lastSavedId = id;
        }
        reset();
      } catch (error) {
        alert(error);
      }
      this.loading = false;
    },
    origin() {
      return window.location.origin;
    },
    reset() {
      this.lastSavedId = null;
      scrollTo(0, 0);
    }
  },
  head() {
    return {
      title: 'Editor'
    };
  }
};
</script>

<style lang="less">
@import '~assets/stylesheets/config/colors';

.approxi-create__survey-link {
  word-break: break-all;
  overflow-wrap: anywhere;
  color: @silver;

  &__id {
    display: inline-block;
    padding: 0 0.2em;
    border: 1px solid @secondary-color;
    font-style: italic;
    color: @secondary-color;

    &--next {
      border-color: @silver;
      color: @silver;
    }
  }

  &__separator {
    display: inline-block;
    padding: 0 0.2em;
    color: @primary-color;
  }
}
</style>
