import PostTableEmpty from "@/components/protected/post/post-emtpy-table";
import PostRefreshOnce from "@/components/protected/post/post-refresh-once";
import PostTableTitle from "@/components/protected/post/post-table-title";
import { PostsDataTable } from "@/components/protected/post/posts-data-table";
import { protectedPostConfig } from "@/config/protected";
import { getAllCategories } from "@/lib/categories";
import { Draft } from "@/types/collection";
import type { Database } from "@/types/supabase";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { FC } from "react";

export const revalidate = 0;

export const metadata: Metadata = {
  title: protectedPostConfig.title,
  description: protectedPostConfig.description,
};

interface PostsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const PostsPage: FC<PostsPageProps> = async ({ searchParams }) => {
  const resolvedSearchParams = await searchParams;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [categories, postsResult] = await Promise.all([
    getAllCategories(),
    supabase
      .from("drafts")
      .select(`*, categories(*)`)
      .order("created_at", { ascending: false })
      .match({ author_id: user?.id })
      .returns<Draft[]>(),
  ]);

  const { data, error } = postsResult;

  if (error) {
    notFound();
  }
  return (
    <>
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        {data?.length && data?.length > 0 ? (
          <>
            <PostTableTitle />
            <PostsDataTable data={data} categories={categories} />
          </>
        ) : (
          <PostTableEmpty />
        )}
        <PostRefreshOnce />
      </div>
    </>
  );
};

export default PostsPage;
