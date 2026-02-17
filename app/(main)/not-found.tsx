import { SharedNotFound } from "@/components/shared";
import { getNavCategories } from "@/lib/categories";

const NotFound = async () => {
  const navCategories = await getNavCategories();
  return <SharedNotFound navCategories={navCategories} />;
};

export default NotFound;
