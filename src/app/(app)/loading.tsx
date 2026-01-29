import { CraftLoader } from "@jameskabz/nextcraft-ui";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50">
      <CraftLoader
        loading
        overlay
        type="pulse"
        size="large"
        text="Loading"
        backgroundColor="var(--spendwise-loader-overlay, rgba(10, 10, 12, 0.35))"
      />
    </div>
  );
}
