import { build } from '../app.js';
// automatically build and tear down our instance
async function buildApp(t) {
  const app = await build();

  // tear down our app after we are done
  t.after(() => {
    app.close();
    process.exit(0);
  });

  return app;
}

export { buildApp };
