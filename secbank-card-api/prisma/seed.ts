import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const accounts = [
    { accountNumber: "0123456789", customerName: "Adaeze Okafor" },
    { accountNumber: "0234567890", customerName: "Chinedu Eze" },
    { accountNumber: "0345678901", customerName: "Fatima Bello" },
    { accountNumber: "0456789012", customerName: "Tunde Adeyemi", isActive: false },
  ];

  for (const a of accounts) {
    await prisma.account.upsert({
      where: { accountNumber: a.accountNumber },
      update: {},
      create: a,
    });
  }
  console.log("Seeded accounts");
}

main().finally(() => prisma.$disconnect());