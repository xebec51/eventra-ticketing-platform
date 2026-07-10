"use client";

import { useActionState } from "react";

import {
  createCategoryAction,
  type ManagementFormState,
} from "@/app/actions/management";
import { AuthSubmitButton } from "@/components/eventra/auth-submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: ManagementFormState = {};

function FieldError({ message }: { message?: string[] }) {
  if (!message?.length) {
    return null;
  }

  return <p className="text-sm text-rose-600">{message[0]}</p>;
}

export function CategoryCreateForm() {
  const [state, action] = useActionState(createCategoryAction, initialState);

  return (
    <Card className="border border-black/5 bg-white/90">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Create category</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          {state.success ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
              {state.success}
            </div>
          ) : null}
          {state.message ? (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
              {state.message}
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="category-name">Name</Label>
            <Input id="category-name" name="name" className="h-11 border-black/10" />
            <FieldError message={state.errors?.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-slug">Slug override</Label>
            <Input id="category-slug" name="slug" className="h-11 border-black/10" />
            <FieldError message={state.errors?.slug} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-description">Description</Label>
            <Textarea
              id="category-description"
              name="description"
              className="min-h-24 border-black/10"
            />
            <FieldError message={state.errors?.description} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-image">Image URL</Label>
            <Input id="category-image" name="imageUrl" className="h-11 border-black/10" />
            <FieldError message={state.errors?.imageUrl} />
          </div>
          <AuthSubmitButton loadingLabel="Creating category...">
            Create category
          </AuthSubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
