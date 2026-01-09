export type PlanType = "nutricion" | "entrenamiento";

export interface ItemProps {
  id: number;
  title: string;
  price: number;
  category: string;
  originalPrice?: number;
  discount?: number;
  installments?: number;
  freeShipping?: boolean;
  image?: string;
  isOfferOfTheDay?: boolean;
}

export interface CommentsProps {
  name: string;
  role: string;
  content: string;
  avatar?: string;
  rating?: number;
}

export interface Plan {
  id: number;
  type: PlanType; // <-- Esto es lo que causaba el error
  title: string;
  coverage: string[];
  price?: string;
}

// Definimos la estructura global de la "DB"
interface Database {
  users: any[]; // Puedes definir una interfaz User más adelante
  plans: Plan[];
  items: ItemProps[];
  comments: CommentsProps[];
}

export const db: Database = {
    users:[],
    plans: [
        {
    id: 1,
    type: "nutricion",
    title: "Plan Nutricional Básico",
    price: "Desde $49",
    coverage: [
      "Evaluación nutricional inicial",
      "Plan alimenticio personalizado (4 semanas)",
      "Lista de compras y recetas",
    ],
  },
  {
    id: 2,
    type: "nutricion",
    title: "Plan Nutricional Avanzado",
    price: "Desde $89",
    coverage: [
      "Evaluación nutricional avanzada",
      "Plan alimenticio personalizado (8 semanas)",
      "Seguimiento quincenal con ajustes",
      "Educación nutricional",
    ],
  },
  {
    id: 3,
    type: "entrenamiento",
    title: "Plan de Entrenamiento Home Gym",
    price: "Desde $59",
    coverage: [
      "Rutina personalizada según objetivos",
      "Variantes para nivel principiante/intermedio",
      "Instrucciones en video y progresiones",
    ],
  },
  {
    id: 4,
    type: "entrenamiento",
    title: "Plan de Fuerza y Rendimiento",
    price: "Desde $99",
    coverage: [
      "Evaluación de fuerza inicial",
      "Programa de 12 semanas",
      "Control de cargas y progresión semanal",
      "Consejos de recuperación y movilidad",
    ],
  },
  {
    id: 5,
    type: "nutricion",
    title: "Plan de Perdida de Grasa",
    price: "Desde $79",
    coverage: [
      "Déficit calórico personalizado",
      "Plan alimenticio y recetas",
      "Seguimiento y ajustes semanales",
    ],
  },
    ],
    items:[
         {
      id:1,
      title: "Kit de Pesas Ajustables 20kg - Entrenamiento en Casa",
      price: 129.99,
      category: "Deportes",
      originalPrice: 159.99,
      discount: 19,
      installments: 12,
      isOfferOfTheDay: true,
      image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=500",
    },
    {
      id:2,
      title: "Smartwatch Series 9 - Pantalla Retina",
      price: 399.00,
      category: "Tecnología",
      installments: 6,
      image: "https://images.unsplash.com/photo-1546868871-70c122469d8b?q=80&w=500",
    },
    {
       id:3,
      title: "Auriculares Noise Cancelling Bluetooth",
      price: 85.50,
      category: "Audio",
      originalPrice: 110.00,
      discount: 22,
      freeShipping: true,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500",
    },
    {
       id:4,
      title: "Cafetera Espresso Automática",
      price: 150.00,
      category: "Hogar",
      isOfferOfTheDay: false,
      installments: 3,
      image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?q=80&w=500",
    },
    {
      id:5,
      title: "Banda Elástica de Resistencia Premium",
      price: 45.99,
      category: "Deportes",
      originalPrice: 65.00,
      discount: 29,
      image: "https://images.unsplash.com/photo-1587280191167-51db060d93c6?q=80&w=500",
    },
    {
      id:6,
      title: "Mouse Inalámbrico Ergonómico",
      price: 55.00,
      category: "Tecnología",
      originalPrice: 75.00,
      discount: 27,
      freeShipping: true,
      image: "https://images.unsplash.com/photo-1527814050087-3793815479db?q=80&w=500",
    },
    {
      id:7,
      title: "Altavoz Portátil Bluetooth Resistente Agua",
      price: 95.00,
      category: "Audio",
      installments: 3,
      image: "https://images.unsplash.com/photo-1589003077984-894e133da19d?q=80&w=500",
    },
    {
      id:8,
      title: "Lámpara LED Inteligente RGB",
      price: 72.50,
      category: "Hogar",
      originalPrice: 99.99,
      discount: 27,
      image: "https://images.unsplash.com/photo-1565193566173-7ceb50291aa9?q=80&w=500",
    },
    {
      id:9,
      title: "Colchoneta de Yoga Extra Gruesa",
      price: 59.99,
      category: "Deportes",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=500",
    },
    {
      id:10,
      title: "Teclado Mecánico Gaming RGB",
      price: 189.99,
      category: "Tecnología",
      originalPrice: 249.99,
      discount: 24,
      installments: 6,
      image: "https://images.unsplash.com/photo-1587829191301-dc798b83add3?q=80&w=500",
    }
    ],
    comments:[
        {
    name: "Carlos Ruiz",
    role: "Atleta Amateur",
    content: "Increíble experiencia, logré mis objetivos en tiempo récord gracias a los entrenadores y al plan de nutrición.",
    rating: 5
  },
  {
    name: "Elena Gómez",
    role: "Powerlifter",
    content: "El seguimiento quincenal es lo que marca la diferencia. Nunca me había sentido tan fuerte y saludable.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&h=150&auto=format&fit=crop"
  },
  // Puedes añadir más aquí...
  {
    name: "Juan Gonzalez",
    role: "Powerlifter",
    content: "El seguimiento quincenal es lo que marca la diferencia. Nunca me había sentido tan fuerte y saludable.",
    rating: 5,
  },
    ],
}