<template>
  <SurveyViewer
    :survey="survey"
    :stats="stats"
    :enabled="!loading"
    :show-next="playlist && playlist.length"
    :sticky-header="true"
    :show-footer="true"
    @input="submit"
    @next="loadNext"
  />
</template>

<script>
import io from 'socket.io-client';
import SurveyViewer from '@/components/SurveyViewer.vue';

const surveyIdRegEx = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}(?:,[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})*$/;

export default {
  components: {
    SurveyViewer
  },
  validate({ params: { id } }) {
    return surveyIdRegEx.test(id);
  },
  layout: 'view-id',
  async asyncData({ params, $axios }) {
    const playlist = params.id.split(',');
    const sid = playlist.shift();
    const survey = await $axios.$get(`https://approxi.appspot.com/api/surveys/${sid}`);
    return {
      survey,
      playlist
    };
  },
  data() {
    return {
      survey: null,
      loading: false,
      playlist: null,
      socket: null,
      stats: null,
      submitted: false
    };
  },
  beforeRouteUpdate(to, from, next) {
    this.disconnectSocket();
    next();
  },
  beforeRouteLeave(to, from, next) {
    this.disconnectSocket();
    next();
  },
  mounted() {
    const [hidden, visibilityChange] =
      typeof document.hidden !== 'undefined' ? ['hidden', 'visibilitychange']
        : typeof document.msHidden !== 'undefined' ? ['msHidden', 'msvisibilitychange']
          : typeof document.webkitHidden !== 'undefined' ? ['webkitHidden', 'webkitvisibilitychange']
            : [];
    if (hidden && visibilityChange) {
      document.addEventListener(visibilityChange, () => {
        if (document[hidden]) {
          this.disconnectSocket();
        } else {
          this.connectSocket();
        }
      }, false);
    }
  },
  methods: {
    deactivated() {
      this.disconnectSocket();
    },
    beforeDestroy() {
      this.disconnectSocket();
    },
    connectSocket() {
      if (this.survey && this.submitted) {
        this.socket = io('/surveys/stats', { transports: ['websocket'] });
        // on reconnection, reset the transports option, as the Websocket
        // connection may have failed (caused by proxy, firewall, browser, ...)
        this.socket.on('reconnect_attempt', () => { this.socket.io.opts.transports = ['polling', 'websocket']; });
        this.socket.on('connect', () => { this.socket.emit('join', this.survey.id); });
        this.socket.on('change', stats => { this.stats = stats; });
      }
    },
    disconnectSocket() {
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
    },
    async loadNext() {
      if (!this.playlist.length) {
        return;
      }
      const sid = this.playlist.shift();
      if (!sid || !sid.length) {
        return;
      }
      this.disconnectSocket();
      this.loading = true;
      try {
        this.survey = await this.$axios.$get(`https://approxi.appspot.com/api/surveys/${sid}`);
        this.submitted = false;
      } catch (error) {
        alert(error);
      }
      this.loading = false;
    },
    async submit(values) {
      this.loading = true;
      try {
        this.stats = await this.$axios.$post(`https://approxi.appspot.com/api/surveys/${this.survey.id}/feed`, {
          id: this.survey.id,
          values
        });
        this.submitted = true;
        this.connectSocket();
      } catch (error) {
        alert(error);
      }
      this.loading = false;
    }
  },
  head() {
    return {
      title: this.survey.title
    };
  }
};
</script>
