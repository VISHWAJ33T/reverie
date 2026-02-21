import { MainPostItem } from "@/components/main";
import { SharedEmpty, SharedPagination } from "@/components/shared";
import { seoData } from "@/config/root/seo";
import { getCategoryBySlug } from "@/lib/categories";
import { getOgImageUrl, getUrl } from "@/lib/utils";
import { PostWithCategoryWithProfile } from "@/types/collection";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import React from "react";

interface CategoryPageProps {
  params: Promise<{
    slug: string[];
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug?.join("/");
  const category = await getCategoryBySlug(slug ?? "");

  if (!category) {
    return {};
  }

  return {
    title: category.title ?? undefined,
    description: seoData.absoluteTitle,
    authors: {
      name: seoData.author.name,
      url: seoData.author.twitterUrl,
    },
    openGraph: {
      title: category.title ?? undefined,
      description: seoData.absoluteTitle,
      type: "article",
      url: `${getUrl()}/category/${category.slug}`,
      images: [
        {
          url: getOgImageUrl(
            category.title ?? "",
            seoData.absoluteTitle,
            seoData.tags,
            category.slug ?? "",
          ),
          width: 1200,
          height: 630,
          alt: category.title ?? "",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: category.title ?? undefined,
      description: seoData.absoluteTitle,
      images: [
        getOgImageUrl(
          category.title ?? "",
          seoData.absoluteTitle,
          seoData.tags,
          category.slug ?? "",
        ),
      ],
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const slug = resolvedParams?.slug?.join("/");
  const category = await getCategoryBySlug(slug ?? "");

  if (!category) {
    notFound();
  }

  // Fetch total pages
  const { count } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("category_id", category.id);

  // Pagination
  const limit = 10;
  const totalPages = count ? Math.ceil(count / limit) : 0;
  const page =
    typeof resolvedSearchParams.page === "string" &&
    +resolvedSearchParams.page > 1 &&
    +resolvedSearchParams.page <= totalPages
      ? +resolvedSearchParams.page
      : 1;
  const from = (page - 1) * limit;
  const to = page ? from + limit : limit;

  // Fetch posts
  const { data, error } = await supabase
    .from("posts")
    .select(`*, categories(*), profiles(*)`)
    .match({ category_id: category.id, published: true })
    .order("published_at", { ascending: false, nullsFirst: false })
    .range(from, to)
    .returns<PostWithCategoryWithProfile[]>();

  if (!data || error || !data.length) {
    notFound();
  }

  return (
    <>
      {/* Posts */}
      <div className="my-5 space-y-6">
        {data?.length === 0 ? (
          <SharedEmpty />
        ) : (
          data?.map((post) => <MainPostItem key={post.id} post={post} />)
        )}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <SharedPagination
          page={page}
          totalPages={totalPages}
          baseUrl={`/category/${slug}`}
          pageUrl="?page="
        />
      )}
    </>
  );
}
