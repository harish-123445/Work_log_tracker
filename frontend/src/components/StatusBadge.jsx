const STYLES = {
  Ongoing: "bg-primary/10 text-primary border-primary/20",
  Completed: "bg-line text-ink border-line",
  "On Hold": "bg-accent/10 text-accent-dark border-accent/20",
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || STYLES.Ongoing;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wide ${style}`}
    >
      {status}
    </span>
  );
}
