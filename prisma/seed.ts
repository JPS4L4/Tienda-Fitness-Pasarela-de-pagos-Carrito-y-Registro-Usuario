import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { applyDiscount } from '../lib/money';

function assertSafeSeedTarget() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL no está definida. Abortando seed.');
    process.exit(1);
  }
  let host = '';
  try {
    host = new URL(url).hostname;
  } catch {
    console.error('DATABASE_URL no es una URL válida. Abortando seed.');
    process.exit(1);
  }
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  if (!isLocal && process.env.SEED_ALLOW_REMOTE !== 'true') {
    console.error(
      `El seed BORRA todos los datos y la base de datos apunta a "${host}" (no es local). ` +
        'Abortando. Si estás seguro, ejecuta con SEED_ALLOW_REMOTE=true.'
    );
    process.exit(1);
  }
}

assertSafeSeedTarget();

// Cuentas de demostración (documentadas en el README). Contraseña solo para entornos de prueba.
const DEMO_PASSWORD = 'Prueba123!';
const DEMO_ADMIN_EMAIL = 'admin@fitness-studio.example';
const DEMO_USER_EMAIL = 'demo@fitness-studio.example';

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

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // Cuenta administradora de demostración (debe estar en ADMIN_EMAILS).
  await prisma.user.create({
    data: {
      name: 'Admin Demo',
      email: DEMO_ADMIN_EMAIL,
      phone: '+573001112200',
      emailVerified: new Date(),
      accounts: {
        create: { provider: 'credentials', password: passwordHash },
      },
    },
  });

  // Usuario de demostración con perfil fitness completo.
  const user = await prisma.user.create({
    data: {
      name: 'Usuario Demo',
      email: DEMO_USER_EMAIL,
      phone: '+573001112233',
      emailVerified: new Date(),
      weightKg: 72,
      heightCm: 175,
      age: 29,
      trainingTime: '6-12 meses',
      goal: 'Ganar masa muscular',
      equipmentAvailability: 'Básico (mancuernas/bandas)',
      healthCondition: 'Ninguna',
      fitnessProfileData: {
        weightKg: 72,
        heightCm: 175,
        age: 29,
        trainingTime: '6-12 meses',
        goal: 'Ganar masa muscular',
        equipmentAvailability: 'Básico (mancuernas/bandas)',
        healthCondition: 'Ninguna',
      },
      fitnessProfileCompleted: true,
      accounts: {
        create: { provider: 'credentials', password: passwordHash },
      },
    },
  });

  await prisma.item.createMany({
    data: [
      // ---------- Deportes / Equipamiento ----------
      {
        title: 'Kit de Pesas Ajustables 20kg',
        description: 'Equipo ideal para entrenamiento en casa.',
        shortDescription: 'Pesas ajustables premium',
        price: 160400,
        category: 'Deportes',
        discount: 19,
        installments: 12,
        freeShipping: true,
        images: ['/images/products/kit-pesas.webp'],
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
        price: 89600,
        category: 'Deportes',
        discount: 22,
        installments: 6,
        freeShipping: true,
        images: ['/images/products/mancuernas.webp'],
        slug: 'set-mancuernas-hexagonales-2x5kg',
        stock: 15,
        rating: 4.7,
        reviewCount: 18,
      },
      {
        title: 'Bandas de Resistencia Set x5',
        description: 'Set de 5 bandas elásticas de distintos niveles de resistencia para entrenamiento funcional.',
        shortDescription: 'Entrenamiento funcional en casa',
        price: 24900,
        category: 'Deportes',
        freeShipping: true,
        images: ['/images/products/bandas.webp'],
        slug: 'bandas-resistencia-set-x5',
        stock: 30,
        rating: 4.5,
        reviewCount: 22,
      },
      {
        title: 'Colchoneta de Yoga Antideslizante',
        description: 'Mat de yoga de 6mm de grosor, ideal para yoga, pilates y estiramientos.',
        shortDescription: 'Comodidad y agarre superior',
        price: 42700,
        category: 'Deportes',
        discount: 23,
        images: ['/images/products/colchoneta.webp'],
        slug: 'colchoneta-yoga-antideslizante',
        stock: 20,
        rating: 4.6,
        reviewCount: 14,
      },
      {
        title: 'Kettlebell de Hierro Fundido 12kg',
        description: 'Pesa rusa de una sola pieza, ideal para entrenamiento de fuerza y potencia.',
        shortDescription: 'Fuerza y resistencia funcional',
        price: 54900,
        category: 'Deportes',
        installments: 6,
        images: ['/images/products/kettlebell.webp'],
        slug: 'kettlebell-hierro-fundido-12kg',
        stock: 12,
        rating: 4.7,
        reviewCount: 9,
      },
      {
        title: 'Cuerda para Saltar Profesional',
        description: 'Cuerda de velocidad con rodamientos, ideal para cardio y boxeo.',
        shortDescription: 'Cardio de alta intensidad',
        price: 14900,
        category: 'Deportes',
        freeShipping: true,
        images: ['/images/products/cuerda.webp'],
        slug: 'cuerda-para-saltar-profesional',
        stock: 40,
        rating: 4.4,
        reviewCount: 16,
      },
      {
        title: 'Rodillo de Espuma para Masaje (Foam Roller)',
        description: 'Rodillo de espuma de alta densidad para liberación miofascial y recuperación muscular.',
        shortDescription: 'Recuperación muscular efectiva',
        price: 19900,
        category: 'Deportes',
        images: ['/images/products/foam-roller.webp'],
        slug: 'rodillo-espuma-foam-roller',
        stock: 25,
        rating: 4.5,
        reviewCount: 11,
      },

      // ---------- Tecnología ----------
      {
        title: 'Smartwatch Deportivo con GPS',
        description: 'Reloj inteligente con monitoreo avanzado.',
        shortDescription: 'Monitoreo fitness y estilo',
        price: 398900,
        category: 'Tecnología',
        installments: 6,
        images: ['/images/products/smartwatch.webp'],
        slug: 'smartwatch-series-9',
        stock: 5,
        rating: 4.6,
        reviewCount: 8,
      },
      {
        title: 'Banda de Frecuencia Cardíaca Bluetooth',
        description: 'Monitor de ritmo cardíaco con conexión Bluetooth y ANT+, compatible con apps de entrenamiento.',
        shortDescription: 'Precisión en tiempo real',
        price: 59600,
        category: 'Tecnología',
        discount: 23,
        images: ['/images/products/banda-cardiaca.webp'],
        slug: 'banda-frecuencia-cardiaca-bluetooth',
        stock: 18,
        rating: 4.5,
        reviewCount: 7,
      },
      {
        title: 'Báscula Inteligente con Bioimpedancia',
        description: 'Báscula digital que mide peso, grasa corporal, masa muscular e IMC, sincronizable con app.',
        shortDescription: 'Controla tu progreso al detalle',
        price: 54900,
        category: 'Tecnología',
        freeShipping: true,
        installments: 3,
        images: ['/images/products/bascula.webp'],
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
        price: 110100,
        category: 'Audio',
        discount: 22,
        freeShipping: true,
        images: ['/images/products/auriculares-nc.webp'],
        slug: 'auriculares-noise-cancelling',
        stock: 7,
        rating: 4.7,
        reviewCount: 10,
      },
      {
        title: 'Audífonos Deportivos Inalámbricos',
        description: 'Auriculares resistentes al sudor con gancho para la oreja, ideales para correr y entrenar.',
        shortDescription: 'Ajuste seguro para el deporte',
        price: 49900,
        category: 'Audio',
        discount: 20,
        freeShipping: true,
        images: ['/images/products/audifonos-dep.webp'],
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
        price: 74900,
        category: 'Suplementos',
        discount: 16,
        installments: 3,
        freeShipping: true,
        images: ['/images/products/whey.webp'],
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
        price: 9900,
        category: 'Suplementos',
        images: ['/images/products/shaker.webp'],
        slug: 'shaker-mezclador-proteina-700ml',
        stock: 50,
        rating: 4.3,
        reviewCount: 19,
      },
      {
        title: 'Pre-Entreno Energía Extrema 300g',
        description: 'Fórmula pre-entreno con cafeína y beta-alanina para maximizar el rendimiento en el gimnasio.',
        shortDescription: 'Máxima energía para entrenar',
        price: 34900,
        category: 'Suplementos',
        freeShipping: true,
        images: ['/images/products/preentreno.webp'],
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
        price: 59900,
        category: 'Ropa Deportiva',
        discount: 25,
        freeShipping: true,
        images: ['/images/products/conjunto.webp'],
        slug: 'conjunto-deportivo-mujer-leggings-top',
        stock: 18,
        rating: 4.7,
        reviewCount: 21,
      },
      {
        title: 'Camiseta Deportiva Hombre Dry-Fit',
        description: 'Camiseta transpirable de secado rápido, ideal para entrenamientos de alta intensidad.',
        shortDescription: 'Frescura durante todo el entrenamiento',
        price: 22900,
        category: 'Ropa Deportiva',
        images: ['/images/products/camiseta.webp'],
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
        price: 119900,
        category: 'Calzado',
        discount: 25,
        installments: 6,
        freeShipping: true,
        images: ['/images/products/zap-running.webp'],
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
        price: 74900,
        category: 'Calzado',
        installments: 4,
        images: ['/images/products/zap-cross.webp'],
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
        price: 17900,
        category: 'Accesorios',
        images: ['/images/products/guantes.webp'],
        slug: 'guantes-entrenamiento-munequera',
        stock: 28,
        rating: 4.4,
        reviewCount: 8,
      },
      {
        title: 'Botella de Agua Deportiva 1L con Marcador de Tiempo',
        description: 'Botella con marcas de motivación para controlar tu hidratación durante el día.',
        shortDescription: 'Hidratación consciente',
        price: 12900,
        category: 'Accesorios',
        freeShipping: true,
        images: ['/images/products/botella.webp'],
        slug: 'botella-agua-deportiva-1l',
        stock: 45,
        rating: 4.3,
        reviewCount: 14,
      },
    ],
  });

  await prisma.plan.createMany({
    data: [
      // ---------- Nutrición ----------
      {
        type: 'nutricion',
        title: 'Plan Nutricional Básico',
        image: '/images/plans/nutricion.webp',
        description: 'Plan nutritivo ideal para comenzar.',
        shortDescription: 'Ideal para iniciar',
        tags: ['nutrición', 'principiante'],
        price: 48900,
        slug: 'plan-nutricional-basico',
        coverage: ['Evaluación nutricional inicial', 'Plan semanal', 'Recetas básicas'],
        rating: 4.5,
        reviewCount: 6,
      },
      {
        type: 'nutricion',
        title: 'Plan Nutricional Pérdida de Grasa',
        image: '/images/plans/nutricion-grasa.webp',
        description: 'Plan alimenticio enfocado en déficit calórico controlado para perder grasa de forma sostenible.',
        shortDescription: 'Definición y control de peso',
        tags: ['nutrición', 'pérdida de grasa'],
        price: 68900,
        discount: 10,
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
        image: '/images/plans/nutricion-musculo.webp',
        description: 'Plan de alimentación con superávit calórico y alto contenido proteico para ganar masa muscular.',
        shortDescription: 'Volumen limpio y masa magra',
        tags: ['nutrición', 'volumen', 'masa muscular'],
        price: 74900,
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
        image: '/images/plans/nutricion-vegetariano.webp',
        description: 'Plan nutricional 100% vegetariano diseñado para deportistas y personas activas.',
        shortDescription: 'Nutrición vegetal para el rendimiento',
        tags: ['nutrición', 'vegetariano'],
        price: 58900,
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
        image: '/images/plans/hogar.webp',
        description: 'Rutina práctica para entrenar en casa.',
        shortDescription: 'Entrena desde casa',
        tags: ['fitness', 'casa'],
        price: 58900,
        slug: 'plan-entrenamiento-home-gym',
        coverage: ['Rutina personalizada', 'Videos de apoyo', 'Seguimiento semanal'],
        rating: 4.8,
        reviewCount: 9,
      },
      {
        type: 'entrenamiento',
        title: 'Plan de Entrenamiento de Fuerza en Gimnasio',
        image: '/images/plans/fuerza.webp',
        description: 'Programa de fuerza progresiva de 8 semanas diseñado para gimnasio con pesas libres y máquinas.',
        shortDescription: 'Gana fuerza de forma progresiva',
        tags: ['fitness', 'fuerza', 'gimnasio'],
        price: 78900,
        discount: 15,
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
        image: '/images/plans/fuerza.webp',
        description: 'Rutinas de alta intensidad de 20-30 minutos diseñadas para maximizar la quema calórica.',
        shortDescription: 'Resultados rápidos y efectivos',
        tags: ['fitness', 'hiit', 'cardio'],
        price: 54900,
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
        image: '/images/plans/running.webp',
        description: 'Programa progresivo para corredores que buscan pasar de correr 5K a completar 10K.',
        shortDescription: 'Prepárate para tu próxima carrera',
        tags: ['fitness', 'running', 'resistencia'],
        price: 64900,
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

  // Guardia: ningún producto o plan puede quedar en 0, negativo, ni con un descuento fuera de 0-90
  // ni con un precio final <= 0 (el catálogo del demo nunca debe mostrar "$ 0").
  for (const entry of [...createdProducts, ...createdPlans]) {
    const final = applyDiscount(entry.price, entry.discount);
    const discount = entry.discount ?? 0;
    if (!(entry.price > 0) || !(final > 0) || discount < 0 || discount > 90) {
      throw new Error(`Seed inválido: "${entry.title}" (precio ${entry.price}, descuento ${entry.discount})`);
    }
  }

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

  // Lo cobrado es el precio con descuento (mismo cálculo que el servidor)
  const demoProduct = createdProducts[0];
  const demoProductPrice = demoProduct ? applyDiscount(demoProduct.price, demoProduct.discount) : 0;
  await prisma.order.create({
    data: {
      userId: user.id,
      customerFirstName: 'Usuario',
      customerLastName: 'Demo',
      customerEmail: user.email!,
      customerPhone: user.phone!,
      totalAmount: demoProductPrice,
      status: 'COMPLETED',
      paymentMethod: 'STRIPE',
      paymentId: 'demo-payment-id',
      items: [{ title: demoProduct?.title, quantity: 1, price: demoProductPrice }],
    },
  });

  // Suscripción activa a un plan, para que el perfil y el contenido del plan no salgan vacíos.
  const demoPlan = createdPlans[0];
  if (demoPlan) {
    const demoPlanPrice = applyDiscount(demoPlan.price, demoPlan.discount);
    await prisma.plan.update({
      where: { id: demoPlan.id },
      data: {
        content:
          '## Semana 1\n- Desayuno: avena con fruta y proteína.\n- Almuerzo: pollo, arroz integral y ensalada.\n- Cena: pescado al horno con verduras.\n\n(Contenido de demostración visible solo para suscriptores.)',
      },
    });
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    const accessToken = 'demo-access-token-' + randomBytes(8).toString('hex');
    const planOrder = await prisma.order.create({
      data: {
        userId: user.id,
        planId: demoPlan.id,
        customerFirstName: 'Usuario',
        customerLastName: 'Demo',
        customerEmail: user.email!,
        customerPhone: user.phone!,
        totalAmount: demoPlanPrice,
        status: 'COMPLETED',
        paymentMethod: 'STRIPE',
        paymentId: 'demo-plan-payment-id',
        items: [{ title: demoPlan.title, quantity: 1, price: demoPlanPrice }],
        accessToken,
        tokenExpiresAt: endDate,
        subscriptionType: 'monthly',
        subscriptionStatus: 'ACTIVE',
      },
    });
    await prisma.userSubscription.create({
      data: {
        userId: user.id,
        planId: demoPlan.id,
        orderId: planOrder.id,
        status: 'active',
        startDate: new Date(),
        endDate,
        accessToken,
      },
    });
  }

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