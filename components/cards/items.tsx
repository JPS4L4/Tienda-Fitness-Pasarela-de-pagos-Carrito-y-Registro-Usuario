"use client"

// Datos de prueba para simular productos
export const featuredProducts = [
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
  ];


interface itemProps {
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

const itemCard = ({
    id, title, price, category, originalPrice, discount, installments, image, isOfferOfTheDay
}: itemProps
) => {
    return(
       <div className="flex flex-col bg-white rounded-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer w-full max-w-[350px] overflow-hidden group">
      
      {/* Contenedor de Imagen y Badge */}
      <div className="relative border-b border-gray-100 aspect-square flex items-center justify-center p-4">
        {isOfferOfTheDay && (
          <span className="absolute top-3 right-3 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-sm tracking-wider uppercase">
            Oferta del día
          </span>
        )}
        
        {image ? (
          <img src={image} alt={title} className="object-contain w-full h-full" />
        ) : (
          <div className="text-gray-300">
             {/* Placeholder si no hay imagen */}
             <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z"/>
             </svg>
          </div>
        )}
      </div>

      {/* Cuerpo de la tarjeta */}
      <div className="p-4 flex flex-col gap-1">
        
        {/* Precios */}
        {originalPrice && (
          <span className="text-gray-400 text-xs line-through">
            ${originalPrice.toLocaleString()}
          </span>
        )}
        
        <div className="flex items-center gap-2">
          <span className="text-2xl text-slate-900 font-normal">
            ${price.toLocaleString()}
          </span>
          {discount && (
            <span className="text-emerald-500 text-sm font-medium">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Cuotas */}
        {installments && (
          <p className="text-sm text-slate-800">
            en <span className="text-emerald-500">{installments}x ${Math.round(price/installments).toLocaleString()}</span> sin interés
          </p>
        )}

        {/* Título del producto */}
        <h3 className="text-sm text-slate-600 font-normal mt-1 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        {/* Categoría */}
        <h3 className="text-sm text-slate-500 font-normal mt-1 leading-tight line-clamp-2">
            {category}
        </h3>
      </div>
    </div>
    )
}

export default itemCard;