import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileEditClient from "./ProfileEditClient";

export const dynamic = "force-dynamic";

export default async function ProfileEditPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return <ProfileEditClient />;
}
