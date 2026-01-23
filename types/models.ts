// types/index.ts o types/models.ts

// Usuario (para auth y perfil)
export interface User {
  id: string
  name: string | null
  email: string | null
  emailVerified: Date | null
  image: string | null
  createdAt: Date
  updatedAt: Date
  // Campos extras que necesites
  role?: "user" | "admin"
  phone?: string | null
  adress?: string | null
  location?: string | null
}

// Producto (items de tu tienda)
export interface Product {
  id: number
  title: string
  price: number
  category: string
  originalPrice?: number
  discount?: number
  installments?: number
  freeShipping?: boolean
  image?: string
  isOfferOfTheDay?: boolean
  slug?: string
  stock?: number
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface PlanResource {
  type: "video" | "image" | "pdf" | "document" | "link" | "checklist" | "audio"
  title: string                    // ej: "Rutina semana 1", "Receta batido proteico"
  url: string                      // enlace al video (YouTube/Vimeo), PDF, imagen, etc.
  description?: string             // opcional: breve texto
  duration?: string                // para videos: "12 min"
  order?: number                   // para ordenar en la página
  thumbnail?: string               // imagen preview para videos o PDFs
  isDownloadable?: boolean         // si es PDF o documento
}

export interface Plan {
  id: number
  type: "nutricion" | "entrenamiento"
  image: string
  title: string
  price: string
  coverage: string[]
  slug: string
  content?: string                 // texto principal en Markdown (opcional)
  resources: PlanResource[]        // ← aquí va todo el contenido rico
  // otros campos...
}

// Item en carrito (extiende Product + quantity)
export interface CartItem extends Product {
  quantity: number
}

// Orden/compra
export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled"
  createdAt: Date
  updatedAt: Date
  paymentMethod?: string
}

// ... y así con lo que necesites (Comment, Review, Favorite, etc.)