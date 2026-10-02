import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  // Safe: print only non-identifying data
  const students = await prisma.student.findMany({
    select: { nisn: true, department: true, stage: true, status: true }
  });
  console.log("Existing Student NISNs (anonymized):");
  students.forEach((s, i) => {
    const masked = s.nisn ? s.nisn.slice(0, 3) + '*'.repeat(Math.max(0, s.nisn.length - 3)) : 'null';
    console.log(`  Student ${i+1}: NISN=${masked}, dept=${s.department}, stage=${s.stage}`);
  });
  console.log(`\nTotal students: ${students.length}`);
  
  // Check for any incomplete Google registrations
  // (User created but no LinkedAccount, or LinkedAccount but no institution)
  const orphanedGoogleUsers = await prisma.$queryRaw<Array<{cnt: bigint}>>`
    SELECT COUNT(*) as cnt FROM "User" u
    WHERE u.institution = 'SMKN 3 Jakarta'
    AND u.password IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM "LinkedAccount" la WHERE la."userId" = u.id
    )
  `;
  console.log(`\nPartial registrations (User w/SMKN3, no password, no LinkedAccount): ${Number(orphanedGoogleUsers[0].cnt)}`);
  
  const userCount = await prisma.user.count();
  const linkedCount = await prisma.linkedAccount.count();
  console.log(`\nFinal counts:`);
  console.log(`  Users: ${userCount}`);
  console.log(`  LinkedAccounts: ${linkedCount}`);
  console.log(`  Delta from baseline (6 users, 1 linked): users+${userCount-6}, linked+${linkedCount-1}`);
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
