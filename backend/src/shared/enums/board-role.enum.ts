import type { BoardRole } from 'src/generated/prisma/enums';

export const BOARD_ROLE_LEVEL: Record<BoardRole, number> = {
  viewer: 1,
  member: 2,
  admin: 3,
};

export function meetsBoardRole(role: BoardRole, required: BoardRole): boolean {
  return BOARD_ROLE_LEVEL[role] >= BOARD_ROLE_LEVEL[required];
}
