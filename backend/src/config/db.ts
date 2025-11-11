import mongoose from 'mongoose';

export async function connectDB(uri?: string) {
  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog';

  try {
    const conn = await mongoose.connect(mongoUri);
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({ ts: new Date().toISOString(), level: 'info', event: 'db_connect_success', uri: sanitizeUri(mongoUri) })
    );
    return conn;
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({ ts: new Date().toISOString(), level: 'error', event: 'db_connect_error', message: err?.message })
    );
    throw err;
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
}

function sanitizeUri(uri: string) {
  try {
    const u = new URL(uri);
    if (u.password) u.password = '****';
    if (u.username) u.username = '****';
    return u.toString();
  } catch {
    return uri;
  }
}
