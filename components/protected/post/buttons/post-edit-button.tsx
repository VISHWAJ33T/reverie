import { DeletePost } from "@/actions/post/delete-post";
import { PublishDraft } from "@/actions/post/publish-draft";
import { UnpublishPost } from "@/actions/post/unpublish-post";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { protectedPostConfig } from "@/config/protected";
import { createClient } from "@/utils/supabase/client";
import { Session } from "@supabase/supabase-js";
import {
  CheckCircle2 as PublishIcon,
  ExternalLink as ViewIcon,
  MoreVertical as ElipsisIcon,
  Loader2 as SpinnerIcon,
  Trash as TrashIcon,
  XCircle as UnpublishIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { FC, useState } from "react";
import toast from "react-hot-toast";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PostEditButtonProps {
  id?: string;
  status?: string;
  slug?: string;
}

const PostEditButton: FC<PostEditButtonProps> = ({
  id,
  status = "draft",
  slug = "",
}) => {
  const supabase = createClient();
  const router = useRouter();
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [isUnpublishing, setIsUnpublishing] = useState<boolean>(false);
  const [session, setSession] = React.useState<Session | null>(null);
  const [showLoadingAlert, setShowLoadingAlert] = useState<boolean>(false);

  const isPublished = status === "published";

  async function handleUnpublish() {
    if (!id) return;
    setIsUnpublishing(true);
    const result = await UnpublishPost(id);
    if (result.success) {
      toast.success(protectedPostConfig.successUnpublish);
      router.refresh();
    } else {
      toast.error(
        !result.success ? result.error : protectedPostConfig.errorUnpublish
      );
    }
    setIsUnpublishing(false);
  }

  async function handlePublish() {
    if (!id) return;
    setIsPublishing(true);
    const result = await PublishDraft(id);
    if (result.success && result.data) {
      toast.success(protectedPostConfig.successPublish);
      router.push(`/posts/${result.data.postSlug}`);
    } else {
      toast.error(
        !result.success ? result.error : protectedPostConfig.errorPublish
      );
    }
    setIsPublishing(false);
    router.refresh();
  }

  // Check authentitication and bookmark states
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [id, session?.user.id, supabase.auth]);

  // Delete post
  async function deleteMyPost() {
    setIsDeleteLoading(true);
    if (id && session?.user.id) {
      const myPostData = {
        id: id,
        user_id: session?.user.id,
      };
      const response = await DeletePost(myPostData);
      if (response) {
        setIsDeleteLoading(false);
        toast.success(protectedPostConfig.successDelete);
        router.refresh();
      } else {
        setIsDeleteLoading(false);
        toast.error(protectedPostConfig.errorDelete);
      }
    } else {
      setIsDeleteLoading(false);
      toast.error(protectedPostConfig.errorDelete);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-muted">
          <ElipsisIcon className="h-4 w-4" />
          <span className="sr-only">Open</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="font-sans">
          <DropdownMenuItem
            onClick={() => {
              setShowLoadingAlert(true);
              router.push(`/editor/posts/${id}`);
              setShowLoadingAlert(false);
            }}
          >
            {protectedPostConfig.edit}
          </DropdownMenuItem>
          {!isPublished && (
            <DropdownMenuItem
              onClick={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PublishIcon className="mr-2 h-4 w-4" />
              )}
              {protectedPostConfig.publish}
            </DropdownMenuItem>
          )}
          {isPublished && slug && (
            <DropdownMenuItem
              onClick={() => router.push(`/posts/${slug}`)}
            >
              <ViewIcon className="mr-2 h-4 w-4" />
              {protectedPostConfig.viewPublished}
            </DropdownMenuItem>
          )}
          {isPublished && (
            <DropdownMenuItem
              onClick={handleUnpublish}
              disabled={isUnpublishing}
            >
              {isUnpublishing ? (
                <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UnpublishIcon className="mr-2 h-4 w-4" />
              )}
              {protectedPostConfig.unpublish}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex cursor-pointer items-center text-destructive focus:text-destructive"
            onSelect={() => setShowDeleteAlert(true)}
          >
            {protectedPostConfig.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Delete alert */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="text-md font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {protectedPostConfig.questionDelete}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {protectedPostConfig.warning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{protectedPostConfig.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={deleteMyPost}>
              {isDeleteLoading ? (
                <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <TrashIcon className="mr-2 h-4 w-4" />
              )}
              <span>{protectedPostConfig.confirm}</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Loading alert */}
      <AlertDialog open={showLoadingAlert} onOpenChange={setShowLoadingAlert}>
        <AlertDialogContent className="font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              {protectedPostConfig.pleaseWait}
            </AlertDialogTitle>
            <AlertDialogDescription className="mx-auto text-center">
              <SpinnerIcon className="h-6 w-6 animate-spin" />
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PostEditButton;
