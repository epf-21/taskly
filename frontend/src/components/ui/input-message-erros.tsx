import { TriangleAlert } from "lucide-react";

export const InputMessageErrors = ({ message }: { message: string }) => (
  <em role="alert" className="text-red-400 text-sm">
    <TriangleAlert className="inline w-4 h-4" />
    <span> {message}</span>
  </em>
);
