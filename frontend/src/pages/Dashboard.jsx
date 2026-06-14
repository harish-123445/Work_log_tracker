import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import { downloadBlob, filenameFromDisposition } from "../utils/download";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [companyFilter, setCompanyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const [exporting, setExporting] = useState("");

  async function loadProjects() {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (companyFilter) params.company = companyFilter;
      if (statusFilter) params.status_filter = statusFilter;
      if (search) params.search = search;
      const res = await api.get("/projects", { params });
      setProjects(res.data);
    } catch (err) {
      setError("Could not load projects. Is the API running?");
    } finally {
      setLoading(false);
    }
  }

  async function loadMeta() {
    try {
      const [companiesRes, statsRes] = await Promise.all([
        api.get("/projects/companies"),
        api.get("/projects/stats"),
      ]);
      setCompanies(companiesRes.data);
      setStats(statsRes.data);
    } catch {
      // non-critical
    }
  }

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadProjects, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyFilter, statusFilter, search]);

  async function handleExportAll(format) {
    setExporting(format);
    try {
      const res = await api.get(`/export/all/${format}`, { responseType: "blob" });
      const filename = filenameFromDisposition(
        res.headers["content-disposition"],
        `work_log_report.${format}`
      );
      downloadBlob(res.data, filename);
    } catch (err) {
      if (err.response?.status === 404) {
        alert("Add at least one project before exporting a report.");
      } else {
        alert("Export failed. Please try again.");
      }
    } finally {
      setExporting("");
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">Your Work Log</h1>
            <p className="mt-1 text-sm text-muted">
              Every project, recorded for the next appraisal — and the one after that.
            </p>
          </div>
          <Link to="/projects/new" className="btn-primary">
            + Add project
          </Link>
        </div>

        {/* Stats strip */}
        {stats && stats.total_projects > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBox label="Total projects" value={stats.total_projects} />
            <StatBox label="Ongoing" value={stats.by_status?.Ongoing || 0} />
            <StatBox label="Completed" value={stats.by_status?.Completed || 0} />
            <StatBox label="Companies" value={Object.keys(stats.by_company || {}).length} />
          </div>
        )}

        {/* Filters + export */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <input
            className="input-field max-w-xs"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input-field max-w-[160px]"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
          >
            <option value="">All companies</option>
            {companies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className="input-field max-w-[160px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>

          <div className="ml-auto flex gap-2">
            <button
              className="btn-secondary text-xs"
              onClick={() => handleExportAll("pdf")}
              disabled={exporting !== ""}
            >
              {exporting === "pdf" ? "Exporting…" : "Export all (PDF)"}
            </button>
            <button
              className="btn-secondary text-xs"
              onClick={() => handleExportAll("docx")}
              disabled={exporting !== ""}
            >
              {exporting === "docx" ? "Exporting…" : "Export all (Word)"}
            </button>
          </div>
        </div>

        {/* List */}
        {loading && <p className="font-mono text-sm text-muted">Loading projects…</p>}
        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
            <p className="font-display text-lg font-semibold text-ink">No projects yet</p>
            <p className="max-w-sm text-sm text-muted">
              Start your ledger by adding the project you're currently working on — title,
              features, timeline, and who's managing it.
            </p>
            <Link to="/projects/new" className="btn-primary mt-2">
              + Add your first project
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </main>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="card px-4 py-3">
      <p className="font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="font-mono text-xs uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}
