import { CraftButton, CraftStatCard, GlassCard, Grid } from "@jameskabz/nextcraft-ui";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Grid columns={3} gap="md">
        <CraftStatCard
          label="Today"
          value="KES 2,540"
          delta="+12% vs yesterday"
          trend="up"
        />
        <CraftStatCard
          label="Meals Logged"
          value="3"
          delta="On track"
          trend="neutral"
        />
        <CraftStatCard
          label="Budget Left"
          value="KES 6,120"
          delta="7 days left"
          trend="down"
        />
      </Grid>

      <GlassCard className="space-y-4">
        <h2 className="text-xl font-semibold">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <CraftButton>New transaction</CraftButton>
          <CraftButton variant="outline">Log meal</CraftButton>
          <CraftButton variant="ghost">Review budget</CraftButton>
        </div>
      </GlassCard>
    </div>
  );
}
