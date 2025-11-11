import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import seedProducts from './seed/seedProducts';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const server = http.createServer(app);

async function start() {
  try {
    await connectDB();
    const result = await seedProducts();
    // One-time startup seed completion log
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: 'info',
        event: 'startup_seed_complete',
        inserted: result.inserted,
        matched: result.matched,
        total: result.afterCount,
      })
    );

    server.listen(PORT, () => {
      // Health endpoint (T036) will make Docker healthcheck pass
      // eslint-disable-next-line no-console
      console.log(`[startup] backend listening on port ${PORT}`);
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: 'error',
        event: 'startup_error',
        message: err?.message || String(err),
      })
    );
    process.exit(1);
  }
}

// Kick off startup
void start();

export default server;
