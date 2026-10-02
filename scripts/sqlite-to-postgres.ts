import Database from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';

async function main() {
  const db = new Database('prisma/dev.db', { readonly: true });
  const prisma = new PrismaClient();

  try {
    console.log("=== INTERNTRACK SQLITE TO POSTGRES MIGRATION ===");
    
    // Phase 2 - Target verify
    const counts = {
      user: await prisma.user.count(),
      linkedAccount: await prisma.linkedAccount.count(),
      dudi: await prisma.dudi.count(),
      student: await prisma.student.count(),
      attendance: await prisma.attendanceRecord.count(),
      journal: await prisma.journal.count(),
      evaluation: await prisma.evaluation.count(),
      pendingReg: await prisma.pendingRegistration.count()
    };
    
    const targetTotal = Object.values(counts).reduce((a: number, b: number) => a + b, 0);
    if (targetTotal > 0) {
      console.error("❌ ERROR: Target Postgres DB is NOT empty!", counts);
      process.exit(1);
    }
    
    console.log("✅ Target PostgreSQL pre-flight checks passed (0 rows).");

    // Phase 1 - Source verify
    const sUsers = db.prepare('SELECT * FROM User').all() as any[];
    const sDudis = db.prepare('SELECT * FROM Dudi').all() as any[];
    const sStudents = db.prepare('SELECT * FROM Student').all() as any[];
    const sAttendances = db.prepare('SELECT * FROM AttendanceRecord').all() as any[];
    const sJournals = db.prepare('SELECT * FROM Journal').all() as any[];
    const sEvaluations = db.prepare('SELECT * FROM Evaluation').all() as any[];
    const sLinkedAccounts = db.prepare('SELECT * FROM LinkedAccount').all() as any[];
    const sPendingRegs = db.prepare('SELECT * FROM PendingRegistration').all() as any[];

    console.log(`\nSource SQLite row counts:
    User: ${sUsers.length} (Expected 6)
    Dudi: ${sDudis.length} (Expected 1)
    Student: ${sStudents.length} (Expected 3)
    AttendanceRecord: ${sAttendances.length} (Expected 1)
    Journal: ${sJournals.length} (Expected 2)
    Evaluation: ${sEvaluations.length} (Expected 1)
    LinkedAccount: ${sLinkedAccounts.length} (Expected 1)
    PendingRegistration: ${sPendingRegs.length} (Expected 3)
    `);

    if (
      sUsers.length !== 6 || sDudis.length !== 1 || sStudents.length !== 3 ||
      sAttendances.length !== 1 || sJournals.length !== 2 || sEvaluations.length !== 1 ||
      sLinkedAccounts.length !== 1 || sPendingRegs.length !== 3
    ) {
      console.error("❌ ERROR: Source row counts DO NOT MATCH expected baseline.");
      process.exit(1);
    }
    console.log("✅ Source baseline verified.");

    // Phase 4, 12 - Migrate inside a transaction
    await prisma.$transaction(async (tx) => {
      console.log("\n--- MIGRATING DATA ---");
      
      // 1. User
      for (const u of sUsers) {
        await tx.user.create({
          data: {
            id: u.id,
            username: u.username,
            fullName: u.fullName,
            email: u.email,
            password: u.password,
            role: u.role,
            whatsapp: u.whatsapp,
            institution: u.institution,
            department: u.department,
            notificationEmail: Boolean(u.notificationEmail),
            weeklySummary: Boolean(u.weeklySummary),
            createdAt: new Date(u.createdAt),
            updatedAt: new Date(u.updatedAt),
            avatar: u.avatar
          }
        });
      }
      console.log(`✅ Users migrated (${sUsers.length})`);

      // 2. Dudi
      for (const d of sDudis) {
        await tx.dudi.create({
          data: {
            id: d.id,
            name: d.name,
            address: d.address,
            industrySupervisor: d.industrySupervisor,
            quota: d.quota,
            qrCode: d.qrCode,
            createdAt: new Date(d.createdAt),
            updatedAt: new Date(d.updatedAt)
          }
        });
      }
      console.log(`✅ Dudis migrated (${sDudis.length})`);

      // 3. Student
      for (const s of sStudents) {
        await tx.student.create({
          data: {
            id: s.id,
            nisn: s.nisn,
            name: s.name,
            class: s.class,
            department: s.department,
            dudiId: s.dudiId,
            schoolSupervisor: s.schoolSupervisor,
            industrySupervisor: s.industrySupervisor,
            stage: s.stage,
            status: s.status,
            avatar: s.avatar,
            whatsapp: s.whatsapp,
            email: s.email,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt)
          }
        });
      }
      console.log(`✅ Students migrated (${sStudents.length})`);

      // 4. AttendanceRecord
      for (const a of sAttendances) {
        await tx.attendanceRecord.create({
          data: {
            id: a.id,
            studentId: a.studentId,
            date: a.date,
            timeIn: a.timeIn,
            timeOut: a.timeOut,
            status: a.status,
            correctionNote: a.correctionNote,
            createdAt: new Date(a.createdAt),
            updatedAt: new Date(a.updatedAt)
          }
        });
      }
      console.log(`✅ AttendanceRecords migrated (${sAttendances.length})`);

      // 5. Journal
      for (const j of sJournals) {
        await tx.journal.create({
          data: {
            id: j.id,
            studentId: j.studentId,
            date: j.date,
            activity: j.activity,
            description: j.description,
            status: j.status,
            image: j.image,
            feedback: j.feedback,
            createdAt: new Date(j.createdAt),
            updatedAt: new Date(j.updatedAt)
          }
        });
      }
      console.log(`✅ Journals migrated (${sJournals.length})`);

      // 6. Evaluation
      for (const e of sEvaluations) {
        await tx.evaluation.create({
          data: {
            id: e.id,
            studentId: e.studentId,
            technicalScore: e.technicalScore,
            nonTechnicalScore: e.nonTechnicalScore,
            finalScore: e.finalScore,
            certificateNumber: e.certificateNumber,
            notes: e.notes,
            createdAt: new Date(e.createdAt),
            updatedAt: new Date(e.updatedAt)
          }
        });
      }
      console.log(`✅ Evaluations migrated (${sEvaluations.length})`);

      // 7. LinkedAccount
      for (const l of sLinkedAccounts) {
        await tx.linkedAccount.create({
          data: {
            id: l.id,
            userId: l.userId,
            provider: l.provider,
            providerAccountId: l.providerAccountId,
            createdAt: new Date(l.createdAt)
          }
        });
      }
      console.log(`✅ LinkedAccounts migrated (${sLinkedAccounts.length})`);

      // 8. PendingRegistration
      let pendingSkipped = 0;
      let pendingMigrated = 0;
      const now = new Date();
      for (const p of sPendingRegs) {
        const expiresAt = new Date(p.expiresAt);
        if (expiresAt < now) {
          pendingSkipped++;
          continue;
        }
        await tx.pendingRegistration.create({
          data: {
            id: p.id,
            email: p.email,
            username: p.username,
            fullName: p.fullName,
            password: p.password,
            role: p.role,
            otpHash: p.otpHash,
            attempts: p.attempts,
            expiresAt: expiresAt,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt)
          }
        });
        pendingMigrated++;
      }
      console.log(`✅ PendingRegistration: Migrated (${pendingMigrated}), Skipped expired (${pendingSkipped})`);
    });

    console.log("\n✅ TRANSACTION COMPLETE. ALL DATA MIGRATED SAFELY.");
  } catch (error) {
    console.error("❌ MIGRATION FAILED. Transaction rolled back.", error);
    process.exit(1);
  } finally {
    db.close();
    await prisma.$disconnect();
  }
}

main();
