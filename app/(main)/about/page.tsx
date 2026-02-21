import MainAboutPage from "@/components/main/pages/main-about-page";
import { getAboutPage } from "@/actions/about/get-about-page";
import React from "react";

export default async function About() {
  const about = await getAboutPage();
  return <MainAboutPage about={about} />;
}
