import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen w-full place-items-center bg-bg px-6 py-24">
      <div className="w-full max-w-5xl">
        <p className="price text-[clamp(7rem,28vw,20rem)] leading-none text-accent">404</p>
        <h1 className="mt-2 text-5xl text-fg sm:text-7xl">Página no encontrada</h1>
        <p className="mt-5 text-lg text-muted">La página que buscas no existe.</p>
        <div className="mt-8">
          <Link href="/" className="btn btn-primary btn-lg">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
