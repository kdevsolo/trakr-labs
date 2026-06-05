import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { DEFAULT_STATUSES } from '../src/common/constants/default-statuses';

export const ORG_SCOPED_RESOURCES = ['USER', 'PROJECT'] as const;
export const PROJECT_SCOPED_RESOURCES = [
  'ISSUE',
  'COMMENT',
  'ISSUE_MEDIA',
] as const;

const pool = new Pool({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  // Permission resources/actions are Prisma enums — no DB seed rows needed.
  // This script is a no-op unless extended for demo data.
  console.log('Seed complete: permission catalog uses Prisma enums.');
  console.log('Default statuses for new orgs:', DEFAULT_STATUSES.map((s) => s.title).join(', '));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
