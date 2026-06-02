import React, { useState } from "react";
import {
  User,
  Role,
  validateDraft,
  ValidationErrors,
} from "../types/user.types";

interface Props {
  user: User;
  onSave: (updated: User) => void;
  onCancel: () => void;
}

// Renders a row in edit mode with inline inputs for name, email, and role.
// Keeps a local draft so changes only apply to the master list on Save.
export function EditRow({ user, onSave, onCancel }: Props) {
  // Local copy of the user — edits stay here until Save is clicked
  const [draft, setDraft] = useState<User>({ ...user });
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Updates one field on the draft and clears its error
  function handleChange(field: keyof User, value: string): void {
    setDraft({ ...draft, [field]: value });
    setErrors({ ...errors, [field]: undefined });
  }

  // Validates the draft — blocks save and shows errors if invalid
  function handleSave(): void {
    const validationErrors = validateDraft(draft);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave({
      ...draft,
      name: draft?.name?.trim() ?? "",
      email: draft?.email?.trim() ?? "",
    });
  }

  return (
    <>
      <td />

      <td>
        <input
          className={`edit-input${errors.name ? " input-error" : ""}`}
          value={draft?.name ?? ""}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Full name"
          aria-label="Edit name"
        />
        {errors?.name && <span className="field-error">{errors.name}</span>}
      </td>

      <td>
        <input
          className={`edit-input${errors.email ? " input-error" : ""}`}
          type="email"
          value={draft?.email ?? ""}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="email@example.com"
          aria-label="Edit email"
        />
        {errors?.email && <span className="field-error">{errors.email}</span>}
      </td>

      <td>
        <select
          className="edit-select"
          value={draft?.role ?? Role.Member}
          onChange={(e) => handleChange("role", e.target.value)}
          aria-label="Edit role"
        >
          <option value={Role.Member}>member</option>
          <option value={Role.Admin}>admin</option>
        </select>
      </td>

      <td>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            className="btn-save"
            onClick={handleSave}
            aria-label="Save changes"
          >
            Save
          </button>
          <button
            className="btn-cancel"
            onClick={onCancel}
            aria-label="Cancel editing"
          >
            Cancel
          </button>
        </div>
      </td>
    </>
  );
}
