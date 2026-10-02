import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log("=== PENDING REGISTRATION AUDIT ===");
    const pending = await prisma.pendingRegistration.findMany();
    const now = new Date();
    for (const p of pending) {
      const parts = p.email.split('@');
      const domain = parts.length > 1 ? parts[1] : 'unknown';
      const status = p.expiresAt > now ? 'VALID' : 'EXPIRED';
      console.log(`- Domain: @${domain} | Created: ${p.createdAt.toISOString()} | Expires: ${p.expiresAt.toISOString()} | Status: ${status}`);
    }

    console.log("\n=== AVATAR AUDIT ===");
    const users = await prisma.user.findMany({
      where: { avatar: { not: null } },
      select: { avatar: true }
    });
    
    let publicUploadsCount = 0;
    for (const u of users) {
      if (u.avatar && u.avatar.includes('/uploads/avatars')) {
        publicUploadsCount++;
      }
    }
    console.log(`Users with avatar values: ${users.length}`);
    console.log(`Users with avatars pointing to /uploads/avatars: ${publicUploadsCount}`);
  } catch (error) {
    console.error("Error during audit:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
