import { cn } from "@/lib/utils";

interface StackSegment {
  name: string;
  value: number;
  color: string;
}

export type { StackSegment };

interface StatusStackBarProps {
  segments: StackSegment[];
  height?: number;
  className?: string;
}

/** Barre empilée horizontale — répartition visuelle compacte. */
export function StatusStackBar({
  segments,
  height = 6,
  className,
}: StatusStackBarProps) {
  const visible = segments.filter((s) => s.value > 0);
  const total = visible.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return (
      <div
        className={cn("w-full bg-[#d4e5dc]", className)}
        style={{ height }}
      />
    );
  }

  return (
    <div
      className={cn("flex w-full overflow-hidden", className)}
      style={{ height }}
      role="img"
      aria-label="Répartition par statut"
    >
      {visible.map((seg) => (
        <div
          key={seg.name}
          className="transition-[width] duration-500 ease-[var(--ease-out-expo)]"
          style={{
            width: `${(seg.value / total) * 100}%`,
            backgroundColor: seg.color,
          }}
          title={`${seg.name}: ${seg.value}`}
        />
      ))}
    </div>
  );
}

interface StatusStackLegendProps {
  segments: StackSegment[];
  className?: string;
  compact?: boolean;
}

export function StatusStackLegend({
  segments,
  className,
  compact,
}: StatusStackLegendProps) {
  const visible = segments.filter((s) => s.value > 0);
  if (visible.length === 0) return null;

  return (
    <ul
      className={cn(
        "flex flex-wrap gap-x-3 gap-y-1",
        compact ? "text-[11px]" : "text-xs",
        className,
      )}
    >
      {visible.map((seg) => (
        <li key={seg.name} className="flex items-center gap-1.5 text-slate">
          <span
            className="size-2 shrink-0"
            style={{ backgroundColor: seg.color }}
          />
          <span className="truncate">{seg.name}</span>
          <span className="font-semibold tabular-nums text-graphite">
            {seg.value}
          </span>
        </li>
      ))}
    </ul>
  );
}
