import { useQuery } from "@tanstack/react-query";
import { currentUserQuery } from "../queries/current-user-query";

export const useCurrentUser = () => {
  return useQuery(currentUserQuery());
};
