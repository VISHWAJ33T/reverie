"use client";

import { PublishDraft } from "@/actions/post/publish-draft";
import { UnpublishPost } from "@/actions/post/unpublish-post";
import { UpdatePost } from "@/actions/post/update-post";
import WysiwygEditor from "@/components/protected/editor/wysiwyg/wysiwyg-editor";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FileUploadModal from "@/components/ui/file-upload-modal";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { protectedEditorConfig, protectedPostConfig } from "@/config/protected";
import { postEditFormSchema } from "@/lib/validation/post";
import { Draft } from "@/types/collection";
import { PaperClipIcon } from "@heroicons/react/20/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { SparklesIcon, Loader2 as SpinnerIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import slugify from "react-slugify";
import { v4 } from "uuid";
import * as z from "zod";
import {
  EditorUploadCoverImageItem,
  EditorUploadCoverImagePlaceHolder,
  EditorUploadGalleryImageTable,
  EditorUploadGalleryImageTableEmpty,
} from "./upload";
import { defaultEditorContent } from "./wysiwyg/default-content";

export const dynamic = "force-dynamic";

type FormData = z.infer<typeof postEditFormSchema>;

interface EditorProps {
  post: Draft;
  userId: string;
  categories: { id: string; title: string | null; slug: string | null }[];
  coverImageFileName: string;
  coverImagePublicUrl: string;
  galleryImageFileNames: string[];
  galleryImagePublicUrls: string[];
}

type EditorFormValues = z.infer<typeof postEditFormSchema>;

