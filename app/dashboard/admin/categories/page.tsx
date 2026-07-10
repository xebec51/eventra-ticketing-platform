import { deleteCategoryAction, updateCategoryAction } from "@/app/actions/management";
import { CategoryCreateForm } from "@/components/eventra/category-create-form";
import { StatusBadge } from "@/components/eventra/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/prisma";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const categories = await prisma.eventCategory.findMany({
    include: {
      _count: { select: { events: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      {error === "category-in-use" ? (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
          This category still has events attached to it, so it cannot be deleted yet.
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <CategoryCreateForm />
        <Card className="border border-black/5 bg-white/90">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Existing categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.map((category) => (
              <form
                key={category.id}
                action={updateCategoryAction}
                className="space-y-3 rounded-3xl border border-black/5 bg-slate-50 p-4"
              >
                <input type="hidden" name="categoryId" value={category.id} />
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <StatusBadge label={`${category._count.events} events`} tone="default" />
                    <StatusBadge label={category.slug} tone="muted" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" type="submit">
                      Save
                    </Button>
                    <Button
                      formAction={deleteCategoryAction}
                      size="sm"
                      type="submit"
                      variant="destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    defaultValue={category.name}
                    name="name"
                    placeholder="Category name"
                    className="h-10 border-black/10 bg-white"
                  />
                  <Input
                    defaultValue={category.slug}
                    name="slug"
                    placeholder="Slug"
                    className="h-10 border-black/10 bg-white"
                  />
                </div>
                <Textarea
                  defaultValue={category.description ?? ""}
                  name="description"
                  placeholder="Description"
                  className="min-h-20 border-black/10 bg-white"
                />
                <Input
                  defaultValue={category.imageUrl ?? ""}
                  name="imageUrl"
                  placeholder="Image URL"
                  className="h-10 border-black/10 bg-white"
                />
              </form>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
