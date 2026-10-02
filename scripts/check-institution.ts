import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  // Check actual institution values without exposing emails
  const users = await prisma.user.findMany({
    select: { institution: true, role: true }
  });
  console.log("Institution values across all users:");
  users.forEach((u, i) => {
    console.log(`  User ${i+1}: institution="${u.institution}", role="${u.role}"`);
  });
}
main().finally(() => prisma.$disconnect());
