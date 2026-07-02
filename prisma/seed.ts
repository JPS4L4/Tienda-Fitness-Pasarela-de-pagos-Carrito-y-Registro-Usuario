import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.checkoutSession.deleteMany();
  await prisma.stockAlert.deleteMany();
  await prisma.retryEvent.deleteMany();
  await prisma.order.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.item.deleteMany();
  await prisma.plan.deleteMany();

  const passwordHash = await bcrypt.hash('Prueba123!', 10);

  const user = await prisma.user.create({
    data: {
      name: 'Usuario Demo',
      email: 'demo@nan-salazar.com',
      phone: '+573001112233',
      emailVerified: new Date(),
      accounts: {
        create: {
          provider: 'credentials',
          password: passwordHash,
        },
      },
    },
  });

  const products = await prisma.item.createMany({
    data: [
      // ---------- Deportes / Equipamiento ----------
      {
        title: 'Kit de Pesas Ajustables 20kg',
        description: 'Equipo ideal para entrenamiento en casa.',
        shortDescription: 'Pesas ajustables premium',
        price: 129.99,
        category: 'Deportes',
        originalPrice: 159.99,
        discount: 19,
        installments: 12,
        freeShipping: true,
        images: ['https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=500'],
        isOfferOfTheDay: true,
        slug: 'kit-pesas-ajustables-20kg',
        stock: 10,
        rating: 4.8,
        reviewCount: 12,
      },
      {
        title: 'Set de Mancuernas Hexagonales 2x5kg',
        description: 'Par de mancuernas de hierro fundido con recubrimiento de goma antideslizante.',
        shortDescription: 'Mancuernas antideslizantes',
        price: 69.9,
        category: 'Deportes',
        originalPrice: 89.9,
        discount: 22,
        installments: 6,
        freeShipping: true,
        images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=500'],
        slug: 'set-mancuernas-hexagonales-2x5kg',
        stock: 15,
        rating: 4.7,
        reviewCount: 18,
      },
      {
        title: 'Bandas de Resistencia Set x5',
        description: 'Set de 5 bandas elásticas de distintos niveles de resistencia para entrenamiento funcional.',
        shortDescription: 'Entrenamiento funcional en casa',
        price: 24.99,
        category: 'Deportes',
        freeShipping: true,
        images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?q=80&w=500'],
        slug: 'bandas-resistencia-set-x5',
        stock: 30,
        rating: 4.5,
        reviewCount: 22,
      },
      {
        title: 'Colchoneta de Yoga Antideslizante',
        description: 'Mat de yoga de 6mm de grosor, ideal para yoga, pilates y estiramientos.',
        shortDescription: 'Comodidad y agarre superior',
        price: 32.5,
        category: 'Deportes',
        originalPrice: 42,
        discount: 23,
        images: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=500'],
        slug: 'colchoneta-yoga-antideslizante',
        stock: 20,
        rating: 4.6,
        reviewCount: 14,
      },
      {
        title: 'Kettlebell de Hierro Fundido 12kg',
        description: 'Pesa rusa de una sola pieza, ideal para entrenamiento de fuerza y potencia.',
        shortDescription: 'Fuerza y resistencia funcional',
        price: 54.99,
        category: 'Deportes',
        installments: 6,
        images: ['https://images.unsplash.com/photo-1517344368193-41552b6ad3f5?q=80&w=500'],
        slug: 'kettlebell-hierro-fundido-12kg',
        stock: 12,
        rating: 4.7,
        reviewCount: 9,
      },
      {
        title: 'Cuerda para Saltar Profesional',
        description: 'Cuerda de velocidad con rodamientos, ideal para cardio y boxeo.',
        shortDescription: 'Cardio de alta intensidad',
        price: 14.99,
        category: 'Deportes',
        freeShipping: true,
        images: ['https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?q=80&w=500'],
        slug: 'cuerda-para-saltar-profesional',
        stock: 40,
        rating: 4.4,
        reviewCount: 16,
      },
      {
        title: 'Rodillo de Espuma para Masaje (Foam Roller)',
        description: 'Rodillo de espuma de alta densidad para liberación miofascial y recuperación muscular.',
        shortDescription: 'Recuperación muscular efectiva',
        price: 19.99,
        category: 'Deportes',
        images: ['https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=500'],
        slug: 'rodillo-espuma-foam-roller',
        stock: 25,
        rating: 4.5,
        reviewCount: 11,
      },

      // ---------- Tecnología ----------
      {
        title: 'Smartwatch Series 9',
        description: 'Reloj inteligente con monitoreo avanzado.',
        shortDescription: 'Monitoreo fitness y estilo',
        price: 399,
        category: 'Tecnología',
        installments: 6,
        images: ['https://images.unsplash.com/photo-1546868871-70c122469d8b?q=80&w=500'],
        slug: 'smartwatch-series-9',
        stock: 5,
        rating: 4.6,
        reviewCount: 8,
      },
      {
        title: 'Banda de Frecuencia Cardíaca Bluetooth',
        description: 'Monitor de ritmo cardíaco con conexión Bluetooth y ANT+, compatible con apps de entrenamiento.',
        shortDescription: 'Precisión en tiempo real',
        price: 45.99,
        category: 'Tecnología',
        originalPrice: 59.99,
        discount: 23,
        images: ['https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=500'],
        slug: 'banda-frecuencia-cardiaca-bluetooth',
        stock: 18,
        rating: 4.5,
        reviewCount: 7,
      },
      {
        title: 'Báscula Inteligente con Bioimpedancia',
        description: 'Báscula digital que mide peso, grasa corporal, masa muscular e IMC, sincronizable con app.',
        shortDescription: 'Controla tu progreso al detalle',
        price: 55,
        category: 'Tecnología',
        freeShipping: true,
        installments: 3,
        images: ['https://images.unsplash.com/photo-1576678927484-4c9d0c5c7b5a?q=80&w=500'],
        slug: 'bascula-inteligente-bioimpedancia',
        stock: 14,
        rating: 4.4,
        reviewCount: 10,
      },

      // ---------- Audio ----------
      {
        title: 'Auriculares Noise Cancelling',
        description: 'Auriculares inalámbricos con cancelación de ruido.',
        shortDescription: 'Audio premium',
        price: 85.5,
        category: 'Audio',
        originalPrice: 110,
        discount: 22,
        freeShipping: true,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500'],
        slug: 'auriculares-noise-cancelling',
        stock: 7,
        rating: 4.7,
        reviewCount: 10,
      },
      {
        title: 'Audífonos Deportivos Inalámbricos',
        description: 'Auriculares resistentes al sudor con gancho para la oreja, ideales para correr y entrenar.',
        shortDescription: 'Ajuste seguro para el deporte',
        price: 39.99,
        category: 'Audio',
        originalPrice: 49.99,
        discount: 20,
        freeShipping: true,
        images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=500'],
        slug: 'audifonos-deportivos-inalambricos',
        stock: 22,
        rating: 4.6,
        reviewCount: 13,
      },

      // ---------- Suplementos ----------
      {
        title: 'Proteína Whey Sabor Chocolate 2kg',
        description: 'Proteína de suero de leche de alta calidad, ideal para recuperación y ganancia muscular.',
        shortDescription: 'Recuperación muscular premium',
        price: 62.99,
        category: 'Suplementos',
        originalPrice: 74.99,
        discount: 16,
        installments: 3,
        freeShipping: true,
        images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=500'],
        isOfferOfTheDay: true,
        slug: 'proteina-whey-chocolate-2kg',
        stock: 20,
        rating: 4.8,
        reviewCount: 25,
      },
      {
        title: 'Shaker Mezclador de Proteína 700ml',
        description: 'Vaso mezclador con malla anti-grumos, ideal para batidos de proteína y pre-entrenos.',
        shortDescription: 'Batidos sin grumos',
        price: 9.99,
        category: 'Suplementos',
        images: ['https://images.unsplash.com/photo-1622484212385-fdc4c923d0e0?q=80&w=500'],
        slug: 'shaker-mezclador-proteina-700ml',
        stock: 50,
        rating: 4.3,
        reviewCount: 19,
      },
      {
        title: 'Pre-Entreno Energía Extrema 300g',
        description: 'Fórmula pre-entreno con cafeína y beta-alanina para maximizar el rendimiento en el gimnasio.',
        shortDescription: 'Máxima energía para entrenar',
        price: 34.99,
        category: 'Suplementos',
        freeShipping: true,
        images: ['https://images.unsplash.com/photo-1579722821273-0f6c1e0e2c65?q=80&w=500'],
        slug: 'pre-entreno-energia-extrema-300g',
        stock: 16,
        rating: 4.5,
        reviewCount: 15,
      },

      // ---------- Ropa Deportiva ----------
      {
        title: 'Conjunto Deportivo Mujer Leggings + Top',
        description: 'Conjunto de leggings de compresión y top deportivo, tela transpirable y elástica.',
        shortDescription: 'Comodidad y libertad de movimiento',
        price: 44.99,
        category: 'Ropa Deportiva',
        originalPrice: 59.99,
        discount: 25,
        freeShipping: true,
        images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=500'],
        slug: 'conjunto-deportivo-mujer-leggings-top',
        stock: 18,
        rating: 4.7,
        reviewCount: 21,
      },
      {
        title: 'Camiseta Deportiva Hombre Dry-Fit',
        description: 'Camiseta transpirable de secado rápido, ideal para entrenamientos de alta intensidad.',
        shortDescription: 'Frescura durante todo el entrenamiento',
        price: 22.5,
        category: 'Ropa Deportiva',
        images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=500'],
        slug: 'camiseta-deportiva-hombre-dry-fit',
        stock: 35,
        rating: 4.5,
        reviewCount: 17,
      },

      // ---------- Calzado ----------
      {
        title: 'Zapatillas de Running Ultra Ligeras',
        description: 'Zapatillas con amortiguación de espuma y suela de alta tracción para correr.',
        shortDescription: 'Rendimiento en cada zancada',
        price: 89.99,
        category: 'Calzado',
        originalPrice: 119.99,
        discount: 25,
        installments: 6,
        freeShipping: true,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=500'],
        isOfferOfTheDay: true,
        slug: 'zapatillas-running-ultra-ligeras',
        stock: 12,
        rating: 4.8,
        reviewCount: 30,
      },
      {
        title: 'Zapatillas de Entrenamiento Cross-Training',
        description: 'Calzado versátil para levantamiento de pesas, HIIT y entrenamiento funcional.',
        shortDescription: 'Estabilidad para cada movimiento',
        price: 74.99,
        category: 'Calzado',
        installments: 4,
        images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=500'],
        slug: 'zapatillas-cross-training',
        stock: 14,
        rating: 4.6,
        reviewCount: 12,
      },

      // ---------- Accesorios ----------
      {
        title: 'Guantes de Entrenamiento con Muñequera',
        description: 'Guantes acolchados para levantamiento de pesas con soporte de muñeca ajustable.',
        shortDescription: 'Protección y agarre firme',
        price: 17.99,
        category: 'Accesorios',
        images: ['https://images.unsplash.com/photo-1517963628607-235ccdd5476f?q=80&w=500'],
        slug: 'guantes-entrenamiento-munequera',
        stock: 28,
        rating: 4.4,
        reviewCount: 8,
      },
      {
        title: 'Botella de Agua Deportiva 1L con Marcador de Tiempo',
        description: 'Botella con marcas de motivación para controlar tu hidratación durante el día.',
        shortDescription: 'Hidratación consciente',
        price: 12.99,
        category: 'Accesorios',
        freeShipping: true,
        images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=500'],
        slug: 'botella-agua-deportiva-1l',
        stock: 45,
        rating: 4.3,
        reviewCount: 14,
      },
    ],
  });

  const plans = await prisma.plan.createMany({
    data: [
      // ---------- Nutrición ----------
      {
        type: 'nutricion',
        title: 'Plan Nutricional Básico',
        description: 'Plan nutritivo ideal para comenzar.',
        shortDescription: 'Ideal para iniciar',
        tags: ['nutrición', 'principiante'],
        price: 49,
        slug: 'plan-nutricional-basico',
        coverage: ['Evaluación nutricional inicial', 'Plan semanal', 'Recetas básicas'],
        rating: 4.5,
        reviewCount: 6,
      },
      {
        type: 'nutricion',
        title: 'Plan Nutricional Pérdida de Grasa',
        description: 'Plan alimenticio enfocado en déficit calórico controlado para perder grasa de forma sostenible.',
        shortDescription: 'Definición y control de peso',
        tags: ['nutrición', 'pérdida de grasa'],
        price: 69,
        slug: 'plan-nutricional-perdida-grasa',
        coverage: [
          'Evaluación corporal completa',
          'Plan de alimentación de 4 semanas',
          'Ajustes quincenales',
          'Lista de compras semanal',
        ],
        rating: 4.7,
        reviewCount: 14,
      },
      {
        type: 'nutricion',
        title: 'Plan Nutricional Ganancia Muscular',
        description: 'Plan de alimentación con superávit calórico y alto contenido proteico para ganar masa muscular.',
        shortDescription: 'Volumen limpio y masa magra',
        tags: ['nutrición', 'volumen', 'masa muscular'],
        price: 75,
        slug: 'plan-nutricional-ganancia-muscular',
        coverage: [
          'Cálculo de macros personalizado',
          'Plan de comidas de 4 semanas',
          'Recetas altas en proteína',
          'Seguimiento mensual',
        ],
        rating: 4.6,
        reviewCount: 11,
      },
      {
        type: 'nutricion',
        title: 'Plan Nutricional Vegetariano Fitness',
        description: 'Plan nutricional 100% vegetariano diseñado para deportistas y personas activas.',
        shortDescription: 'Nutrición vegetal para el rendimiento',
        tags: ['nutrición', 'vegetariano'],
        price: 59,
        slug: 'plan-nutricional-vegetariano-fitness',
        coverage: [
          'Evaluación nutricional inicial',
          'Plan semanal 100% vegetariano',
          'Recetas ricas en proteína vegetal',
          'Guía de suplementación',
        ],
        rating: 4.5,
        reviewCount: 9,
      },

      // ---------- Entrenamiento ----------
      {
        type: 'entrenamiento',
        title: 'Plan de Entrenamiento Home Gym',
        description: 'Rutina práctica para entrenar en casa.',
        shortDescription: 'Entrena desde casa',
        tags: ['fitness', 'casa'],
        price: 59,
        slug: 'plan-entrenamiento-home-gym',
        coverage: ['Rutina personalizada', 'Videos de apoyo', 'Seguimiento semanal'],
        rating: 4.8,
        reviewCount: 9,
      },
      {
        type: 'entrenamiento',
        title: 'Plan de Entrenamiento de Fuerza en Gimnasio',
        description: 'Programa de fuerza progresiva de 8 semanas diseñado para gimnasio con pesas libres y máquinas.',
        shortDescription: 'Gana fuerza de forma progresiva',
        tags: ['fitness', 'fuerza', 'gimnasio'],
        price: 79,
        slug: 'plan-entrenamiento-fuerza-gimnasio',
        coverage: [
          'Programa de 8 semanas',
          'Rutinas por grupo muscular',
          'Videos demostrativos',
          'Ajuste de cargas quincenal',
        ],
        rating: 4.9,
        reviewCount: 20,
      },
      {
        type: 'entrenamiento',
        title: 'Plan de Entrenamiento HIIT Quema Grasa',
        description: 'Rutinas de alta intensidad de 20-30 minutos diseñadas para maximizar la quema calórica.',
        shortDescription: 'Resultados rápidos y efectivos',
        tags: ['fitness', 'hiit', 'cardio'],
        price: 55,
        slug: 'plan-entrenamiento-hiit-quema-grasa',
        coverage: [
          'Rutinas diarias de 20-30 minutos',
          'Sin necesidad de equipo',
          'Plan de 4 semanas',
          'Seguimiento de progreso',
        ],
        rating: 4.7,
        reviewCount: 17,
      },
      {
        type: 'entrenamiento',
        title: 'Plan de Entrenamiento Running 5K a 10K',
        description: 'Programa progresivo para corredores que buscan pasar de correr 5K a completar 10K.',
        shortDescription: 'Prepárate para tu próxima carrera',
        tags: ['fitness', 'running', 'resistencia'],
        price: 65,
        slug: 'plan-entrenamiento-running-5k-10k',
        coverage: [
          'Plan de 6 semanas',
          'Rutinas de resistencia y velocidad',
          'Guía de estiramientos',
          'Seguimiento de tiempos',
        ],
        rating: 4.6,
        reviewCount: 13,
      },
    ],
  });

  const createdProducts = await prisma.item.findMany({ orderBy: { createdAt: 'desc' }, take: 21 });
  const createdPlans = await prisma.plan.findMany({ orderBy: { createdAt: 'desc' }, take: 8 });

  await prisma.review.createMany({
    data: [
      {
        userId: user.id,
        productId: createdProducts[0]?.id,
        rating: 5,
        comment: 'Muy buen producto para empezar en casa.',
      },
      {
        userId: user.id,
        productId: createdProducts[1]?.id,
        rating: 4,
        comment: 'Muy útil para medir progreso.',
      },
      {
        userId: user.id,
        productId: createdProducts[2]?.id,
        rating: 5,
        comment: 'Excelente calidad de audio y muy cómodos.',
      },
      {
        userId: user.id,
        productId: createdProducts[3]?.id,
        rating: 5,
        comment: 'La proteína tiene muy buen sabor y se disuelve bien.',
      },
      {
        userId: user.id,
        productId: createdProducts[4]?.id,
        rating: 4,
        comment: 'Muy cómodas para correr, llegaron rápido.',
      },
      {
        userId: user.id,
        planId: createdPlans[0]?.id,
        rating: 5,
        comment: 'Excelente guía nutricional.',
      },
      {
        userId: user.id,
        planId: createdPlans[1]?.id,
        rating: 4,
        comment: 'Muy práctico para entrenar en casa.',
      },
      {
        userId: user.id,
        planId: createdPlans[2]?.id,
        rating: 5,
        comment: 'Los ajustes quincenales realmente marcan la diferencia.',
      },
      {
        userId: user.id,
        planId: createdPlans[3]?.id,
        rating: 5,
        comment: 'El programa de fuerza está muy bien estructurado.',
      },
    ].filter((review) => review.userId && (review.productId || review.planId)),
  });

  await prisma.order.create({
    data: {
      customerFirstName: 'Usuario',
      customerLastName: 'Demo',
      customerEmail: user.email!,
      customerPhone: user.phone!,
      totalAmount: 129.99,
      status: 'COMPLETED',
      paymentMethod: 'STRIPE',
      paymentId: 'demo-payment-id',
      items: [{ title: createdProducts[0]?.title, quantity: 1, price: 129.99 }],
    },
  });

  console.log('✅ Seed completado');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });