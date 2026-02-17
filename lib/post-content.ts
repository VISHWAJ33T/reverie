/**
 * Converts TipTap/ProseMirror JSON content to HTML for display on the post page.
 * Handles content stored as JSON (editor) and passes through existing HTML.
 */

type JsonNode = {
  type: string;
  content?: JsonNode[];
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderMarks(text: string, marks?: JsonNode["marks"]): string {
  if (!marks?.length) return escapeHtml(text);
  let out = escapeHtml(text);
  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        out = `<strong>${out}</strong>`;
        break;
      case "italic":
        out = `<em>${out}</em>`;
        break;
      case "underline":
        out = `<u>${out}</u>`;
        break;
      case "strike":
        out = `<s>${out}</s>`;
        break;
      case "code":
        out = `<code>${out}</code>`;
        break;
      case "link":
        const href = (mark.attrs?.href as string) ?? "#";
        const target = mark.attrs?.target ? ` target="${escapeHtml(String(mark.attrs.target))}"` : "";
        out = `<a href="${escapeHtml(href)}"${target}>${out}</a>`;
        break;
      case "textStyle":
        const color = mark.attrs?.color as string | undefined;
        if (color) out = `<span style="color: ${escapeHtml(color)}">${out}</span>`;
        break;
      case "highlight":
        out = `<mark>${out}</mark>`;
        break;
      default:
        break;
    }
  }
  return out;
}

function nodeToHtml(node: JsonNode): string {
  switch (node.type) {
    case "text":
      return renderMarks(node.text ?? "", node.marks);

    case "paragraph":
      return `<p>${(node.content ?? []).map(nodeToHtml).join("")}</p>`;

    case "heading": {
      const level = Math.min(6, Math.max(1, (node.attrs?.level as number) ?? 1));
      return `<h${level}>${(node.content ?? []).map(nodeToHtml).join("")}</h${level}>`;
    }

    case "blockquote":
      return `<blockquote>${(node.content ?? []).map(nodeToHtml).join("")}</blockquote>`;

    case "bulletList":
      return `<ul>${(node.content ?? []).map(nodeToHtml).join("")}</ul>`;

    case "orderedList": {
      const start = (node.attrs?.start as number) ?? 1;
      const startAttr = start !== 1 ? ` start="${start}"` : "";
      return `<ol${startAttr}>${(node.content ?? []).map(nodeToHtml).join("")}</ol>`;
    }

    case "listItem":
      return `<li>${(node.content ?? []).map(nodeToHtml).join("")}</li>`;

    case "codeBlock":
      return `<pre><code>${(node.content ?? []).map(nodeToHtml).join("")}</code></pre>`;

    case "horizontalRule":
      return "<hr />";

    case "hardBreak":
      return "<br />";

    case "image": {
      const src = (node.attrs?.src as string) ?? "";
      const alt = (node.attrs?.alt as string) ?? "";
      const title = (node.attrs?.title as string) ?? "";
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
      if (!src) return "";
      return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${titleAttr} loading="lazy" />`;
    }

    case "taskList":
      return `<ul data-type="taskList">${(node.content ?? []).map(nodeToHtml).join("")}</ul>`;

    case "taskItem": {
      const checked = node.attrs?.checked === true;
      const checkAttr = checked ? ' data-checked="true"' : "";
      return `<li data-type="taskItem"${checkAttr}>${(node.content ?? []).map(nodeToHtml).join("")}</li>`;
    }

    default:
      if (node.content) {
        return (node.content as JsonNode[]).map(nodeToHtml).join("");
      }
      return "";
  }
}

function isLikelyJson(content: string): boolean {
  const trimmed = content.trim();
  return trimmed.startsWith("{") && (trimmed.includes('"type"') || trimmed.includes("'type'"));
}

/**
 * Returns HTML suitable for safe display. If content is TipTap JSON, converts it to HTML.
 * If content is already HTML (or plain text), returns it as-is (caller should sanitize).
 */
export function postContentToHtml(content: string | null | undefined): string {
  if (content == null || content === "") return "";

  const trimmed = content.trim();
  if (!isLikelyJson(trimmed)) return trimmed;

  try {
    const doc = JSON.parse(trimmed) as JsonNode;
    if (doc?.type !== "doc" || !Array.isArray(doc.content)) return trimmed;
    const html = doc.content.map(nodeToHtml).join("");
    return html || trimmed;
  } catch {
    return trimmed;
  }
}
