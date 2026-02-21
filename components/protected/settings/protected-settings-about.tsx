"use client";

import { updateAboutPage } from "@/actions/about/update-about-page";
import type { AboutPageRow } from "@/actions/about/get-about-page";
import WysiwygEditor from "@/components/protected/editor/wysiwyg/wysiwyg-editor";
import { defaultEditorContent } from "@/components/protected/editor/wysiwyg/default-content";
import { isLikelyJson } from "@/lib/post-content";
import { decodeHtmlEntities } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { JSONContent } from "@tiptap/core";
import { FC, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface ProtectedSettingsAboutProps {
  initialAbout: AboutPageRow | null;
}

/** Same as post editor: parse JSON for defaultValue, or use default doc. */
function getDefaultValue(raw: string): JSONContent | string {
  const trimmed = raw.trim();
  if (!trimmed) return defaultEditorContent;
  if (isLikelyJson(trimmed)) {
    try {
      return JSON.parse(trimmed) as JSONContent;
    } catch {
      return defaultEditorContent;
    }
  }
  return decodeHtmlEntities(trimmed);
}

const ProtectedSettingsAbout: FC<ProtectedSettingsAboutProps> = ({
  initialAbout,
}) => {
  const editorRef = useRef<{ getJSON: () => JSONContent } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  async function handleSave() {
    const editor = editorRef.current;
    if (!editor) return;
    const json = editor.getJSON();
    setIsSaving(true);
    const result = await updateAboutPage(JSON.stringify(json));
    setIsSaving(false);
    if (result.success) {
      toast.success("About page saved");
    } else {
      toast.error(result.error ?? "Failed to save");
    }
  }

  const raw = initialAbout?.content ?? "";
  const defaultValue = getDefaultValue(raw);

  return (
    <Card>
      <CardHeader>
        <CardTitle>About page content</CardTitle>
        <CardDescription>
          Edit the content shown on the public /about page. Only admins can edit.
          Click Save to update.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasMounted ? (
          <div className="min-h-[320px] max-w-2xl rounded-md border border-input bg-muted/30 flex items-center justify-center text-muted-foreground text-sm">
            Loading editor…
          </div>
        ) : (
          <WysiwygEditor
            defaultValue={defaultValue}
            className="relative w-full min-h-[320px] max-w-2xl border border-input rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
            onUpdate={(editor) => {
              editorRef.current = editor ?? null;
            }}
          />
        )}
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save about page
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProtectedSettingsAbout;
