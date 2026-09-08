import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Acme Enterprise dashboard overview.",
};

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-foreground/60">
          Here&apos;s an overview of your workspace.
        </p>
      </div>

      {/* ── Stats Grid ──────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.title}</CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {stat.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-foreground/50">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mock stats
// ---------------------------------------------------------------------------

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231",
    change: "+20.1% from last month",
  },
  {
    title: "Subscriptions",
    value: "+2,350",
    change: "+180.1% from last month",
  },
  { title: "Active Users", value: "+12,234", change: "+19% from last month" },
  { title: "Deployments", value: "+573", change: "+201 since last week" },
] as const;
