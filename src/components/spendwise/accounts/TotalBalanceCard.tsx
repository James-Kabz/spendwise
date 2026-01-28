import { CraftCard, CraftSkeleton } from "@jameskabz/nextcraft-ui";

import { formatCurrency } from "@/components/spendwise/accounts/utils";

type TotalBalanceCardProps = {
  totalBalance: number;
  activeCount: number;
  totalCount: number;
  loading?: boolean;
};

export default function TotalBalanceCard({
  totalBalance,
  activeCount,
  totalCount,
  loading = false,
}: TotalBalanceCardProps) {
  return (
    <CraftCard className="flex h-full flex-col gap-4 p-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-[rgb(var(--nc-fg-soft))]">
          Total balance (active accounts)
        </p>
        {loading ? (
          <CraftSkeleton className="h-10 w-40" />
        ) : (
          <p className="text-3xl font-semibold text-[rgb(var(--nc-fg))]">
            {formatCurrency(totalBalance)}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-[rgb(var(--nc-fg-muted))]">
        {loading ? (
          <CraftSkeleton className="h-5 w-36" />
        ) : (
          <span>
            {activeCount} active of {totalCount} total
          </span>
        )}
      </div>
    </CraftCard>
  );
}
