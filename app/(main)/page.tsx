import { MainPostItem, MainPostItemLoading } from "@/components/main";
import { SharedPagination } from "@/components/shared";
import { PostWithCategoryWithProfile } from "@/types/collection";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const revalidate = 0;

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch total pages
  const { count } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true });

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
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .range(from, to)
    .returns<PostWithCategoryWithProfile[]>();

  if (!data || error || !data.length) {
    notFound();
  }

  return (
    <>
      <div className="space-y-6">
        {data?.map((post) => (
          <Suspense key={post.id} fallback={<MainPostItemLoading />}>
            <MainPostItem post={post} />
          </Suspense>
        ))}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <SharedPagination
          page={page}
          totalPages={totalPages}
          baseUrl="/"
          pageUrl="?page="
        />
      )}
    </>
  );
}
