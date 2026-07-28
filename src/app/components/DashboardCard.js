export default function DashboardCard({
  title,
  value,
  subtitle,
  profit,
  emphasis = false,
}) {
  const numericProfit = Number(profit);
  const hasProfitValue = Number.isFinite(numericProfit);

  let valueColor = "text-slate-100";
  let glowClass = "shadow-black/10";
  let accentClass = "bg-slate-700";

  if (hasProfitValue && numericProfit > 0) {
    valueColor = "text-emerald-400";
    glowClass = "shadow-emerald-950/20";
    accentClass = "bg-emerald-500";
  }

  if (hasProfitValue && numericProfit < 0) {
    valueColor = "text-red-400";
    glowClass = "shadow-red-950/20";
    accentClass = "bg-red-500";
  }

  if (emphasis) {
    return (
      <article className="group relative h-full min-h-[132px] min-w-0 overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/80 via-slate-900 to-slate-900 p-4 shadow-xl shadow-blue-950/20 transition duration-200 hover:-translate-y-0.5 hover:border-blue-400/40 sm:min-h-[150px] sm:p-5">
        <div className="absolute inset-x-0 top-0 h-1 bg-blue-500" />

        <div className="flex h-full min-w-0 flex-col">
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-blue-300 sm:text-sm sm:normal-case sm:tracking-normal">
            {title}
          </p>

          <p
            title={String(value)}
            className="mt-3 min-w-0 truncate whitespace-nowrap text-[clamp(1.35rem,5vw,2rem)] font-bold leading-tight tracking-tight text-white tabular-nums"
          >
            {value}
          </p>

          {subtitle && (
            <p
              title={subtitle}
              className="mt-auto truncate pt-2 text-xs text-slate-400 sm:text-sm"
            >
              {subtitle}
            </p>
          )}
        </div>
      </article>
    );
  }

  return (
    <article
      className={`group relative h-full min-h-[132px] min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl transition duration-200 hover:-translate-y-0.5 hover:border-slate-700 sm:min-h-[150px] sm:p-5 ${glowClass}`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-0.5 opacity-70 ${accentClass}`}
      />

      <div className="flex h-full min-w-0 flex-col">
        <p className="truncate text-xs font-medium text-slate-400 sm:text-sm">
          {title}
        </p>

        <p
          title={String(value)}
          className={`mt-3 min-w-0 truncate whitespace-nowrap text-[clamp(1.15rem,4vw,1.5rem)] font-bold leading-tight tracking-tight tabular-nums ${valueColor}`}
        >
          {value}
        </p>

        {subtitle && (
          <p
            title={subtitle}
            className="mt-auto truncate pt-2 text-xs text-slate-500 sm:text-sm"
          >
            {subtitle}
          </p>
        )}
      </div>
    </article>
  );
}