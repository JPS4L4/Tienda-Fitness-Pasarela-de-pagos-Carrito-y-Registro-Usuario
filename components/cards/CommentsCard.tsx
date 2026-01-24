"use client"
import { CommentsProps } from "@/app/data/data";
import { Star } from "lucide-react";


export const CommentsCard = ({ name, role, content, avatar, rating = 5 }: CommentsProps) => {
  return (
    <div className="snap-center shrink-0 w-[300px] md:w-[400px] bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
      <div>
        {/* Estrellas de valoración */}
        <div className="flex gap-1 mb-4">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
          ))}
        </div>

        {/* Contenido del testimonio */}
        <p className="text-slate-600 italic mb-8 leading-relaxed">
          "{content}"
        </p>
      </div>

      {/* Info del Atleta */}
      <div className="flex items-center gap-4">
        {avatar ? (
          <img 
            src={avatar} 
            alt={name} 
            className="w-12 h-12 rounded-full object-cover border-2 border-slate-50"
          />
        ) : (
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
            {name.split(" ").map(n => n[0]).join("")}
          </div>
        )}
        
        <div>
          <p className="font-bold text-slate-900 text-sm">{name}</p>
          <p className="text-xs text-slate-400 font-medium">{role}</p>
        </div>
      </div>
    </div>
  );
};