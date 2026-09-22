export const getCurrentSection = (pathname: string) => {
  if (pathname.startsWith("/workspaces")) {
    return "Workspaces";
  }
  if (pathname.startsWith("/notifications")) {
    return "Notifications";
  }

  if (pathname.startsWith("/boards")) {
    return "Boards";
  }

  if (pathname.startsWith("/tasks")) {
    return "Tasks";
  }

  return "Overview";
};
