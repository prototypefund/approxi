import linkifyStr from 'linkifyjs/string';
import Vue from 'vue';

const attributes = href => ({
  title: href,
  rel: 'ugc'
});

const url = urlString => {
  try {
    const url = new URL(urlString);
    return url.hostname.replace(/^www\d*\./, '');
  } catch {
    return urlString;
  }
};

const options = {
  attributes,
  className: null,
  format: {
    url
  }
};

const linkify = value => linkifyStr(value, options);

Vue.filter('linkify', linkify);
