export default function NotFound() {
  return (
    <main className="h-screen w-full grid place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="w-full max-w-7xl">
          <div className="text-center  p-8 rounded-xl lg:text-left px-4">
            <p className="text-base font-semibold text-orange-600">404</p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-black sm:text-7xl">Página no encontrada</h1>
            <p className="mt-6 text-lg text-gray-800">La página que buscas no existe.</p>
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-x-6">
              <a href="/" className="rounded-md bg-orange-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400">Volver al inicio</a>
            </div>
          </div>

         
       
      </div>
    </main>
  );
}