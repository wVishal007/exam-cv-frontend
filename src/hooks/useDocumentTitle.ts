import { useEffect } from "react";

const BASE_TITLE = "exam-cv";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE_TITLE}` : BASE_TITLE;
  }, [title]);
}