import { Avatar } from "@/components/ui/Avatar";

interface Assignee {
  user_id: string;
  full_name: string | null;
}

interface AssigneeAvatarsProps {
  assignees: Assignee[];
  max?: number;
}

export function AssigneeAvatars({ assignees, max = 3 }: AssigneeAvatarsProps) {
  if (assignees.length === 0) return null;

  const visible = assignees.slice(0, max);
  const overflow = assignees.length - max;

  return (
    <div className="flex items-center">
      {visible.map((a, i) => (
        <div
          key={a.user_id}
          className="ring-2 ring-background rounded-full"
          style={{ marginLeft: i === 0 ? 0 : -6 }}
          title={a.full_name ?? "Unknown"}
        >
          <Avatar name={a.full_name ?? "?"} size="xs" />
        </div>
      ))}
      {overflow > 0 && (
        <span
          className="w-5 h-5 rounded-full bg-muted text-muted-foreground text-[9px]
                     font-medium flex items-center justify-center ring-2 ring-background"
          style={{ marginLeft: -6 }}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
