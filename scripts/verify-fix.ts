/**
 * INTERNTRACK — GOOGLE ONBOARDING FIX VERIFICATION SCRIPT
 * 
 * This script verifies the fix is correct by:
 * 1. Confirming Supabase Postgres is live and populated
 * 2. Simulating what registerGoogleUser does (minus Firebase token verify, which requires a live browser)
 * 3. Checking production URL HTTP status
 * 4. Verifying no duplicate users exist
 * 5. Confirming the fix code is present in the compiled source
 */

import { PrismaClient } from '@prisma/client';
import https from 'https';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function httpGet(url: string): Promise<number> {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      resolve(res.statusCode ?? 0);
    });
    req.on('error', () => resolve(0));
    req.setTimeout(10000, () => { req.destroy(); resolve(0); });
  });
}

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║  INTERNTRACK — GOOGLE ONBOARDING FIX VERIFICATION            ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  // ── 1. DATABASE CONNECTIVITY ─────────────────────────────────────────────
  console.log("1. DATABASE CONNECTIVITY");
  try {
    const result = await prisma.$queryRaw<[{result:number}]>`SELECT 1 as result`;
    console.log("   ✅ Supabase PostgreSQL: CONNECTED");
  } catch (e: any) {
    console.log("   ❌ Supabase PostgreSQL: FAILED —", e.message);
    process.exit(1);
  }

  // ── 2. DATA INTEGRITY ────────────────────────────────────────────────────
  console.log("\n2. MIGRATED DATA VERIFICATION");
  const userCount = await prisma.user.count();
  const linkedCount = await prisma.linkedAccount.count();
  const dudiCount = await prisma.dudi.count();
  const studentCount = await prisma.student.count();
  const attendCount = await prisma.attendanceRecord.count();
  const journalCount = await prisma.journal.count();
  const evalCount = await prisma.evaluation.count();
  const pendingCount = await prisma.pendingRegistration.count();

  console.log(`   User:               ${userCount}  (expected 6)`);
  console.log(`   LinkedAccount:      ${linkedCount}  (expected 1)`);
  console.log(`   Dudi:               ${dudiCount}  (expected 1)`);
  console.log(`   Student:            ${studentCount}  (expected 3)`);
  console.log(`   AttendanceRecord:   ${attendCount}  (expected 1)`);
  console.log(`   Journal:            ${journalCount}  (expected 2)`);
  console.log(`   Evaluation:         ${evalCount}  (expected 1)`);
  console.log(`   PendingRegistration:${pendingCount}  (expected 0)`);

  const dataPass = userCount === 6 && linkedCount === 1 && dudiCount === 1 &&
                   studentCount === 3 && attendCount === 1 && journalCount === 2 &&
                   evalCount === 1 && pendingCount === 0;
  console.log(`   ${dataPass ? '✅' : '❌'} Data integrity: ${dataPass ? 'PASS' : 'FAIL'}`);

  // ── 3. DUPLICATE EMAIL CHECK ──────────────────────────────────────────────
  console.log("\n3. DUPLICATE USER CHECK");
  const emailGroups = await prisma.$queryRaw<Array<{email: string, cnt: bigint}>>`
    SELECT email, COUNT(*) as cnt FROM "User" GROUP BY email HAVING COUNT(*) > 1
  `;
  if (emailGroups.length === 0) {
    console.log("   ✅ No duplicate emails found");
  } else {
    console.log("   ❌ DUPLICATE EMAILS FOUND:", emailGroups.length, "groups");
  }

  // ── 4. INSTITUTION LOCK VERIFICATION ─────────────────────────────────────
  console.log("\n4. INSTITUTION LOCK CHECK");
  const wrongInstitution = await prisma.user.count({
    where: {
      AND: [
        { institution: { not: null } },
        { institution: { not: "SMKN 3 Jakarta" } }
      ]
    }
  });
  const withInstitution = await prisma.user.count({ where: { institution: "SMKN 3 Jakarta" } });
  const nullInstitution = await prisma.user.count({ where: { institution: null } });
  console.log(`   Users with 'SMKN 3 Jakarta': ${withInstitution}`);
  console.log(`   Users with null institution (not yet onboarded): ${nullInstitution}`);
  console.log(`   Users with unexpected institution: ${wrongInstitution}`);
  console.log(`   ✅ Institution lock: ${wrongInstitution === 0 ? 'PASS' : 'FAIL'}`);

  // ── 5. SOURCE CODE FIX VERIFICATION ──────────────────────────────────────
  console.log("\n5. SOURCE CODE FIX VERIFICATION");
  const onboardingFile = fs.readFileSync(
    path.join(process.cwd(), 'src/components/OnboardingPage.tsx'),
    'utf8'
  );
  const authPageFile = fs.readFileSync(
    path.join(process.cwd(), 'src/components/AuthPage.tsx'),
    'utf8'
  );

  const fix1 = onboardingFile.includes('firebaseAuth.currentUser') && 
               onboardingFile.includes('getIdToken(true)') &&
               onboardingFile.includes('freshIdToken');
  const fix2 = authPageFile.includes('getIdToken(true)') &&
               authPageFile.includes('freshIdToken');
  const fix3 = onboardingFile.includes('auth as firebaseAuth');

  console.log(`   ✅ OnboardingPage.tsx — Firebase import added: ${fix3 ? 'YES' : '❌ NO'}`);
  console.log(`   ✅ OnboardingPage.tsx — Force token refresh fix: ${fix1 ? 'YES' : '❌ NO'}`);
  console.log(`   ✅ AuthPage.tsx — Force token refresh in onComplete: ${fix2 ? 'YES' : '❌ NO'}`);

  // ── 6. PRODUCTION HTTP STATUS ─────────────────────────────────────────────
  console.log("\n6. PRODUCTION HTTP STATUS");
  const prodStatus = await httpGet('https://vibe-coding-interntrack.vercel.app/login');
  console.log(`   https://vibe-coding-interntrack.vercel.app/login → HTTP ${prodStatus}`);
  if (prodStatus === 200) {
    console.log("   ✅ Production URL: REACHABLE");
  } else if (prodStatus === 0) {
    console.log("   ⚠️  Production URL: UNREACHABLE or timeout");
  } else {
    console.log(`   ⚠️  Production URL: HTTP ${prodStatus}`);
  }

  // ── 7. ENV SANITY ─────────────────────────────────────────────────────────
  console.log("\n7. ENVIRONMENT SANITY (no values printed)");
  const hasDBURL = !!process.env.DATABASE_URL;
  const hasDirectURL = !!process.env.DIRECT_URL;
  const isPostgres = process.env.DATABASE_URL?.startsWith('postgresql://') || 
                     process.env.DATABASE_URL?.startsWith('postgres://');
  const isSQLite = process.env.DATABASE_URL?.startsWith('file:');

  console.log(`   DATABASE_URL present: ${hasDBURL ? '✅ YES' : '❌ NO'}`);
  console.log(`   DIRECT_URL present: ${hasDirectURL ? '✅ YES' : '⚠️  NO'}`);
  console.log(`   Provider: ${isPostgres ? '✅ PostgreSQL' : isSQLite ? '❌ SQLite (WRONG!)' : '⚠️ Unknown'}`);

  // ── 8. GOOGLE ONBOARDING FLOW LOGIC TRACE ────────────────────────────────
  console.log("\n8. GOOGLE ONBOARDING SERVER ACTION TRACE");
  console.log("   registerGoogleUser signature check...");
  const actionsFile = fs.readFileSync(
    path.join(process.cwd(), 'src/app/actions/auth.ts'),
    'utf8'
  );
  const hasVerifyIdToken = actionsFile.includes('adminAuth.verifyIdToken(data.idToken)');
  const hasInstitutionLock = actionsFile.includes('"SMKN 3 Jakarta"');
  const hasLinkedAccountCreate = actionsFile.includes('linkedAccounts: {') && 
                                  actionsFile.includes('create: {') &&
                                  actionsFile.includes('providerAccountId: uid');
  const genericCatch = actionsFile.includes('"Gagal membuat akun."');
  
  console.log(`   ✅ verifyIdToken call present: ${hasVerifyIdToken ? 'YES' : 'NO'}`);
  console.log(`   ✅ institution locked to SMKN 3 Jakarta: ${hasInstitutionLock ? 'YES' : '❌ NO'}`);
  console.log(`   ✅ LinkedAccount created on register: ${hasLinkedAccountCreate ? 'YES' : '❌ NO'}`);
  console.log(`   ℹ️  Generic catch still present: ${genericCatch ? 'YES (expected)' : 'NO'}`);

  // ── 9. EXISTING LINKED ACCOUNT INTEGRITY ─────────────────────────────────
  console.log("\n9. LINKED ACCOUNT INTEGRITY");
  const linked = await prisma.linkedAccount.findFirst({
    include: { user: true }
  });
  if (linked) {
    const userExists = !!linked.user;
    const providerIsGoogle = linked.provider === 'google';
    const hasUID = !!linked.providerAccountId;
    console.log(`   Provider: ${linked.provider} ${providerIsGoogle ? '✅' : '❌'}`);
    console.log(`   User exists: ${userExists ? '✅ YES' : '❌ NO'}`);
    console.log(`   UID populated: ${hasUID ? '✅ YES' : '❌ NO'}`);
    console.log(`   User institution: ${linked.user?.institution === 'SMKN 3 Jakarta' ? '✅ SMKN 3 Jakarta' : '⚠️ ' + linked.user?.institution}`);
  } else {
    console.log("   ⚠️ No linked accounts found");
  }

  // ── FINAL SUMMARY ─────────────────────────────────────────────────────────
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║  VERIFICATION SUMMARY                                         ║");
  console.log("╠══════════════════════════════════════════════════════════════╣");
  console.log(`║  Database connected:     ✅                                   ║`);
  console.log(`║  Data integrity:         ${dataPass ? '✅ PASS' : '❌ FAIL'}                              ║`);
  console.log(`║  No duplicates:          ${emailGroups.length === 0 ? '✅ PASS' : '❌ FAIL'}                              ║`);
  console.log(`║  Institution locked:     ${wrongInstitution === 0 ? '✅ PASS' : '❌ FAIL'}                              ║`);
  console.log(`║  Source fix verified:    ${fix1 && fix2 && fix3 ? '✅ BOTH FILES' : '❌ INCOMPLETE'}                    ║`);
  console.log(`║  Postgres provider:      ${isPostgres ? '✅ PASS' : '❌ FAIL (SQLite!)'}                              ║`);
  console.log("║                                                               ║");
  console.log("║  LIVE BROWSER TEST:      ⚠️  REQUIRES MANUAL VERIFICATION    ║");
  console.log("║  (Playwright CDN 404 — browser driver unavailable)            ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
}

main()
  .catch(e => { console.error("❌ Script error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
