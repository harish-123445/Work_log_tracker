import { useState } from "react";

export default function TagListInput({ label, items, onChange, placeholder, helpText }) {
  const [draft, setDraft] = useState("");

  function addItem() {
    const value = draft.trim();
    if (!value) return;
    onChange([...items, value]);
    setDraft("");
  }

  function removeItem(index) {
    onChange(items.filter((_, i) => i !== index));
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  }

  return (
    <div>
      <label className="label-field">{label}</label>
      {helpText && <p className="-mt-0.5 mb-2 text-xs text-muted">{helpText}</p>}

      {items.length > 0 && (
        <ul className="mb-2 space-y-1.5">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-start justify-between gap-2 rounded-md border border-line bg-paper px-3 py-1.5 text-sm"
            >
              <span className="flex-1 break-words">{item}</span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="shrink-0 text-muted hover:text-red-600"
                aria-label={`Remove ${item}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          className="input-field"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="button" onClick={addItem} className="btn-secondary px-3">
          Add
        </button>
      </div>
    </div>
  );
}
