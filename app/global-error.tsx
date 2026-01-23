"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error }: { error: Error }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center bg-red-50 px-6 py-24 sm:py-32 lg:px-8">
      <div className="w-full max-w-3xl text-center">
        <h2 className="text-5xl font-semibold text-red-600">¡Vaya!</h2>
        <p className="mt-6 text-lg text-gray-700">Ha ocurrido un {error.name} | {error.message ?? "inesperado"}</p>
        <div className="flex items-center justify-center gap-6">
        <button
          onClick={() => window.location.reload()}
          className="mt-10 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500" >
          Intentar de nuevo
        </button>
        <Link href={"/"} className="mt-10 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
          Ir al inicio
        </Link>
        </div>
      </div>
    </div>
  );
}