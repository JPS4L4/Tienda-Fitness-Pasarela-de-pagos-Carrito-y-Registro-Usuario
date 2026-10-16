import type { Metadata } from "next";
import { getPlansForUI } from "@/app/src/lib/plans";
import PlansPageClient from "./PlansPageClient";

export const metadata: Metadata = {
  title: "Planes",
  description: "Planes de nutrición y entrenamiento personalizados, con acceso al contenido completo al suscribirte.",
};

const PlansPage = async () => {
  const allPlans = await getPlansForUI();

  return <PlansPageClient plans={allPlans} />;
}

export default PlansPage;