const Editor: FC<EditorProps> = ({
  post,
  userId,
  categories,
  coverImageFileName,
  coverImagePublicUrl,
  galleryImageFileNames,
  galleryImagePublicUrls,
}) => {
  const router = useRouter();

  // These are the values that will be used to upload the image
  const allowedNumberOfImages = 9 - galleryImagePublicUrls.length;
  // States
  const [isSaving, setIsSaving] = useState(false);
  const [showLoadingAlert, setShowLoadingAlert] = useState<boolean>(false);
  const [showCoverModal, setShowCoverModal] = useState<boolean>(false);
  const [showGalleryModal, setShowGalleryModal] = useState<boolean>(false);

  // Editor
  const [saveStatus, setSaveStatus] = useState("Saved");

  const [content, setContent] = useState<string | null>(post?.content || null);

  // Supabase Storage bucket names
  const bucketNameCoverImage =
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_COVER_IMAGE ||
    "cover-image";
  const bucketNameGalleryImage =
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_GALLERY_IMAGE ||
    "gallery-image";

  // Handle cover image upload complete
  const handleCoverUploadComplete = () => {
    toast.success(protectedEditorConfig.successMessageImageUpload);
    router.refresh();
  };

  // Handle gallery image upload complete
  const handleGalleryUploadComplete = () => {
    toast.success(protectedEditorConfig.successMessageImageUpload);
    router.refresh();
  };

  // Handle upload error
  const handleUploadError = (error: string) => {
    toast.error(error || protectedEditorConfig.errorMessageImageUpload);
  };

  // Default category: use post's category if valid, else first from DB
  const validCategoryIds = categories.map((c) => c.id);
  const defaultCategoryId =
    post.category_id && validCategoryIds.includes(post.category_id)
      ? post.category_id
      : categories[0]?.id ?? "";

  // Default values for the form. Use coverImageFileName when post.image is empty
  // so that after uploading a cover image (before save) the filename is persisted on next save.
  const defaultValues: Partial<EditorFormValues> = {
    title: post.title ?? "Untitled",
    slug: post.slug ?? `post-${v4()}`,
    image: post.image ?? coverImageFileName ?? "",
    categoryId: defaultCategoryId,
    description: post.description ?? "Post description",
    content: content ?? protectedEditorConfig.placeholderContent,
  };

  const form = useForm<EditorFormValues>({
    resolver: zodResolver(postEditFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // After upload, server refetches and passes new coverImageFileName; sync it into the form
  // so the next save persists the filename (defaultValues only apply on mount).
  useEffect(() => {
    if (coverImageFileName?.trim()) {
      form.setValue("image", coverImageFileName);
    }
  }, [coverImageFileName, form]);

  async function onSubmit(data: EditorFormValues) {
    setShowLoadingAlert(true);
    setIsSaving(true);

    const response = await UpdatePost({
      id: post.id,
      title: data.title,
      slug: data.slug,
      image: data.image,
      description: data.description,
      content: content,
      categoryId: data.categoryId,
    });

    if (response) {
      toast.success(protectedEditorConfig.successMessage);
      router.push(`/editor/posts?search=refresh`);
    } else {
      toast.error(protectedEditorConfig.errorMessage);
    }

    setIsSaving(false);
    setShowLoadingAlert(false);
  }

  async function handlePublish() {
    setShowLoadingAlert(true);
    setIsSaving(true);

    const data = form.getValues();
    const saveResponse = await UpdatePost({
      id: post.id,
      title: data.title,
      slug: data.slug,
      image: data.image,
      description: data.description,
      content: content,
      categoryId: data.categoryId,
    });

    if (!saveResponse) {
      toast.error("Save failed. Fix errors before publishing.");
      setIsSaving(false);
      setShowLoadingAlert(false);
      return;
    }

    const publishResult = await PublishDraft(post.id);

    if (publishResult.success && publishResult.data) {
      toast.success(protectedPostConfig.successPublish);
      router.push(`/posts/${publishResult.data.postSlug}`);
    } else {
      toast.error(
        !publishResult.success ? publishResult.error : protectedPostConfig.errorPublish
      );
    }

    setIsSaving(false);
    setShowLoadingAlert(false);
  }

  async function handleUnpublish() {
    setShowLoadingAlert(true);
    const result = await UnpublishPost(post.id);
    if (result.success) {
      toast.success(protectedPostConfig.successUnpublish);
      router.refresh();
    } else {
      toast.error(
        !result.success ? result.error : protectedPostConfig.errorUnpublish
      );
    }
    setShowLoadingAlert(false);
  }

  return (
    <>
      <Form {...form}>
        {/* Title */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* General information */}
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>{protectedEditorConfig.generalTitle}</CardTitle>
              <CardDescription>
                {protectedEditorConfig.generalDescription}
              </CardDescription>
            </CardHeader>
            <Separator className="mb-8" />
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="w-full max-w-md">
                    <FormLabel>{protectedEditorConfig.formTitle}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={protectedEditorConfig.placeHolderTitle}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Slug */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem className="w-full max-w-md">
                    <FormLabel>{protectedEditorConfig.slug}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={protectedEditorConfig.placeholderSlug}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          field.onChange(slugify(form.getValues("title")))
                        }
                      >
                        <SparklesIcon className="mr-2 h-4 w-4" />
                        {protectedEditorConfig.generateSlug}
                      </Button>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Category */}
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>{protectedEditorConfig.categoryTitle}</CardTitle>
              <CardDescription>
                {protectedEditorConfig.categoryDescription}
              </CardDescription>
            </CardHeader>
            <Separator className="mb-8" />
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        {categories.map((category) => (
                          <FormItem
                            key={category.id}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={category.id} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {category.title ?? category.slug ?? "Unnamed"}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Cover Image */}
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>{protectedEditorConfig.coverImageTitle}</CardTitle>
              <CardDescription>
                {protectedEditorConfig.coverImageDescription}
              </CardDescription>
            </CardHeader>
            <Separator className="mb-8" />
            <CardContent className="space-y-4">
              {/* Image */}
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="w-full max-w-xl">
                    <FormControl>
                      <Input
                        placeholder={protectedEditorConfig.placeholderImage}
                        {...field}
                        disabled={true}
                        className="hidden bg-gray-50"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex w-full flex-col">
                <FileUploadModal
                  open={showCoverModal}
                  onOpenChange={setShowCoverModal}
                  bucketName={bucketNameCoverImage}
                  path={`${userId}/${post.id}`}
                  maxFiles={1}
                  maxSize={6 * 1024 * 1024}
                  onUploadComplete={handleCoverUploadComplete}
                  onUploadError={handleUploadError}
                  title="Upload Cover Image"
                  description={protectedEditorConfig.formImageNote}
                />
                {coverImageFileName === "" && (
                  <div className="col-span-full">
                    <div className="mb-1 flex items-center gap-x-3">
                      <button
                        onClick={() => setShowCoverModal(!showCoverModal)}
                        type="button"
                        className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        <PaperClipIcon className="mr-1 h-4 w-4" />
                        <span className="">
                          {protectedEditorConfig.formCoverImageUploadFile}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {coverImageFileName !== "" ? (
                  <EditorUploadCoverImageItem
                    userId={userId}
                    postId={post.id}
                    fileName={coverImageFileName}
                    imageUrl={coverImagePublicUrl}
                  />
                ) : (
                  <EditorUploadCoverImagePlaceHolder />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gallery Images */}
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>{protectedEditorConfig.galleryImageTitle}</CardTitle>
              <CardDescription>
                {protectedEditorConfig.galleryImageDescription +
                  allowedNumberOfImages +
                  "  images."}
              </CardDescription>
            </CardHeader>
            <Separator className="mb-8" />
            <CardContent className="space-y-4">
              <div className="flex w-full flex-col">
                <FileUploadModal
                  open={showGalleryModal}
                  onOpenChange={setShowGalleryModal}
                  bucketName={bucketNameGalleryImage}
                  path={`${userId}/${post.id}`}
                  maxFiles={allowedNumberOfImages}
                  maxSize={6 * 1024 * 1024}
                  onUploadComplete={handleGalleryUploadComplete}
                  onUploadError={handleUploadError}
                  title="Upload Gallery Images"
                  description={protectedEditorConfig.formImageNote}
                />
                <div className="col-span-full">
                  <div className="mb-3 flex items-center gap-x-3">
                    <button
                      onClick={() => setShowGalleryModal(!showGalleryModal)}
                      type="button"
                      className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      <PaperClipIcon className="mr-1 h-4 w-4" />
                      <span className="">
                        {protectedEditorConfig.chooseFile}
                      </span>
                    </button>
                  </div>
                </div>

                {galleryImagePublicUrls.length > 0 ? (
                  <EditorUploadGalleryImageTable
                    userId={userId}
                    postId={post.id}
                    fileNames={galleryImageFileNames}
                    imageUrls={galleryImagePublicUrls}
                  />
                ) : (
                  <EditorUploadGalleryImageTableEmpty />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Short Description */}
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>
                {protectedEditorConfig.shortDescriptionTitle}
              </CardTitle>
              <CardDescription>
                {protectedEditorConfig.shortDescriptionDescription}
              </CardDescription>
            </CardHeader>
            <Separator className="mb-8" />
            <CardContent className="space-y-4">
              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder={
                          protectedEditorConfig.placeholderDescription
                        }
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <WysiwygEditor
            defaultValue={content ? JSON.parse(content) : defaultEditorContent}
            onDebouncedUpdate={(editor) => {
              setContent(JSON.stringify(editor?.getJSON()));
            }}
          />

          <div className="flex items-center justify-start gap-3">
            <Button
              type="submit"
              className="flex !bg-gray-900 px-10 !text-white hover:!bg-gray-800"
              disabled={isSaving}
            >
              {protectedEditorConfig.submit}
            </Button>
            {post.status !== "published" && (
              <Button
                type="button"
                onClick={handlePublish}
                className="flex border-green-600 bg-green-600 px-10 text-white hover:bg-green-700"
                disabled={isSaving}
              >
                {protectedPostConfig.publish}
              </Button>
            )}
            {post.status === "published" && (
              <Button
                type="button"
                onClick={handleUnpublish}
                variant="outline"
                className="flex border-amber-600 px-10 text-amber-700 hover:bg-amber-50"
                disabled={isSaving}
              >
                {protectedPostConfig.unpublish}
              </Button>
            )}
            <Button
              type="button"
              onClick={() => router.back()}
              className="flex !bg-gray-100 px-10 !text-gray-900 hover:!bg-gray-200"
              disabled={isSaving}
            >
              {protectedEditorConfig.cancel}
            </Button>
          </div>
        </form>
      </Form>
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

export default Editor;
