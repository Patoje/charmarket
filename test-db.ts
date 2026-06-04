import { db } from './src/lib/db';
import { sql } from 'drizzle-orm';
async function main() {
  const cols = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'products'`);
  console.log(cols.rows);
}
main();
