import { TriangleAlert } from "lucide-react";

export const InputMessageErrors = ({
  message,
  id,
}: {
  message: string;
  id?: string;
}) => (
  <em id={id} role="alert" className="flex items-center gap-1.5 text-sm text-taskly-danger">
    <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
    <span>{message}</span>
  </em>
);
