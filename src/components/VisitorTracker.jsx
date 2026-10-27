import { useEffect } from "react";

const TRACKED_KEY = "visitor_tracked";

// Posts one visit per browser session to /api/visitor.
// Note: the live deployment has no /api/visitor function (it returns 404), so this currently only logs an error.
async function trackVisitor() {
  if (sessionStorage.getItem(TRACKED_KEY)) return;
  try {
    const res = await fetch("/api/visitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page_url: window.location.href,
        user_agent: navigator.userAgent,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("Failed to send visitor notification:", res.status, text);
      return;
    }
    sessionStorage.setItem(TRACKED_KEY, "1");
  } catch (err) {
    console.error("Visitor tracking error:", err);
  }
}

const VisitorTracker = () => {
  useEffect(() => {
    trackVisitor();
  }, []);
  return null;
};

export default VisitorTracker;
