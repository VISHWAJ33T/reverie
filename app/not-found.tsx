import { SharedNotFound } from "@/components/shared";
import { getNavCategories } from "@/lib/categories";
import React from "react";

const NotFound = async () => {
  const navCategories = await getNavCategories();
  return <SharedNotFound navCategories={navCategories} />;
};

export default NotFound;
