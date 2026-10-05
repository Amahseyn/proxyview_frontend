import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const TEST_DB_URL = 'file:../data/test.db';

export default async function globalSetup() {
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  execSync('npx prisma migrate deploy', {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: TEST_DB_URL },
    stdio: 'inherit',
  });
}
