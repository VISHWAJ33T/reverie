import type { AboutPageRow } from "@/actions/about/get-about-page";
import { postContentToHtml } from "@/lib/post-content";
import { decodeHtmlEntities, sanitizeHtml } from "@/lib/utils";

interface MainAboutPageProps {
  about: AboutPageRow | null;
}

const MainAboutPage = ({ about }: MainAboutPageProps) => {
  const raw = about?.content?.trim() || "";
  let html = postContentToHtml(raw || null);
  if (html && html.includes("&lt;")) html = decodeHtmlEntities(html);
  const content = html ? sanitizeHtml(html) : "";

  return (
    <div className="bg-white py-5">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        {content ? (
          <article
            className="prose prose-gray max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: content || "" }}
          />
        ) : (
          <p className="text-muted-foreground">No content yet.</p>
        )}
      </div>
    </div>
  );
};

export default MainAboutPage;
