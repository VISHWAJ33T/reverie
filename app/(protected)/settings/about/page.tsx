import ProtectedSettingsAbout from "@/components/protected/settings/protected-settings-about";
import { getAboutPage } from "@/actions/about/get-about-page";
import { getCurrentUserIsAdmin } from "@/lib/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "About page",
  description: "Edit the public about page content",
};

export const revalidate = 0;

export default async function AboutSettingsPage() {
  const isAdmin = await getCurrentUserIsAdmin();
  if (!isAdmin) redirect("/settings");

  const about = await getAboutPage();

  return (
    <div className="max-w-4xl px-10">
      <ProtectedSettingsAbout initialAbout={about} />
    </div>
  );
}
