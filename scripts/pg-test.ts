import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const test = await prisma.$queryRaw`SELECT 1 as result`;
    console.log("Postgres connectivity: OK", test);

    const tables = [
      'User', 'LinkedAccount', 'PendingRegistration', 'PasswordResetToken',
      'Dudi', 'Student', 'AttendanceRecord', 'Journal', 'Evaluation'
    ];
    console.log("\nRow counts in Postgres:");
    for (const t of tables) {
      const countRes: any = await prisma.$queryRawUnsafe(`SELECT count(*) FROM "${t}"`);
      console.log(`${t}: ${Number(countRes[0].count)}`);
    }

  } catch(e) {
    console.error("Connectivity error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
