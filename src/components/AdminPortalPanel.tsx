// Auto-generated minimal React component for "Admin Portal" (F007)
"use client";
import { useAdminPortal } from "@/hooks/useAdminPortal";

export function AdminPortalPanel() {
  const { data, isLoading } = useAdminPortal();
  if (isLoading) return <div>Loading Admin Portal…</div>;
  return (
    <section aria-label="Admin Portal">
      <p className="text-sm text-gray-500">adminPortal items: {Array.isArray(data) ? data.length : 0}</p>
    </section>
  );
}
