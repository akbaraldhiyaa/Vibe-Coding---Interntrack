/**
 * PHASE 16: Database state inspection after failed Google onboarding attempts.
 * Reports only SAFE metadata. No tokens, passwords, hashes, or emails printed.
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("=== PHASE 16: DATABASE STATE AFTER FAILURE ===\n");

  // Total Users
  const userCount = await prisma.user.count();
  console.log(`Total Users: ${userCount} (migrated baseline was 6)`);

  // Users with NO username (Google-registered users have no username)
  const usersWithNoUsername = await prisma.user.count({ where: { username: null } });
  console.log(`Users with null username (Google-style): ${usersWithNoUsername}`);

  // Users with NO password (Google-only users)
  const usersWithNoPassword = await prisma.user.count({ where: { password: null } });
  console.log(`Users with null password (Google-only): ${usersWithNoPassword}`);

  // Users with null institution (not yet fully onboarded in new system)
  const usersWithNoInstitution = await prisma.user.count({ where: { institution: null } });
  console.log(`Users with null institution (incomplete onboarding): ${usersWithNoInstitution}`);

  // Total LinkedAccounts
  const linkedCount = await prisma.linkedAccount.count();
  console.log(`\nTotal LinkedAccounts: ${linkedCount} (baseline was 1)`);

  // Orphaned LinkedAccounts (pointing to non-existent user)
  const allLinked = await prisma.linkedAccount.findMany({ select: { userId: true, provider: true } });
  let orphanCount = 0;
  for (const la of allLinked) {
    const userExists = await prisma.user.count({ where: { id: la.userId } });
    if (!userExists) orphanCount++;
  }
  console.log(`Orphaned LinkedAccounts: ${orphanCount}`);

  // Users with no linked account and no password (fully orphaned Google attempts)
  const usersWithNeitherPasswordNorLinked = await prisma.$queryRaw<Array<{cnt: bigint}>>`
    SELECT COUNT(*) as cnt FROM "User" u
    WHERE u.password IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM "LinkedAccount" la WHERE la."userId" = u.id
    )
  `;
  console.log(`Users with no password AND no LinkedAccount: ${Number(usersWithNeitherPasswordNorLinked[0].cnt)}`);

  // Check for duplicate emails
  const dupeEmails = await prisma.$queryRaw<Array<{email: string, cnt: bigint}>>`
    SELECT email, COUNT(*) as cnt FROM "User" GROUP BY email HAVING COUNT(*) > 1
  `;
  console.log(`\nDuplicate email groups: ${dupeEmails.length} (expected 0)`);

  // Verify username constraint: check for any NULLs in username column specifically for new users
  const usernameNull = await prisma.$queryRaw<Array<{cnt: bigint}>>`
    SELECT COUNT(*) as cnt FROM "User" WHERE username IS NULL
  `;
  console.log(`Users WHERE username IS NULL: ${Number(usernameNull[0].cnt)}`);

  // The CRITICAL check: does the User_username_key index allow multiple NULLs?
  // PostgreSQL's standard UNIQUE index ignores NULLs (each NULL is distinct).
  // This means multiple Google users (all with username=null) CAN coexist.
  // SQLite was different (may treat NULLs as duplicates in some versions).
  console.log(`\nPostgreSQL NULL-in-UNIQUE behavior: each NULL is treated as DISTINCT`);
  console.log(`→ username=null UNIQUE constraint is NOT the cause of P2002 in Postgres\n`);

  // Check Student.nisn uniqueness - Google onboarding also creates Student records
  const students = await prisma.student.findMany({ select: { nisn: true, email: true } });
  console.log(`Total Students: ${students.length} (baseline was 3)`);

  // Student.nisn is @unique - if the idNumber submitted is a duplicate NISN, it fails with P2002
  const nisnGroups = await prisma.$queryRaw<Array<{nisn: string, cnt: bigint}>>`
    SELECT nisn, COUNT(*) as cnt FROM "Student" GROUP BY nisn HAVING COUNT(*) > 1
  `;
  console.log(`Duplicate NISN groups in Student: ${nisnGroups.length}`);

  // Count students with no email (migrated ones with no email)
  const studentsNoEmail = await prisma.student.count({ where: { email: null } });
  console.log(`Students with null email: ${studentsNoEmail}`);

  console.log("\n=== SUMMARY ===");
  console.log(`Users added beyond baseline: ${userCount - 6}`);
  console.log(`LinkedAccounts added beyond baseline: ${linkedCount - 1}`);
  console.log(`Students added beyond baseline: ${students.length - 3}`);
}

main().catch(e => console.error("Script error:", e)).finally(() => prisma.$disconnect());
