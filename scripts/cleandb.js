// scripts/cleandb.js
// Script para limpiar la BD de PostgreSQL
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🔄 Conectando a la base de datos...");

    // Eliminar todos los usuarios
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`✅ ${deletedUsers.count} usuarios eliminados`);

    console.log("✅ Base de datos limpiada exitosamente");
    console.log("Ahora puedes intentar registrar nuevamente");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
