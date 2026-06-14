import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

function formatRange(project) {
  const fmt = (d) =>
    d
      ? new Date(d + "T00:00:00").toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "—";

  const start = fmt(project.start_date);
  const end =
    project.status === "Ongoing" && !project.end_date ? "Present" : fmt(project.end_date);

  return `${start} – ${end}`;
}

export default function ProjectCard({ project }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="group flex overflow-hidden rounded-lg border border-line bg-surface shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Filing tab */}
      <div className="flex w-10 shrink-0 items-center justify-center bg-primary py-4">
        <span className="origin-center whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-widest text-white [writing-mode:vertical-rl] rotate-180">
          {project.company_name}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-ink group-hover:text-primary">
            {project.project_title}
          </h3>
          <StatusBadge status={project.status} />
        </div>

        <p className="mt-1 font-mono text-xs text-muted">
          {project.role_title ? `${project.role_title} · ` : ""}
          {formatRange(project)}
        </p>

        {project.description && (
          <p className="mt-2 line-clamp-2 text-sm text-ink/80">{project.description}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
          {project.features?.length > 0 && (
            <span className="rounded-full bg-paper px-2 py-0.5 font-mono">
              {project.features.length} feature{project.features.length === 1 ? "" : "s"}
            </span>
          )}
          {project.technologies?.slice(0, 3).map((t) => (
            <span key={t} className="rounded-full bg-paper px-2 py-0.5 font-mono">
              {t}
            </span>
          ))}
          {project.technologies?.length > 3 && (
            <span className="font-mono">+{project.technologies.length - 3} more</span>
          )}
        </div>
      </div>
    </Link>
  );
}
