"use client"

import { ItemProps } from "@/app/data/data";
import { ShoppingCart, Check} from "lucide-react";
import { useState } from "react";
import { SafeImage } from "../SafeImage";

const ItemCard = ({
   title, price, category, originalPrice, discount, installments, image, isOfferOfTheDay
}: ItemProps
) => {
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = () => {
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleMoreDetails = (title: string) => {
        if(!title) return;
        title = title.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
        window.location.href = `/products/${title}`;
    };

    return(
       <div className="flex flex-col bg-white rounded-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer w-full max-w-[350px] overflow-hidden group">
      
      {/* Cuerpo de la tarjeta */}
      <div className="p-4 flex flex-col gap-1 flex-1">
        {/*Contenedor OnClick para Ir a los detalles del producto */}
        <div onClick={() => handleMoreDetails(title)} className="flex-1 flex flex-col gap-2">
         {/* Contenedor de Imagen y Badge */}
      <div className="relative border-b border-gray-100 aspect-square flex items-center justify-center p-4">
        {isOfferOfTheDay && (
          <span className="absolute top-3 right-3 z-20 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-sm tracking-wider uppercase">
            Oferta del día
          </span>
        )}
        
        <SafeImage src={image} alt={title}/>
      </div>
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
      
        {/* Botones de acción */}
        {/* <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => handleMoreDetails(title)}
            className="flex-1 bg-orange-600 opacity-70 hover:bg-orange-700 text-white py-2 px-3 rounded text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
          >
            Comprar
          </button>
          <button
            onClick={handleAddToCart}
            className={`flex-1 py-2 px-3 rounded text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              isAdded
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                Agregado
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Carrito
              </>
            )}
          </button>
        </div> */}
         </div>
    </div>
    )
}

export default ItemCard;