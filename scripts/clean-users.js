// scripts/clean-users.js
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("✅ Conectado a PostgreSQL");

    // Eliminar usuarios usando Prisma
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`✅ ${deletedUsers.count} usuarios eliminados`);

    // Eliminar cuentas usando Prisma
    const deletedAccounts = await prisma.account.deleteMany({});
    console.log(`✅ ${deletedAccounts.count} cuentas eliminadas`);

    console.log("✅ Base de datos lista para empezar");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
