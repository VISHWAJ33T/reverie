import { getCategoryIcon } from "@/lib/category-icons";
import {
  Pencil2Icon as DraftIcon,
  CheckCircledIcon as PublishedIcon,
} from "@radix-ui/react-icons";

export const statuses = [
  {
    value: "published",
    label: "Published",
    icon: PublishedIcon,
  },
  {
    value: "draft",
    label: "Draft",
    icon: DraftIcon,
  },
];

export type TableCategoryOption = {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
};

export function categoriesToTableOptions(
  categories: { id: string; title: string | null; slug: string | null }[]
): TableCategoryOption[] {
  return categories.map((c) => ({
    value: c.id,
    label: c.title ?? c.slug ?? "Unnamed",
    icon: getCategoryIcon(c.slug),
  }));
}
