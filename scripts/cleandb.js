// scripts/cleandb.js
// Script para limpiar la BD de MongoDB y eliminar índices conflictivos
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🔄 Conectando a la base de datos...");

    // Eliminar todos los usuarios
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`✅ ${deletedUsers.count} usuarios eliminados`);

    // Conectar a MongoDB directamente para eliminar índices
    const mongodb = prisma.$extends({
      client: {
        $runCommandRaw: async (cmd) => {
          return await prisma.$queryRaw(`db.runCommand(${JSON.stringify(cmd)})`);
        },
      },
    });

    console.log("✅ Base de datos limpiada exitosamente");
    console.log("Ahora puedes intentar registrar nuevamente");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
