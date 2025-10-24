import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.market.create({
    data: {
      title: "Will Bitcoin exceed $70k by Dec 31?",
      description: "Prediction market about BTC price",
      liquidityParam: 20,
      outcomes: {
        create: [{ label: "Yes" }, { label: "No" }],
      },
    },
  });
}

main()
  .then(() => console.log("✅ Seeded database"))
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
