import { CheckCircle2, CircleDashed, ListTodo } from "lucide-react";
import { StatCard } from "./stat-card";

export const DashboardStats = () => (
  <section className="grid gap-4 md:grid-cols-3">
    <StatCard
      label="Active tasks"
      value="—"
      detail="Coming with your boards"
      icon={<ListTodo size={18} />}
    />
    <StatCard
      label="Completed"
      value="—"
      detail="Track progress in each board"
      icon={<CheckCircle2 size={18} />}
      tone="success"
    />
    <StatCard
      label="Due soon"
      value="—"
      detail="Notifications will appear here"
      icon={<CircleDashed size={18} />}
      tone="warning"
    />
  </section>
);
