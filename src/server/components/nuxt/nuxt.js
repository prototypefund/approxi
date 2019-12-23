import { Nuxt, Builder } from 'nuxt';

export default () => ({
  async start({ nuxt: { config }, app }) {
    const nuxt = new Nuxt(config);
    await nuxt.ready();
    if (nuxt.options.dev) {
      new Builder(nuxt).build();
    }
    app.use(nuxt.render);
  }
});
