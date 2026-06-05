"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROJECT_SCOPED_RESOURCES = exports.ORG_SCOPED_RESOURCES = exports.DEFAULT_STATUSES = void 0;
require("dotenv/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const client_1 = require("../src/generated/prisma/client");
exports.DEFAULT_STATUSES = [
    { title: 'Open', sortOrder: 0 },
    { title: 'In Progress', sortOrder: 1 },
    { title: 'Done', sortOrder: 2 },
];
exports.ORG_SCOPED_RESOURCES = ['USER', 'PROJECT'];
exports.PROJECT_SCOPED_RESOURCES = [
    'ISSUE',
    'COMMENT',
    'ISSUE_MEDIA',
];
const pool = new pg_1.Pool({
    connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new client_1.PrismaClient({ adapter: new adapter_pg_1.PrismaPg(pool) });
async function main() {
    console.log('Seed complete: permission catalog uses Prisma enums.');
    console.log('Default statuses for new orgs:', exports.DEFAULT_STATUSES.map((s) => s.title).join(', '));
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
//# sourceMappingURL=seed.js.map