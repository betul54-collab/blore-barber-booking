import React from "react";

export default function GlassShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-bg">
      <div className="glass-panel">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm md:text-base text-white/80">{subtitle}</p>
          ) : null}
        </div>
        <div className="glass-card">{children}</div>
      </div>
    </div>
  );
}