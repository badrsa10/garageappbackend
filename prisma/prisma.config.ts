// export default {
//   datasources: {
//     db: {
//       adapter: {
//         url: process.env.DATABASE_URL, // ta connexion Postgres
//       },
//       // ou accelerateUrl: process.env.ACCELERATE_URL si tu utilises Accelerate
//     },
//   },
// };

import 'dotenv/config'
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: './schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: `tsx prisma/seed.ts`,
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});