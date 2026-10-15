import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Resets scroll position on navigation, including back/forward. */
export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}