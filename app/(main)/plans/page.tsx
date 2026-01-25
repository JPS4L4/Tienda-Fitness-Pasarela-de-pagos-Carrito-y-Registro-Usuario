import { PlanCard } from "@/components/cards/PlanCard";
import { getPlansForUI } from "@/app/src/lib/plans";
import PlansPageClient from "./PlansPageClient";

const PlansPage = async () => {
  const allPlans = await getPlansForUI();

  return <PlansPageClient plans={allPlans} />;
}

export default PlansPage;