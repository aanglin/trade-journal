export default function DashboardCard({
  title,
  value,
  subtitle,
  profit,
  emphasis = false,
}) {
  let valueColor = "text-slate-100";
  let glow = "";

  if (profit > 0) {
    valueColor = "text-emerald-400";
    glow = "shadow-emerald-950/20";
  }

  if (profit < 0) {
    valueColor = "text-red-400";
    glow = "shadow-red-950/20";
  }

  if (emphasis) {
    return (
      <article className="rounded-2xl border border-blue-500/30 bg-linear-to-br from-blue-950/80 to-slate-900 p-5 shadow-xl shadow-blue-950/20">
        <p className="text-sm font-medium text-blue-300">{title}</p>

        <p className="mt-3 text-3xl font-bold text-white">{value}</p>

        {subtitle && (
          <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
        )}
      </article>
    );
  }

  return (
    <article
      className={`rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl ${glow}`}
    >
      <p className="text-sm font-medium text-slate-400">{title}</p>

      <p className={`mt-3 text-2xl font-bold ${valueColor}`}>
        {value}
      </p>

      {subtitle && (
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
      )}
    </article>
  );
}