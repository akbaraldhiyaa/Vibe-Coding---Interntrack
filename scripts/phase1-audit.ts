import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log("=== INTERNTRACK PHASE 1 DATABASE AUDIT ===");

  // 1. Locate the SQLite database
  const possiblePaths = [
    path.join(process.cwd(), 'prisma', 'dev.db'),
    path.join(process.cwd(), 'dev.db')
  ];

  let dbPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      dbPath = p;
      break;
    }
  }

  if (!dbPath) {
    console.error("❌ ERROR: SQLite database file (dev.db) not found!");
    process.exit(1);
  }

  console.log(`Database located at: ${dbPath}`);

  // 2. Create a timestamped backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.dirname(dbPath);
  const backupFileName = `dev.db.backup.${timestamp}`;
  const backupPath = path.join(backupDir, backupFileName);

  try {
    fs.copyFileSync(dbPath, backupPath, fs.constants.COPYFILE_EXCL);
    console.log(`Backup created:\n${backupPath}`);
  } catch (err) {
    console.error(`❌ ERROR creating backup: ${err}`);
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    console.log("\n=== ROW COUNTS ===");
    // Read table names and row counts dynamically from SQLite
    const tables: any = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations';`;
    
    for (const table of tables) {
      const tableName = table.name;
      // We have to use raw query because we're iterating string table names
      const countResult: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${tableName}"`);
      // Prisma returns BigInt for count in some adapters, so handle it
      const count = Number(countResult[0].count);
      console.log(`${tableName} -> ${count}`);
    }

    console.log("\n=== INTEGRITY CHECKS ===");
    
    // Check duplicate emails
    const duplicateEmails: any = await prisma.$queryRaw`SELECT email, COUNT(*) as count FROM "User" GROUP BY email HAVING count > 1`;
    if (duplicateEmails.length > 0) {
      console.log("Email uniqueness: FAIL");
      for (const row of duplicateEmails) {
        console.log(`  Duplicate email: ${row.email} (Count: ${Number(row.count)})`);
      }
    } else {
      console.log("Email uniqueness: PASS");
    }

    // Check duplicate usernames
    const duplicateUsernames: any = await prisma.$queryRaw`SELECT username, COUNT(*) as count FROM "User" WHERE username IS NOT NULL GROUP BY username HAVING count > 1`;
    if (duplicateUsernames.length > 0) {
      console.log("Username uniqueness: FAIL");
      for (const row of duplicateUsernames) {
        console.log(`  Duplicate username: ${row.username} (Count: ${Number(row.count)})`);
      }
    } else {
      console.log("Username uniqueness: PASS");
    }

  } catch (error) {
    console.error("\n❌ ERROR during audit queries:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
    console.log("\n=== AUDIT COMPLETE ===");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
