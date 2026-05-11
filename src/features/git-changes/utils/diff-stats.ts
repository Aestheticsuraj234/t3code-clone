export function formatDiffStat(added: number, removed: number) {
  return `+${added} -${removed}`;
}

export function basename(path: string) {
  const slash = path.lastIndexOf("/");
  return slash >= 0 ? path.slice(slash + 1) : path;
}

export function dirname(path: string) {
  const slash = path.lastIndexOf("/");
  return slash >= 0 ? path.slice(0, slash) : "";
}
