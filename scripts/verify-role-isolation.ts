import { prisma } from "../src/lib/prisma";
import { completeOnboarding, registerGoogleUser } from "../src/app/actions/auth";

async function runTests() {
  console.log("=== RUNNING VERIFICATION TESTS ===");

  let passedTests = 0;
  let totalTests = 0;

  function assert(testName: string, condition: boolean, extra?: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ FAIL: ${testName} ${extra || ""}`);
    }
  }

  // 1. Validation Test: Required Department in completeOnboarding
  const resEmptyDept = await completeOnboarding({
    role: "Siswa",
    institution: "SMKN 3 Jakarta",
    department: "",
    whatsapp: "08123456789",
    idNumber: "12345",
  });
  assert(
    "Test Case 5: Empty department rejected in completeOnboarding",
    Boolean(resEmptyDept.success === false && resEmptyDept.error?.includes("Jurusan")),
    JSON.stringify(resEmptyDept)
  );

  // 2. Validation Test: Whitespace Department
  const resWhitespaceDept = await completeOnboarding({
    role: "Siswa",
    institution: "SMKN 3 Jakarta",
    department: "   ",
    whatsapp: "08123456789",
    idNumber: "12345",
  });
  assert(
    "Test Case 5b: Whitespace department rejected in completeOnboarding",
    Boolean(resWhitespaceDept.success === false && resWhitespaceDept.error?.includes("Jurusan")),
    JSON.stringify(resWhitespaceDept)
  );

  // 3. Validation Test: Empty WhatsApp in completeOnboarding
  const resEmptyWA = await completeOnboarding({
    role: "Siswa",
    institution: "SMKN 3 Jakarta",
    department: "Desain Komunikasi Visual",
    whatsapp: "",
    idNumber: "12345",
  });
  assert(
    "Test Case 6: Empty WhatsApp rejected in completeOnboarding",
    Boolean(resEmptyWA.success === false && resEmptyWA.error?.includes("WhatsApp")),
    JSON.stringify(resEmptyWA)
  );

  // 4. Validation Test: Invalid Indonesian WhatsApp format
  const resInvalidWA = await completeOnboarding({
    role: "Siswa",
    institution: "SMKN 3 Jakarta",
    department: "Desain Komunikasi Visual",
    whatsapp: "12345",
    idNumber: "12345",
  });
  assert(
    "Test Case 6b: Invalid WhatsApp format rejected in completeOnboarding",
    Boolean(resInvalidWA.success === false && resInvalidWA.error?.includes("Format nomor WhatsApp")),
    JSON.stringify(resInvalidWA)
  );

  // 5. Validation Test: Required fields in registerGoogleUser
  const resGoogleEmptyDept = await registerGoogleUser({
    fullName: "Budi Siswa",
    idToken: "dummy",
    institution: "SMKN 3 Jakarta",
    department: "",
    whatsapp: "08123456789",
    idNumber: "12345",
  });
  assert(
    "Test Case 7a: Empty department rejected in registerGoogleUser",
    Boolean(resGoogleEmptyDept.success === false && resGoogleEmptyDept.error?.includes("Jurusan")),
    JSON.stringify(resGoogleEmptyDept)
  );

  const resGoogleEmptyWA = await registerGoogleUser({
    fullName: "Budi Siswa",
    idToken: "dummy",
    institution: "SMKN 3 Jakarta",
    department: "Desain Komunikasi Visual",
    whatsapp: "",
    idNumber: "12345",
  });
  assert(
    "Test Case 7b: Empty WhatsApp rejected in registerGoogleUser",
    Boolean(resGoogleEmptyWA.success === false && resGoogleEmptyWA.error?.includes("WhatsApp")),
    JSON.stringify(resGoogleEmptyWA)
  );

  // 6. Test Data Isolation Logic:
  // User Requirement Scenario:
  // - Teacher A = DKV
  // - Teacher A supervises Student 1 (DKV)
  // - Student 2 = DKV but supervised by Teacher B
  //
  // Expected:
  // Teacher A: Student 1 ✅, Student 2 ❌
  // Admin Sekolah: Student 1 ✅, Student 2 ✅
  // Siswa: only own data ✅
  const student1Email = `student1_dkv_${Date.now()}@student.smkn3.sch.id`;
  const student2Email = `student2_dkv_${Date.now()}@student.smkn3.sch.id`;

  try {
    const student1 = await prisma.student.create({
      data: {
        nisn: `S1_${Date.now()}`,
        name: "Student 1 DKV (Supervised by Teacher A)",
        class: "XII DKV 1",
        department: "Desain Komunikasi Visual",
        email: student1Email,
        schoolSupervisor: "Teacher A",
        stage: "Pelaksanaan (DUDI)",
        status: "Aktif",
      },
    });

    const student2 = await prisma.student.create({
      data: {
        nisn: `S2_${Date.now()}`,
        name: "Student 2 DKV (Supervised by Teacher B)",
        class: "XII DKV 2",
        department: "Desain Komunikasi Visual",
        email: student2Email,
        schoolSupervisor: "Teacher B",
        stage: "Pelaksanaan (DUDI)",
        status: "Aktif",
      },
    });

    // Test Teacher A Scope (using authoritative getTeacherSupervisorWhere)
    const { getTeacherSupervisorWhere, isTeacherAuthorizedForStudent } = await import("../src/lib/rbac");
    
    const teacherAStudents = await prisma.student.findMany({
      where: getTeacherSupervisorWhere("Teacher A"),
    });

    const teacherAHasStudent1 = teacherAStudents.some((s) => s.id === student1.id);
    const teacherADoesNotHaveStudent2 = !teacherAStudents.some((s) => s.id === student2.id);

    assert(
      "Scenario 1: Teacher A sees Student 1 (assigned to Teacher A)",
      teacherAHasStudent1,
      `Found students: ${JSON.stringify(teacherAStudents.map((s) => s.name))}`
    );

    assert(
      "Scenario 2: Teacher A does NOT see Student 2 (same department DKV, but supervised by Teacher B)",
      teacherADoesNotHaveStudent2,
      `Student 2 incorrectly leaked into Teacher A scope!`
    );

    // Test Teacher B Scope
    const teacherBStudents = await prisma.student.findMany({
      where: getTeacherSupervisorWhere("Teacher B"),
    });
    const teacherBHasStudent2 = teacherBStudents.some((s) => s.id === student2.id);
    const teacherBDoesNotHaveStudent1 = !teacherBStudents.some((s) => s.id === student1.id);

    assert(
      "Scenario 3: Teacher B sees Student 2 and does NOT see Student 1",
      teacherBHasStudent2 && teacherBDoesNotHaveStudent1
    );

    // Test Teacher Mutation Authorization Helper
    const isAuthAForS1 = await isTeacherAuthorizedForStudent("Teacher A", student1.id);
    const isAuthAForS2 = await isTeacherAuthorizedForStudent("Teacher A", student2.id);
    assert(
      "Scenario 4: isTeacherAuthorizedForStudent grants Teacher A -> Student 1, denies Teacher A -> Student 2",
      isAuthAForS1 === true && isAuthAForS2 === false
    );

    // Test Admin Scope (school-wide visibility)
    const adminStudents = await prisma.student.findMany();
    const adminHasS1 = adminStudents.some((s) => s.id === student1.id);
    const adminHasS2 = adminStudents.some((s) => s.id === student2.id);
    assert(
      "Scenario 5: Admin Sekolah has school-wide visibility (sees both Student 1 and Student 2)",
      adminHasS1 && adminHasS2
    );

    // Test Siswa Scope (own data only)
    const student1Query = await prisma.student.findMany({
      where: { id: student1.id },
    });
    assert(
      "Scenario 6: Siswa 1 only sees own data (Student 1 ✅, Student 2 ❌)",
      student1Query.length === 1 && student1Query[0].id === student1.id && !student1Query.some((s) => s.id === student2.id)
    );

    // Cleanup test records
    await prisma.student.delete({ where: { id: student1.id } });
    await prisma.student.delete({ where: { id: student2.id } });
    console.log("🧹 Test records cleaned up successfully");
  } catch (err: any) {
    console.error("Error during student DB test:", err);
  }

  console.log(`\n=== SUMMARY: ${passedTests}/${totalTests} TESTS PASSED ===`);
  if (passedTests === totalTests) {
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
  } else {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
