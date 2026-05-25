import bcrypt from "bcrypt";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const demoEmails = [
  "teacher.a@algebraquest.test",
  "teacher.b@algebraquest.test",
  "student.a1@algebraquest.test",
  "student.a2@algebraquest.test",
  "student.b1@algebraquest.test",
  "student.b2@algebraquest.test",
];

async function main() {
  await prisma.user.deleteMany({
    where: { email: { in: demoEmails } },
  });

  const password = await bcrypt.hash("Password123!", 12);

  const [teacherA, teacherB, studentA1, studentA2, studentB1, studentB2] = await Promise.all([
    prisma.user.create({
      data: { name: "Teacher A", email: "teacher.a@algebraquest.test", password, role: UserRole.TEACHER },
    }),
    prisma.user.create({
      data: { name: "Teacher B", email: "teacher.b@algebraquest.test", password, role: UserRole.TEACHER },
    }),
    prisma.user.create({
      data: { name: "Student A1", email: "student.a1@algebraquest.test", password, role: UserRole.STUDENT },
    }),
    prisma.user.create({
      data: { name: "Student A2", email: "student.a2@algebraquest.test", password, role: UserRole.STUDENT },
    }),
    prisma.user.create({
      data: { name: "Student B1", email: "student.b1@algebraquest.test", password, role: UserRole.STUDENT },
    }),
    prisma.user.create({
      data: { name: "Student B2", email: "student.b2@algebraquest.test", password, role: UserRole.STUDENT },
    }),
  ]);

  const [sectionA, sectionB] = await Promise.all([
    prisma.classSection.create({ data: { name: "Section A", code: "TEACHA", teacherId: teacherA.id } }),
    prisma.classSection.create({ data: { name: "Section B", code: "TEACHB", teacherId: teacherB.id } }),
  ]);

  await prisma.enrollment.createMany({
    data: [
      { sectionId: sectionA.id, studentId: studentA1.id },
      { sectionId: sectionA.id, studentId: studentA2.id },
      { sectionId: sectionB.id, studentId: studentB1.id },
      { sectionId: sectionB.id, studentId: studentB2.id },
    ],
  });

  const [guideA, guideB] = await Promise.all([
    prisma.questGuide.create({
      data: {
        title: "Solving Linear Equations",
        topic: "Linear Equations",
        shortExplanation: "Use inverse operations to isolate the variable.",
        exampleProblem: "2x + 3 = 11",
        solutionSteps: ["Subtract 3 from both sides.", "Divide both sides by 2.", "x = 4."],
        tips: ["Keep equations balanced."],
        teacherId: teacherA.id,
        sectionId: sectionA.id,
      },
    }),
    prisma.questGuide.create({
      data: {
        title: "Factoring Basics",
        topic: "Factoring",
        shortExplanation: "Find common factors to rewrite an expression.",
        exampleProblem: "x^2 + 5x + 6",
        solutionSteps: ["Find two numbers that multiply to 6.", "Make sure they add to 5.", "Write (x + 2)(x + 3)."],
        tips: ["Check by expanding."],
        teacherId: teacherB.id,
        sectionId: sectionB.id,
      },
    }),
  ]);

  await Promise.all([
    prisma.quest.create({
      data: {
        title: "Linear Equation Trial",
        worldName: "Forest of Balance",
        topic: "Linear Equations",
        difficulty: "Easy",
        requiredPuzzlePieces: 2,
        levelNumber: 1,
        teacherId: teacherA.id,
        sectionId: sectionA.id,
        guideId: guideA.id,
        questions: {
          create: [
            {
              equation: "x + 5 = 12",
              choices: ["5", "7", "12", "17"],
              correctAnswer: "7",
              solutionSteps: ["Subtract 5 from both sides."],
              difficulty: "Easy",
            },
            {
              equation: "3x = 18",
              choices: ["3", "6", "15", "21"],
              correctAnswer: "6",
              solutionSteps: ["Divide both sides by 3."],
              difficulty: "Easy",
            },
          ],
        },
      },
    }),
    prisma.quest.create({
      data: {
        title: "Factoring Gate",
        worldName: "Crystal Cavern",
        topic: "Factoring",
        difficulty: "Medium",
        requiredPuzzlePieces: 2,
        levelNumber: 1,
        teacherId: teacherB.id,
        sectionId: sectionB.id,
        guideId: guideB.id,
        questions: {
          create: [
            {
              equation: "Factor x^2 + 3x + 2",
              choices: ["(x + 1)(x + 2)", "(x + 1)(x + 3)", "(x + 2)(x + 2)", "x(x + 3)"],
              correctAnswer: "(x + 1)(x + 2)",
              solutionSteps: ["Find factors of 2 that add to 3."],
              difficulty: "Medium",
            },
            {
              equation: "Factor x^2 + 7x + 12",
              choices: ["(x + 3)(x + 4)", "(x + 2)(x + 6)", "(x + 1)(x + 12)", "(x + 5)(x + 2)"],
              correctAnswer: "(x + 3)(x + 4)",
              solutionSteps: ["Find factors of 12 that add to 7."],
              difficulty: "Medium",
            },
          ],
        },
      },
    }),
  ]);

  console.info("Seed complete.");
  console.info("Demo password for all seeded accounts: Password123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
