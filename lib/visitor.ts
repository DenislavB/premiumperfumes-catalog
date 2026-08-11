const VISITOR_KEY = "pp_visitor_id";

/**
 * A random, anonymous id kept in the visitor's browser. It carries no personal
 * data — it exists only so a quiz run and a later order can be recognised as
 * coming from the same browser, which is what the conversion stat is built on.
 */
export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

export function newSessionId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}
