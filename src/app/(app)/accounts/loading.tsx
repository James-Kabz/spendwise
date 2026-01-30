import { CraftLoader } from "@jameskabz/nextcraft-ui";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50">
      <CraftLoader
        loading
        overlay
        type="ripple"
        size="large"
        text="Loading"
        backgroundColor="rgba(0, 0, 0, 0.35)"
      />
    </div>
  );
}
