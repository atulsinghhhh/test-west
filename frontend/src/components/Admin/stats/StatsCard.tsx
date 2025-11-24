import React from "react";

export default function StatsCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon?: React.ReactNode;
  title: string;
  value: number | string;
  subtitle?: string;
}) {
  return (
    <div className="p-4 rounded-lg border border-admin-border bg-white/5">
      <div className="flex gap-3 items-start">
        <div className="p-2 rounded-md bg-white/10">
          {icon}
        </div>

        <div>
          <div className="text-sm text-muted-foreground">
            {title}
          </div>

          <div className="text-2xl mt-1 font-semibold text-foreground">
            {value}
          </div>

          {subtitle && (
            <div className="text-xs mt-1 text-muted-foreground">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>

  );
}
