import {
  CategoryHealthIcon,
  CategoryMarketingIcon,
  CategoryScienceIcon,
  CategoryTechnologyIcon,
} from "@/icons/categories";
const slugToIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  science: CategoryScienceIcon,
  health: CategoryHealthIcon,
  marketing: CategoryMarketingIcon,
  technology: CategoryTechnologyIcon,
};

const defaultIcon = CategoryScienceIcon;

export function getCategoryIcon(slug: string | null): React.ComponentType<{ className?: string }> {
  if (!slug) return defaultIcon;
  return slugToIcon[slug.toLowerCase()] ?? defaultIcon;
}
