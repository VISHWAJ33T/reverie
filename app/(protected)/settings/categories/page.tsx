import ProtectedSettingsCategories from "@/components/protected/settings/protected-settings-categories";
import { getAllCategories } from "@/lib/categories";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
  description: "Manage blog categories and nav visibility",
};

export const revalidate = 0;

export default async function CategoriesSettingsPage() {
  const categories = await getAllCategories();

  return (
    <div className="max-w-4xl px-10">
      <ProtectedSettingsCategories initialCategories={categories} />
    </div>
  );
}
