import { formatDistanceToNow } from "date-fns";

export function formatStatusDate(
  date: string | Date | null | undefined,
  verb: string,
): string {
  if (!date) return verb;
  return `${verb} ${formatDistanceToNow(new Date(date), { addSuffix: true })}`;
}
