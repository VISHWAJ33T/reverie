import {
  BookmarksDataTable,
  ProtectedBookMarkTableTitle,
} from "@/components/protected/bookmark";
import { SharedTableEmpty } from "@/components/shared";
import { getAllCategories } from "@/lib/categories";
import { detailBookMarkConfig } from "@/config/detail";
import { sharedEmptyConfig } from "@/config/shared";
import { BookMarkWithPost, Post } from "@/types/collection";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import React from "react";

export const metadata: Metadata = {
  title: detailBookMarkConfig.title,
  description: detailBookMarkConfig.description,
};

interface BookmarksPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const BookmarksPage: React.FC<BookmarksPageProps> = async ({
  searchParams,
}) => {
  const resolvedSearchParams = await searchParams;
  let posts: Post[] = [];
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  // Fetch total pages
  const { count } = await supabase
    .from("bookmarks")
    .select("*", { count: "exact", head: true });

  // Fetch user data
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const [categories, bookmarksResult] = await Promise.all([
    getAllCategories(),
    supabase
      .from("bookmarks")
      .select(`*, posts(*)`)
      .order("created_at", { ascending: false })
      .match({ user_id: user?.id })
      .range(from, to)
      .returns<BookMarkWithPost[]>(),
  ]);

  const { data, error } = bookmarksResult;

  if (error) {
    notFound();
  }

  data?.forEach((bookmark) => {
    posts.push(bookmark.posts);
  });

  return (
    <>
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        {posts?.length && posts?.length > 0 ? (
          <>
            <ProtectedBookMarkTableTitle />
            <BookmarksDataTable data={posts} categories={categories} />
          </>
        ) : (
          <SharedTableEmpty
            emptyTitle={sharedEmptyConfig.title}
            emptyDescription={sharedEmptyConfig.description}
          />
        )}
      </div>
    </>
  );
};

export default BookmarksPage;
