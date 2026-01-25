import 'dotenv/config';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Conexión a PostgreSQL exitosa');
    
    // Intenta una consulta simple
    const userCount = await prisma.user.count();
    console.log(`✅ Total de usuarios en la BD: ${userCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error de conexión:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
