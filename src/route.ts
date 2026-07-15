export const EXPLORE_3D_PATH = "/3d-explore";
export const GAME_PATH = "/game";
export function normalizePath(pathname: string) {
  if (!pathname) return "/";
  let end = pathname.length;
  while (end > 1 && pathname.charCodeAt(end - 1) === 47) end -= 1;
  return pathname.slice(0, end) || "/";
}