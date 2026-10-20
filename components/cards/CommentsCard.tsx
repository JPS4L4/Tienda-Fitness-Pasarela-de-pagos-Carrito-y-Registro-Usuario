"use client"
import { CommentsProps } from "@/app/data/data";
import Image from "next/image";
import { Star } from "lucide-react";


export const CommentsCard = ({ name, role, content, avatar, rating = 5 }: CommentsProps) => {
  return (
    <div className="snap-center shrink-0 w-[300px] md:w-[400px] bg-surface p-8   border border-line flex flex-col justify-between  transition-shadow duration-300">
      <div>
        {/* Estrellas de valoración */}
        <div className="flex gap-1 mb-4">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} size={16} className="fill-accent text-accent" />
          ))}
        </div>

        {/* Contenido del testimonio */}
        <p className="text-muted italic mb-8 leading-relaxed">
          &ldquo;{content}&rdquo;
        </p>
      </div>

      {/* Info del Atleta */}
      <div className="flex items-center gap-4">
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            width={48}
            height={48}
            className="w-12 h-12 object-cover border-2 border-line"
          />
        ) : (
          <div className="w-12 h-12 bg-accent/10 text-accent  flex items-center justify-center font-bold text-sm">
            {name.split(" ").map(n => n[0]).join("")}
          </div>
        )}
        
        <div>
          <p className="font-bold text-fg text-sm">{name}</p>
          <p className="text-xs text-subtle font-medium">{role}</p>
        </div>
      </div>
    </div>
  );
};