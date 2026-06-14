import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { downloadBlob, filenameFromDisposition } from "../utils/download";

function formatDate(d) {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    day: "numeric",
  });
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState("");

  useEffect(() => {
    api
      .get(`/projects/${id}`)
      .then((res) => setProject(res.data))
      .catch(() => setError("Could not load this project."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!window.confirm("Delete this project? This can't be undone.")) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${id}`);
      navigate("/");
    } catch {
      setError("Could not delete this project.");
      setDeleting(false);
    }
  }

  async function handleExport(format) {
    setExporting(format);
    try {
      const res = await api.get(`/export/project/${id}/${format}`, { responseType: "blob" });
      const filename = filenameFromDisposition(
        res.headers["content-disposition"],
        `project.${format}`
      );
      downloadBlob(res.data, filename);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setExporting("");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <p className="font-mono text-sm text-muted">Loading…</p>
        </main>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error || "Project not found."}
          </p>
          <Link to="/" className="mt-4 inline-block font-mono text-xs text-primary hover:underline">
            ← Back to dashboard
          </Link>
        </main>
      </div>
    );
  }

  const start = formatDate(project.start_date);
  const end =
    project.status === "Ongoing" && !project.end_date ? "Present" : formatDate(project.end_date);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link to="/" className="font-mono text-xs text-muted hover:text-primary">
          ← Back to dashboard
        </Link>

        <div className="card mt-3 overflow-hidden">
          {/* Header tab */}
          <div className="flex items-center justify-between bg-primary px-6 py-3">
            <span className="font-mono text-xs uppercase tracking-widest text-white">
              {project.company_name}
            </span>
            <StatusBadge status={project.status} />
          </div>

          <div className="p-6">
            <h1 className="font-display text-2xl font-semibold text-ink">
              {project.project_title}
            </h1>
            <p className="mt-1 font-mono text-sm text-muted">
              {project.role_title && <>{project.role_title} · </>}
              {start || "—"} – {end || "—"}
            </p>

            {project.project_manager_name && (
              <p className="mt-3 text-sm text-ink">
                <span className="font-medium">Project manager: </span>
                {project.project_manager_name}
                {project.project_manager_contact && (
                  <span className="text-muted"> ({project.project_manager_contact})</span>
                )}
              </p>
            )}

            {project.description && (
              <p className="mt-4 text-sm leading-relaxed text-ink/90">{project.description}</p>
            )}

            {project.features?.length > 0 && (
              <Section title="Key features / responsibilities">
                <ul className="list-disc space-y-1 pl-5 text-sm text-ink/90">
                  {project.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </Section>
            )}

            {project.technologies?.length > 0 && (
              <Section title="Technologies">
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-line bg-paper px-2.5 py-0.5 font-mono text-xs text-ink"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {project.achievements && (
              <Section title="Achievements / impact">
                <p className="text-sm leading-relaxed text-ink/90">{project.achievements}</p>
              </Section>
            )}

            {project.notes && (
              <Section title="Notes">
                <p className="text-sm leading-relaxed text-ink/90">{project.notes}</p>
              </Section>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-6">
              <Link to={`/projects/${id}/edit`} className="btn-secondary">
                Edit
              </Link>
              <button
                className="btn-secondary"
                onClick={() => handleExport("pdf")}
                disabled={exporting !== ""}
              >
                {exporting === "pdf" ? "Exporting…" : "Export PDF"}
              </button>
              <button
                className="btn-secondary"
                onClick={() => handleExport("docx")}
                disabled={exporting !== ""}
              >
                {exporting === "docx" ? "Exporting…" : "Export Word"}
              </button>
              <button className="btn-danger ml-auto" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mt-5">
      <h2 className="mb-2 font-mono text-xs font-medium uppercase tracking-wide text-accent-dark">
        {title}
      </h2>
      {children}
    </div>
  );
}
