import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import TagListInput from "../components/TagListInput";

const EMPTY_FORM = {
  company_name: "",
  project_title: "",
  role_title: "",
  description: "",
  features: [],
  technologies: [],
  project_manager_name: "",
  project_manager_contact: "",
  start_date: "",
  end_date: "",
  status: "Ongoing",
  achievements: "",
  notes: "",
};

export default function ProjectForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditing) return;
    api
      .get(`/projects/${id}`)
      .then((res) => {
        const p = res.data;
        setForm({
          ...EMPTY_FORM,
          ...p,
          start_date: p.start_date || "",
          end_date: p.end_date || "",
        });
      })
      .catch(() => setError("Could not load this project."))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      ...form,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };

    try {
      if (isEditing) {
        await api.put(`/projects/${id}`, payload);
        navigate(`/projects/${id}`);
      } else {
        const res = await api.post("/projects", payload);
        navigate(`/projects/${res.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Could not save this project.");
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Link to="/" className="font-mono text-xs text-muted hover:text-primary">
            ← Back to dashboard
          </Link>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
            {isEditing ? "Edit project" : "Add a project"}
          </h1>
        </div>

        {error && (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="card space-y-6 p-6">
          {/* Basic info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">Company *</label>
              <input
                className="input-field"
                value={form.company_name}
                onChange={(e) => update("company_name", e.target.value)}
                placeholder="e.g. Netscribes"
                required
              />
            </div>
            <div>
              <label className="label-field">Your role on this project</label>
              <input
                className="input-field"
                value={form.role_title}
                onChange={(e) => update("role_title", e.target.value)}
                placeholder="e.g. Data Analyst Intern"
              />
            </div>
          </div>

          <div>
            <label className="label-field">Project title *</label>
            <input
              className="input-field"
              value={form.project_title}
              onChange={(e) => update("project_title", e.target.value)}
              placeholder="e.g. Market Research Dashboard"
              required
            />
          </div>

          <div>
            <label className="label-field">Description</label>
            <textarea
              className="input-field"
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="What is this project about, in a sentence or two?"
            />
          </div>

          {/* Timeline + status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label-field">Start date</label>
              <input
                className="input-field"
                type="date"
                value={form.start_date}
                onChange={(e) => update("start_date", e.target.value)}
              />
            </div>
            <div>
              <label className="label-field">End date</label>
              <input
                className="input-field"
                type="date"
                value={form.end_date}
                onChange={(e) => update("end_date", e.target.value)}
              />
              <p className="mt-1 text-xs text-muted">Leave blank if ongoing.</p>
            </div>
            <div>
              <label className="label-field">Status</label>
              <select
                className="input-field"
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
              >
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>

          {/* Project manager */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">Project manager</label>
              <input
                className="input-field"
                value={form.project_manager_name}
                onChange={(e) => update("project_manager_name", e.target.value)}
                placeholder="e.g. Priya Sharma"
              />
            </div>
            <div>
              <label className="label-field">PM contact</label>
              <input
                className="input-field"
                value={form.project_manager_contact}
                onChange={(e) => update("project_manager_contact", e.target.value)}
                placeholder="email or phone"
              />
            </div>
          </div>

          {/* Features */}
          <TagListInput
            label="Key features / responsibilities"
            items={form.features}
            onChange={(items) => update("features", items)}
            placeholder="e.g. Built automated weekly report pipeline"
            helpText="Add one at a time — press Enter or Add."
          />

          {/* Technologies */}
          <TagListInput
            label="Technologies / tools used"
            items={form.technologies}
            onChange={(items) => update("technologies", items)}
            placeholder="e.g. Python"
          />

          {/* Achievements */}
          <div>
            <label className="label-field">Achievements / impact</label>
            <textarea
              className="input-field"
              rows={2}
              value={form.achievements}
              onChange={(e) => update("achievements", e.target.value)}
              placeholder="e.g. Reduced manual reporting time by 60%"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="label-field">Notes</label>
            <textarea
              className="input-field"
              rows={2}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Anything else worth remembering for next time"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : isEditing ? "Save changes" : "Add project"}
            </button>
            <Link to={isEditing ? `/projects/${id}` : "/"} className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
