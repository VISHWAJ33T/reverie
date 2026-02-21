import ProtectedSettingsCategories from "@/components/protected/settings/protected-settings-categories";
import { getCurrentUserIsAdmin } from "@/lib/auth";
import { getAllCategories } from "@/lib/categories";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Categories",
  description: "Manage blog categories and nav visibility",
};

export const revalidate = 0;

export default async function CategoriesSettingsPage() {
  const isAdmin = await getCurrentUserIsAdmin();
  if (!isAdmin) redirect("/settings");

  const categories = await getAllCategories();

  return (
    <div className="max-w-4xl px-10">
      <ProtectedSettingsCategories initialCategories={categories} />
    </div>
  );
}
