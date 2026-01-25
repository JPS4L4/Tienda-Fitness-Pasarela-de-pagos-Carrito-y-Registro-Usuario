import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes (opcional)
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.item.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Datos anteriores eliminados');

  // Crear usuario de prueba
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Usuario de prueba creado');

  // Crear 8 Items
  const items = await Promise.all([
    prisma.item.create({
      data: {
        title: 'Proteína Whey Premium',
        shortDescription: 'Proteína de suero de alta calidad',
        description: 'Proteína de suero premium con 25g de proteína por porción. Ideal para recuperación muscular post-entrenamiento. Sabor a chocolate delicioso.',
        price: 89900,
        currency: 'COP',
        category: 'Suplementos',
        originalPrice: 120000,
        discount: 25,
        images: ['/images/proteina-whey.jpg'],
        slug: 'proteina-whey-premium',
        stock: 50,
        rating: 4.5,
        reviewCount: 0,
        tags: ['proteína', 'suplementos', 'músculo'],
        freeShipping: true,
        isOfferOfTheDay: true,
        specs: {
          peso: '2kg',
          sabor: 'Chocolate',
          porciones: '60',
        },
      },
    }),
    prisma.item.create({
      data: {
        title: 'Creatina Monohidrato',
        shortDescription: 'Creatina pura micronizada',
        description: 'Creatina monohidrato 100% pura, micronizada para mejor absorción. Aumenta la fuerza y el rendimiento deportivo.',
        price: 45000,
        currency: 'COP',
        category: 'Suplementos',
        originalPrice: 60000,
        discount: 25,
        images: ['/images/creatina.jpg'],
        slug: 'creatina-monohidrato',
        stock: 80,
        rating: 4.8,
        reviewCount: 0,
        tags: ['creatina', 'fuerza', 'rendimiento'],
        freeShipping: false,
        specs: {
          peso: '300g',
          porciones: '60',
        },
      },
    }),
    prisma.item.create({
      data: {
        title: 'Banda Elástica Resistencia',
        shortDescription: 'Set de 5 bandas de resistencia',
        description: 'Set completo de bandas elásticas con diferentes niveles de resistencia. Perfecto para entrenar en casa o gym.',
        price: 35000,
        currency: 'COP',
        category: 'Equipo',
        images: ['/images/bandas.jpg'],
        slug: 'banda-elastica-resistencia',
        stock: 100,
        rating: 4.3,
        reviewCount: 0,
        tags: ['bandas', 'equipo', 'entrenamiento'],
        freeShipping: true,
        specs: {
          material: 'Látex natural',
          cantidad: '5 bandas',
          resistencias: '5-50 lbs',
        },
      },
    }),
    prisma.item.create({
      data: {
        title: 'Colchoneta Yoga Premium',
        shortDescription: 'Colchoneta antideslizante de 6mm',
        description: 'Colchoneta de yoga de alta densidad con superficie antideslizante. Ideal para yoga, pilates y estiramientos.',
        price: 65000,
        currency: 'COP',
        category: 'Equipo',
        images: ['/images/colchoneta.jpg'],
        slug: 'colchoneta-yoga-premium',
        stock: 45,
        rating: 4.6,
        reviewCount: 0,
        tags: ['yoga', 'pilates', 'colchoneta'],
        freeShipping: true,
        specs: {
          grosor: '6mm',
          dimensiones: '183cm x 61cm',
          material: 'NBR',
        },
      },
    }),
    prisma.item.create({
      data: {
        title: 'Pre-Entreno Explosivo',
        shortDescription: 'Energía intensa para tus entrenamientos',
        description: 'Fórmula avanzada de pre-entreno con cafeína, beta-alanina y citrulina. Aumenta energía, concentración y bombeo muscular.',
        price: 75000,
        currency: 'COP',
        category: 'Suplementos',
        originalPrice: 95000,
        discount: 21,
        images: ['/images/pre-entreno.jpg'],
        slug: 'pre-entreno-explosivo',
        stock: 35,
        rating: 4.7,
        reviewCount: 0,
        tags: ['pre-entreno', 'energía', 'rendimiento'],
        freeShipping: false,
        isOfferOfTheDay: true,
        specs: {
          sabor: 'Frutas tropicales',
          porciones: '30',
          cafeina: '200mg por porción',
        },
      },
    }),
    prisma.item.create({
      data: {
        title: 'Mancuernas Ajustables 20kg',
        shortDescription: 'Par de mancuernas regulables',
        description: 'Set de mancuernas ajustables de 2.5kg a 20kg por mancuerna. Sistema de cambio rápido de peso. Incluye base de almacenamiento.',
        price: 450000,
        currency: 'COP',
        category: 'Equipo',
        images: ['/images/mancuernas.jpg'],
        slug: 'mancuernas-ajustables-20kg',
        stock: 15,
        rating: 4.9,
        reviewCount: 0,
        tags: ['mancuernas', 'pesas', 'fuerza'],
        freeShipping: true,
        specs: {
          peso_max: '20kg por mancuerna',
          incrementos: '2.5kg',
          material: 'Hierro recubierto',
        },
      },
    }),
    prisma.item.create({
      data: {
        title: 'BCAA 2:1:1 Recuperación',
        shortDescription: 'Aminoácidos ramificados',
        description: 'BCAAs en proporción 2:1:1 para recuperación muscular óptima. Reduce la fatiga y acelera la recuperación post-entrenamiento.',
        price: 55000,
        currency: 'COP',
        category: 'Suplementos',
        images: ['/images/bcaa.jpg'],
        slug: 'bcaa-211-recuperacion',
        stock: 60,
        rating: 4.4,
        reviewCount: 0,
        tags: ['bcaa', 'recuperación', 'aminoácidos'],
        freeShipping: false,
        specs: {
          sabor: 'Sandía',
          porciones: '40',
          proporcion: '2:1:1',
        },
      },
    }),
    prisma.item.create({
      data: {
        title: 'Cuerda de Saltar Pro',
        shortDescription: 'Cuerda con rodamientos de alta velocidad',
        description: 'Cuerda profesional para saltar con rodamientos de bolas. Cable de acero recubierto. Mangos ergonómicos con peso ajustable.',
        price: 28000,
        currency: 'COP',
        category: 'Equipo',
        images: ['/images/cuerda.jpg'],
        slug: 'cuerda-saltar-pro',
        stock: 70,
        rating: 4.5,
        reviewCount: 0,
        tags: ['cardio', 'cuerda', 'saltar'],
        freeShipping: false,
        specs: {
          longitud: 'Ajustable hasta 3m',
          material: 'Acero recubierto PVC',
          rodamientos: 'Bolas de alta velocidad',
        },
      },
    }),
  ]);

  console.log('✅ 8 Items creados');

  // Crear 6 Planes (3 de nutrición y 3 de entrenamiento)
  const plans = await Promise.all([
    // Planes de Nutrición
    prisma.plan.create({
      data: {
        type: 'nutricion',
        title: 'Plan Nutricional Pérdida de Peso',
        shortDescription: 'Dieta balanceada para perder grasa de forma saludable',
        description: 'Plan de alimentación diseñado para crear un déficit calórico controlado. Incluye menús semanales, lista de compras y recetas fáciles. Macros optimizados para mantener masa muscular mientras pierdes grasa.',
        price: 120000,
        currency: 'COP',
        discount: 15,
        tags: ['nutrición', 'pérdida de peso', 'déficit calórico'],
        rating: 4.7,
        reviewCount: 0,
        slug: 'plan-nutricional-perdida-peso',
        coverage: ['Menú semanal completo', 'Lista de compras', '30 recetas saludables', 'Guía de macronutrientes'],
        content: '# Plan Nutricional para Pérdida de Peso\n\nEste plan está diseñado para ayudarte a perder peso de forma saludable...',
        resources: {
          create: [
            {
              type: 'pdf',
              title: 'Guía Completa del Plan',
              url: '/resources/plan-perdida-peso.pdf',
              description: 'Documento completo con todas las instrucciones',
              isDownloadable: true,
              order: 1,
            },
            {
              type: 'pdf',
              title: 'Recetario 30 Días',
              url: '/resources/recetas-perdida-peso.pdf',
              description: '30 recetas deliciosas y saludables',
              isDownloadable: true,
              order: 2,
            },
          ],
        },
      },
    }),
    prisma.plan.create({
      data: {
        type: 'nutricion',
        title: 'Plan Nutricional Ganancia Muscular',
        shortDescription: 'Alimentación optimizada para hipertrofia',
        description: 'Plan de nutrición enfocado en ganancia de masa muscular limpia. Alto en proteínas y calorías estratégicamente distribuidas. Incluye timing de nutrientes pre y post entreno.',
        price: 135000,
        currency: 'COP',
        tags: ['nutrición', 'ganancia muscular', 'hipertrofia'],
        rating: 4.8,
        reviewCount: 0,
        slug: 'plan-nutricional-ganancia-muscular',
        coverage: ['Menú hipercalórico', 'Timing de nutrientes', 'Recetas altas en proteína', 'Suplementación recomendada'],
        content: '# Plan Nutricional para Ganancia Muscular\n\nMaximiza tu crecimiento muscular con este plan...',
        resources: {
          create: [
            {
              type: 'pdf',
              title: 'Manual de Volumen Limpio',
              url: '/resources/plan-volumen.pdf',
              description: 'Guía completa para ganar músculo',
              isDownloadable: true,
              order: 1,
            },
          ],
        },
      },
    }),
    prisma.plan.create({
      data: {
        type: 'nutricion',
        title: 'Plan Nutricional Mantenimiento',
        shortDescription: 'Dieta equilibrada para mantener tu peso ideal',
        description: 'Plan de alimentación balanceado para mantener tu peso y composición corporal actual. Enfoque en nutrición sostenible a largo plazo con flexibilidad.',
        price: 100000,
        currency: 'COP',
        discount: 10,
        tags: ['nutrición', 'mantenimiento', 'equilibrio'],
        rating: 4.5,
        reviewCount: 0,
        slug: 'plan-nutricional-mantenimiento',
        coverage: ['Menú flexible', 'Guía de porciones', 'Recetas variadas', 'Tips para comer fuera'],
        content: '# Plan Nutricional de Mantenimiento\n\nMantén tus resultados con este plan sostenible...',
        resources: {
          create: [
            {
              type: 'pdf',
              title: 'Guía de Mantenimiento',
              url: '/resources/plan-mantenimiento.pdf',
              description: 'Plan alimenticio balanceado',
              isDownloadable: true,
              order: 1,
            },
          ],
        },
      },
    }),
    // Planes de Entrenamiento
    prisma.plan.create({
      data: {
        type: 'entrenamiento',
        title: 'Programa Hipertrofia 12 Semanas',
        shortDescription: 'Entrenamiento intensivo para ganar músculo',
        description: 'Programa de 12 semanas diseñado para máxima ganancia muscular. Incluye periodización, ejercicios detallados con videos, y seguimiento de progreso. Ideal para intermedios y avanzados.',
        price: 150000,
        currency: 'COP',
        tags: ['entrenamiento', 'hipertrofia', 'músculo'],
        rating: 4.9,
        reviewCount: 0,
        slug: 'programa-hipertrofia-12-semanas',
        coverage: ['12 semanas de entrenamiento', 'Videos de cada ejercicio', 'Hoja de seguimiento', 'Variantes de ejercicios'],
        content: '# Programa de Hipertrofia 12 Semanas\n\nTransforma tu físico con este programa completo...',
        resources: {
          create: [
            {
              type: 'pdf',
              title: 'Manual del Programa',
              url: '/resources/hipertrofia-12-semanas.pdf',
              description: 'Guía completa del programa',
              isDownloadable: true,
              order: 1,
            },
            {
              type: 'video',
              title: 'Introducción al Programa',
              url: 'https://youtube.com/watch?v=example',
              description: 'Video introductorio de 15 minutos',
              thumbnail: '/thumbnails/intro-hipertrofia.jpg',
              order: 2,
            },
          ],
        },
      },
    }),
    prisma.plan.create({
      data: {
        type: 'entrenamiento',
        title: 'Entrenamiento HIIT 8 Semanas',
        shortDescription: 'Quema grasa con entrenamientos de alta intensidad',
        description: 'Programa HIIT de 8 semanas para quemar grasa y mejorar condición cardiovascular. Sesiones de 20-30 minutos, 4-5 veces por semana. Incluye variantes para todos los niveles.',
        price: 95000,
        currency: 'COP',
        discount: 20,
        tags: ['entrenamiento', 'HIIT', 'cardio', 'quema grasa'],
        rating: 4.6,
        reviewCount: 0,
        slug: 'entrenamiento-hiit-8-semanas',
        coverage: ['8 semanas de HIIT', 'Videos demostrativos', 'Plan de progresión', 'Ejercicios en casa y gym'],
        content: '# Programa HIIT 8 Semanas\n\nQuema grasa rápidamente con entrenamientos cortos e intensos...',
        resources: {
          create: [
            {
              type: 'pdf',
              title: 'Guía HIIT Completa',
              url: '/resources/hiit-8-semanas.pdf',
              description: 'Manual completo del programa',
              isDownloadable: true,
              order: 1,
            },
          ],
        },
      },
    }),
    prisma.plan.create({
      data: {
        type: 'entrenamiento',
        title: 'Rutina Full Body Principiantes',
        shortDescription: 'Programa perfecto para empezar en el gym',
        description: 'Rutina de cuerpo completo para principiantes. 3 días por semana, ejercicios fundamentales. Incluye técnica detallada, videos y progresión adaptativa. Perfecto para crear hábitos.',
        price: 75000,
        currency: 'COP',
        tags: ['entrenamiento', 'principiantes', 'full body'],
        rating: 4.7,
        reviewCount: 0,
        slug: 'rutina-full-body-principiantes',
        coverage: ['Rutina 3 días/semana', 'Videos técnica correcta', 'Progresión lineal', 'Calentamiento y estiramiento'],
        content: '# Rutina Full Body para Principiantes\n\nComienza tu viaje fitness con este programa...',
        resources: {
          create: [
            {
              type: 'pdf',
              title: 'Manual Principiantes',
              url: '/resources/full-body-principiantes.pdf',
              description: 'Guía paso a paso',
              isDownloadable: true,
              order: 1,
            },
          ],
        },
      },
    }),
  ]);

  console.log('✅ 6 Planes creados (3 nutrición, 3 entrenamiento)');

  // Crear 4 Reviews/Comentarios
  await prisma.review.createMany({
    data: [
      {
        userId: user.id,
        productId: items[0].id, // Proteína Whey
        rating: 5,
        comment: '¡Excelente proteína! El sabor a chocolate es delicioso y se mezcla muy bien. He notado mejor recuperación después de mis entrenamientos.',
      },
      {
        userId: user.id,
        productId: items[5].id, // Mancuernas Ajustables
        rating: 5,
        comment: 'Las mejores mancuernas que he comprado. El sistema de cambio rápido es muy práctico y ahorran mucho espacio. Totalmente recomendadas.',
      },
      {
        userId: user.id,
        planId: plans[0].id, // Plan Pérdida de Peso
        rating: 4,
        comment: 'Gran plan nutricional, las recetas son fáciles de seguir y deliciosas. He perdido 3kg en las primeras 3 semanas sin pasar hambre.',
      },
      {
        userId: user.id,
        planId: plans[3].id, // Programa Hipertrofia
        rating: 5,
        comment: 'Programa increíble! Muy bien estructurado, los videos son claros y he visto resultados desde la semana 4. Mis medidas han aumentado notablemente.',
      },
    ],
  });

  console.log('✅ 4 Comentarios creados');

  // Actualizar reviewCount y rating de items y plans con reviews
  await prisma.item.update({
    where: { id: items[0].id },
    data: { reviewCount: 1, rating: 5 },
  });

  await prisma.item.update({
    where: { id: items[5].id },
    data: { reviewCount: 1, rating: 5 },
  });

  await prisma.plan.update({
    where: { id: plans[0].id },
    data: { reviewCount: 1, rating: 4 },
  });

  await prisma.plan.update({
    where: { id: plans[3].id },
    data: { reviewCount: 1, rating: 5 },
  });

  console.log('✅ Ratings actualizados');

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📊 Resumen:');
  console.log('  - 1 usuario de prueba');
  console.log('  - 8 items (productos)');
  console.log('  - 6 planes (3 nutrición, 3 entrenamiento)');
  console.log('  - 4 comentarios/reviews');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
