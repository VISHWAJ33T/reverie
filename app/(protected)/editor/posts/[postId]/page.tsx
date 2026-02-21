import Editor from "@/components/protected/editor/editor";
import { Separator } from "@/components/ui/separator";
import { protectedEditorConfig } from "@/config/protected";
import { Draft } from "@/types/collection";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export const revalidate = 0;

interface PostEditorPageProps {
  params: Promise<{ postId: string }>;
}

async function getUserId() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.log("Error has occured while getting UserId!");
    console.log("Error message : ", error.message);
    return null;
  }

  return user ? user.id : null;
}

async function getPost(postId: string, userId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("drafts")
    .select("*")
    .match({ id: postId, author_id: userId })
    .single<Draft>();

  if (error) {
    console.log("Error has occured while getting post data");
    console.log("Error message : ", error.message);
    return null;
  }

  return data ? data : null;
}

async function getPublishedPostDate(postId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data } = await supabase
    .from("posts")
    .select("published_at")
    .eq("id", postId)
    .single();
  return data?.published_at ?? null;
}

async function getCategories() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("categories")
    .select("id, title, slug")
    .neq("slug", "/");

  if (error) {
    console.log("Error fetching categories:", error.message);
    return [];
  }

  return data ?? [];
}

// Get Cover image filename and public url
async function getCoverImageFileName(
  bucketName: string,
  userId: string,
  postId: string,
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(`${userId}/${postId}`, {
      limit: 1,
      offset: 0,
      sortBy: { column: "created_at", order: "asc" },
    });

  if (error) {
    console.log("Error has occured while collection filenames from bucket!");
    console.log("Error message : ", error.message);
    return null;
  }

  if (data && data.length > 0) {
    return data[0].name;
  }
  return null;
}

async function getCoverImageUrl(
  bucketName: string,
  userId: string,
  postId: string,
  fileName: string,
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(`${userId}/${postId}/${fileName}`);

  return data.publicUrl;
}

// Get Gallery images filenames and public urls
async function getGalleryImageFileNames(bucketName: string, userId: string | null, postId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(`${userId}/${postId}`, {
      limit: 10,
      offset: 0,
      sortBy: { column: "created_at", order: "asc" },
    });

  if (error) {
    console.log("Error has occured while collection filenames from bucket!");
    console.log("Error message : ", error.message);
    return null;
  }

  if (data) {
    const result = data?.map((item) => item.name);
    return result;
  }
  return null;
}

async function getGalleryImageUrls(
  bucketName: string,
  userId: string,
  postId: string,
  fileNames: string[],
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  let filePublicUrls: string[] = [];
  fileNames.map((fileName) => {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(`${userId}/${postId}/${fileName}`);

    data && filePublicUrls.push(data.publicUrl);
  });

  return filePublicUrls;
}

async function getIsAdmin(userId: string | null) {
  if (!userId) return false;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();
  return data?.is_admin === true;
}

export default async function PostEditorPage({ params }: PostEditorPageProps) {
  const resolvedParams = await params;
  const bucketNameCoverImage =
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_COVER_IMAGE!;
  const bucketNameGalleryImage =
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_GALLERY_IMAGE!;
  const userId = await getUserId();
  const [post, categories, isAdmin] = await Promise.all([
    getPost(resolvedParams.postId, userId || ""),
    getCategories(),
    getIsAdmin(userId),
  ]);
  const postPublishedAt =
    post?.status === "published" && post?.post_id
      ? await getPublishedPostDate(post.post_id)
      : null;

  // Cover image setup
  const coverImageFileName = await getCoverImageFileName(
    bucketNameCoverImage,
    userId || "",
    resolvedParams.postId,
  );
  const coverImagePublicUrl = await getCoverImageUrl(
    bucketNameCoverImage,
    userId || "",
    resolvedParams.postId,
    coverImageFileName || "",
  );

  // Gallery images setup
  const galleryImageFileNames = await getGalleryImageFileNames(
    bucketNameGalleryImage,
    userId,
    resolvedParams.postId,
  );
  const galleryImagePublicUrls = await getGalleryImageUrls(
    bucketNameGalleryImage,
    userId || "",
    resolvedParams.postId,
    galleryImageFileNames || [],
  );

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-5xl px-10">
      <div>
        <h3 className="text-lg font-medium">{protectedEditorConfig.title}</h3>
        <p className="py-2 text-sm text-muted-foreground">
          {protectedEditorConfig.description}
        </p>
      </div>
      <Separator className="mb-5 max-w-2xl" />
      <Editor
        post={post}
        userId={userId || ""}
        categories={categories}
        coverImageFileName={coverImageFileName || ""}
        coverImagePublicUrl={coverImagePublicUrl || ""}
        galleryImageFileNames={galleryImageFileNames || []}
        galleryImagePublicUrls={galleryImagePublicUrls || []}
        isAdmin={isAdmin}
        postId={post.status === "published" && post.post_id ? post.post_id : null}
        postPublishedAt={postPublishedAt}
      />
    </div>
  );
}
