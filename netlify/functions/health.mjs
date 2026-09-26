import { neon } from '@neondatabase/serverless';

export default async () => {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ ok: false, database: false, error: 'DATABASE_URL is not configured' }, { status: 503 });
    }
    const sql = neon(process.env.DATABASE_URL);
    await sql`SELECT 1`;
    return Response.json({ ok: true, database: true });
  } catch (error) {
    console.error(error);
    return Response.json({ ok: false, database: false }, { status: 500 });
  }
};

export const config = { path: '/api/health' };
