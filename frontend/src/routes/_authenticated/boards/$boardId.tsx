import { BoardPage } from "@/features/boards/board-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/boards/$boardId")({
  component: BoardPage,
});
