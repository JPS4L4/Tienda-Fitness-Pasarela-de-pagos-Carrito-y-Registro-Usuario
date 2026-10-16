import type { Metadata } from "next";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: { absolute: `${BRAND_NAME} | ${BRAND_TAGLINE}` },
  alternates: { canonical: "/" },
};

export default function Page() {
  return <HomeClient />;
}
