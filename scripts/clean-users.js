// scripts/clean-users.js
const { MongoClient } = require("mongodb");
require("dotenv").config();

async function main() {
  const mongoUri = process.env.DATABASE_URL;
  if (!mongoUri) {
    console.error("❌ DATABASE_URL no está configurada");
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log("✅ Conectado a MongoDB");

    const db = client.db("nanPageDatabase");

    // Intentar eliminar la colección de usuarios si existe
    try {
      await db.collection("User").drop();
      console.log("✅ Colección User eliminada");
    } catch (e) {
      if (e.codeName !== "NamespaceNotFound") {
        console.warn("⚠️  Error eliminando colección User:", e.message);
      } else {
        console.log("ℹ️  Colección User no existe (es normal en primera ejecución)");
      }
    }

    // Intentar eliminar la colección de cuentas si existe
    try {
      await db.collection("Account").drop();
      console.log("✅ Colección Account eliminada");
    } catch (e) {
      if (e.codeName !== "NamespaceNotFound") {
        console.warn("⚠️  Error eliminando colección Account:", e.message);
      } else {
        console.log("ℹ️  Colección Account no existe (es normal en primera ejecución)");
      }
    }

    console.log("✅ Base de datos lista para empezar");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

main();
