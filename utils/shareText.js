export function extractBodyText(post) {
  if (!post) return "";
  const { body } = post;
  if (!body) return "";

  if (Array.isArray(body)) {
    return body
      .map((block) =>
        Array.isArray(block.children)
          ? block.children.map((child) => child.text).join("")
          : ""
      )
      .join("\n\n");
  }

  if (typeof body === "string") return body;

  return "";
}

export function buildShareText(post) {
  const title = post?.title || "";
  const body = extractBodyText(post);
  return title ? (body ? `${title}\n\n${body}` : title) : body || "";
}
