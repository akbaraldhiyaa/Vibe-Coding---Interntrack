import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Default Users (Roles)
  const admin = await prisma.user.upsert({
    where: { email: "admin@smkn3.sch.id" },
    update: {},
    create: {
      fullName: "Admin Hubin SMKN 3",
      email: "admin@smkn3.sch.id",
      password: "password123",
      role: "Admin",
    },
  });

  const dudi1 = await prisma.dudi.upsert({
    where: { name: "PT Bangun Bangsa Nusantara" },
    update: {},
    create: {
      name: "PT Bangun Bangsa Nusantara",
      address: "Jl. Sudirman No. 12, Jakarta",
      industrySupervisor: "Bpk. Budi Santoso",
      quota: 5,
    },
  });

  const student1 = await prisma.student.upsert({
    where: { nisn: "0051234567" },
    update: {},
    create: {
      nisn: "0051234567",
      name: "Muhammad Farhan",
      class: "XII RPL 1",
      department: "Rekayasa Perangkat Lunak",
      stage: "Pelaksanaan (DUDI)",
      dudiId: dudi1.id,
      schoolSupervisor: "Ibu Ratna, S.Kom",
      industrySupervisor: dudi1.industrySupervisor,
    },
  });

  await prisma.user.upsert({
    where: { email: "farhan@student.smkn3.sch.id" },
    update: {},
    create: {
      fullName: "Muhammad Farhan",
      email: "farhan@student.smkn3.sch.id",
      password: "password123",
      role: "Siswa",
    },
  });

  console.log("Seeding finished!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
