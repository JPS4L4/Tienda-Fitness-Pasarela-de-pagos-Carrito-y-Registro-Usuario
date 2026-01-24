// prisma/seeds.ts
import { PrismaClient } from '@prisma/client'


const prisma = new PrismaClient()

async function main() {
  console.log("Actualizando datos...")

 await prisma.plan.updateMany({
  where: {
    OR: [
      { discount: null },
      { discount: { equals: undefined } },
    ],
  },
  data: {
    discount: 0,
  },
})



  console.log("¡Actualización terminada!")
}


main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())