import { Card } from "@/components/ui";
import type { ReactNode } from "react";

interface Props {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone?: "brand" | "success" | "warning";
}

export const StatCard = ({
  label,
  value,
  detail,
  icon,
  tone = "brand",
}: Props) => {
  const color = {
    brand: "text-taskly-brand",
    success: "text-success",
    warning: "text-warning",
  }[tone];

  return (
    <Card className="p-5">
      <div
        className={`flex items-center justify-between text-taskly-muted ${color}`}
      >
        <span className="text-sm text-taskly-muted">{label}</span>
        {icon}
      </div>
      <p className="mt-4 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-xs text-taskly-muted">{detail}</p>
    </Card>
  );
};
