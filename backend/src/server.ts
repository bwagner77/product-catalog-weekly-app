import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import seedProducts from './seed/seedProducts';
import seedCategories from './seed/seedCategories';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const server = http.createServer(app);

async function start() {
  try {
    await connectDB();
  const catResult = await seedCategories();
  const result = await seedProducts();
    // One-time startup seed completion log
    // eslint-disable-next-line no-console
      console.log(
        JSON.stringify({
          ts: new Date().toISOString(),
          level: 'info',
          event: 'startup_seed_complete',
          productsInserted: result.inserted,
          productsMatched: result.matched,
          productsTotal: result.afterCount,
          categoriesInserted: catResult.inserted,
          categoriesMatched: catResult.matched,
          categoriesTotal: catResult.afterCount,
        })
      );

    server.listen(PORT, () => {
      // Health endpoint (T036) will make Docker healthcheck pass
      // eslint-disable-next-line no-console
      console.log(`[startup] backend listening on port ${PORT}`);
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: 'error',
        event: 'startup_error',
        message,
      })
    );
    process.exit(1);
  }
}

// Kick off startup
void start();

export default server;
