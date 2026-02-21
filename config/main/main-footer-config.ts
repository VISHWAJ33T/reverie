import { FooterType } from "@/types";

const mainFooterConfig: FooterType = {
  categories: [], // Categories come from DB via navCategories prop
  pages: [
    {
      title: "Home",
      slug: "/",
    },
    {
      title: "About Us",
      slug: "/about",
    },
  ],
  socials: [],
  legals: [],
  copyright: "",
};

export default mainFooterConfig;
