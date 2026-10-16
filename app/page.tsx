import type { Metadata } from "next";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import MainLayout from "./(main)/layout";
import Home from "./(main)/page";

export const metadata: Metadata = {
  title: { absolute: `${BRAND_NAME} | ${BRAND_TAGLINE}` },
  alternates: { canonical: "/" },
};

export default function Page() {
  return (
    <MainLayout>
      <Home />
    </MainLayout>
  );
}