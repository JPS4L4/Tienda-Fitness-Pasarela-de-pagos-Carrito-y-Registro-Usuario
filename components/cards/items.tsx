"use client"

import { itemProps } from "@/app/data/data";

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