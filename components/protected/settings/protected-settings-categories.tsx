"use client";

import { CreateCategory } from "@/actions/category/create-category";
import { DeleteCategory } from "@/actions/category/delete-category";
import { UpdateCategory } from "@/actions/category/update-category";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { categoryCreateSchema, categoryUpdateSchema } from "@/lib/validation/category";
import type { Category } from "@/lib/categories";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";

type CreateFormValues = z.infer<typeof categoryCreateSchema>;
type UpdateFormValues = z.infer<typeof categoryUpdateSchema>;

interface ProtectedSettingsCategoriesProps {
  initialCategories: Category[];
}

const ProtectedSettingsCategories: FC<ProtectedSettingsCategoriesProps> = ({
  initialCategories,
}) => {
  const [categories, setCategories] = useState(initialCategories);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: {
      title: "",
      slug: "",
      show_in_nav: true,
      sort_order: 0,
    },
  });

  const updateForm = useForm<UpdateFormValues>({
    resolver: zodResolver(categoryUpdateSchema),
  });

  const handleCreate = async (data: CreateFormValues) => {
    setIsSubmitting(true);
    const result = await CreateCategory(data);
    setIsSubmitting(false);
    if (result.success && result.data) {
      toast.success("Category created");
      setCategories((prev) => [...prev, result.data]);
      createForm.reset();
      setIsCreateOpen(false);
    } else {
      toast.error(!result.success ? result.error : "Failed to create");
    }
  };

  const handleUpdate = async (data: UpdateFormValues) => {
    if (!data.id) return;
    setIsSubmitting(true);
    const result = await UpdateCategory(data);
    setIsSubmitting(false);
    if (result.success && result.data) {
      toast.success("Category updated");
      setCategories((prev) =>
        prev.map((c) => (c.id === data.id ? result.data : c))
      );
      setEditingId(null);
    } else {
      toast.error(!result.success ? result.error : "Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    setIsSubmitting(true);
    const result = await DeleteCategory(id);
    setIsSubmitting(false);
    if (result.success) {
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setDeletingId(null);
    } else {
      toast.error(result.error || "Failed to delete");
    }
  };

  const openEdit = (cat: Category) => {
    updateForm.reset({
      id: cat.id,
      title: cat.title ?? "",
      slug: cat.slug ?? "",
      show_in_nav: cat.show_in_nav ?? true,
      sort_order: cat.sort_order ?? 0,
    });
    setEditingId(cat.id);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Manage blog categories. Toggle &quot;Show in nav&quot; to control
            which categories appear in the homepage navigation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add category</DialogTitle>
                  <DialogDescription>
                    Create a new category. Slug is used in URLs (e.g. /category/science).
                  </DialogDescription>
                </DialogHeader>
                <Form {...createForm}>
                  <form
                    onSubmit={createForm.handleSubmit(handleCreate)}
                    className="space-y-4"
                  >
                    <FormField
                      control={createForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Science" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="science"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    .toLowerCase()
                                    .replace(/[^a-z0-9-]/g, "-")
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="show_in_nav"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Show in nav</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="sort_order"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sort order</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Show in nav</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No categories yet. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">
                      {cat.title || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {cat.slug || "—"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={cat.show_in_nav ?? true}
                        onCheckedChange={async (checked) => {
                          await handleUpdate({
                            ...cat,
                            id: cat.id,
                            title: cat.title ?? "",
                            slug: cat.slug ?? "",
                            show_in_nav: checked,
                            sort_order: cat.sort_order ?? 0,
                          });
                        }}
                      />
                    </TableCell>
                    <TableCell>{cat.sort_order ?? 0}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(cat)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeletingId(cat.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={!!editingId} onOpenChange={(o) => !o && setEditingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit category</DialogTitle>
          </DialogHeader>
          <Form {...updateForm}>
            <form
              onSubmit={updateForm.handleSubmit(handleUpdate)}
              className="space-y-4"
            >
              <FormField
                control={updateForm.control}
                name="id"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, "-")
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="show_in_nav"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Show in nav</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(o) => !o && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              Posts in this category will keep their content but the category
              link will be removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProtectedSettingsCategories;
