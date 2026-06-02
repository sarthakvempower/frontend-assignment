/**
 * @file EditRow.tsx
 * @description Renders a table row in edit mode with inline input fields.
 *
 * Key concepts:
 *  - Keeps a LOCAL copy (draft) of the user being edited
 *  - Changes only apply to the real list when Save is clicked
 *  - Validates name and email before allowing save
 *  - Shows inline error messages under each invalid field
 */

import React, { useState } from "react";
import {
  User,
  Role,
  validateDraft,
  ValidationErrors,
} from "../types/user.types";

/** Props accepted by EditRow */
interface Props {
  /** The user being edited — EditRow makes a local copy, never mutates this */
  user: User;
  /** Called with the updated user when Save is clicked (only if valid) */
  onSave: (updated: User) => void;
  /** Called when Cancel is clicked — discards all changes */
  onCancel: () => void;
}

/**
 * EditRow — inline edit form rendered as table cells.
 *
 * Optional chaining is used when reading draft fields in case
 * any field is somehow undefined (defensive, won't happen with our
 * typed state but shows the pattern).
 *
 * @param props - See Props interface above
 */
export function EditRow({ user, onSave, onCancel }: Props) {
  /**
   * draft: local copy of the user.
   * { ...user } = spread operator — creates a shallow copy so we
   * edit the copy, not the original, until Save is clicked.
   */
  const [draft, setDraft] = useState<User>({ ...user });

  /**
   * errors: validation messages shown under each field.
   * Empty object = no errors yet (before first save attempt).
   */
  const [errors, setErrors] = useState<ValidationErrors>({});

  /**
   * Updates one field of the draft.
   * [field] is a computed property key — uses the variable's value as the key name.
   * e.g. handleChange('name', 'John') → { ...draft, name: 'John' }
   *
   * @param field - Which field to update (keyof User = 'id' | 'name' | 'email' | 'role')
   * @param value - The new value for that field
   */
  function handleChange(field: keyof User, value: string): void {
    setDraft({ ...draft, [field]: value });
    // Clear the error for this field as soon as the user starts typing
    setErrors({ ...errors, [field]: undefined });
  }

  /**
   * Runs validation before saving.
   * If there are any errors, shows them and blocks save.
   * validateDraft() is imported from user.types.ts.
   */
  function handleSave(): void {
    const validationErrors = validateDraft(draft);

    // Object.keys returns an array of the error keys — if any exist, block save
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // Stop here — don't call onSave
    }

    // Trim whitespace before saving
    onSave({
      ...draft,
      name: draft?.name?.trim() ?? "",
      email: draft?.email?.trim() ?? "",
    });
  }

  return (
    <>
      {/* Empty cell for the checkbox column */}
      <td />

      {/* Name field */}
      <td>
        <input
          className={`edit-input${errors.name ? " input-error" : ""}`}
          value={draft?.name ?? ""}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Full name"
          aria-label="Edit name"
        />
        {/* Optional chaining: errors?.name only renders if errors.name exists */}
        {errors?.name && <span className="field-error">{errors.name}</span>}
      </td>

      {/* Email field */}
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

      {/* Role dropdown — uses Role enum values */}
      <td>
        <select
          className="edit-select"
          value={draft?.role ?? Role.Member}
          onChange={(e) => handleChange("role", e.target.value)}
          aria-label="Edit role"
        >
          {/*
            Role.Member = 'member', Role.Admin = 'admin'
            Using the enum here instead of raw strings means
            if we ever rename the values, this updates automatically
          */}
          <option value={Role.Member}>member</option>
          <option value={Role.Admin}>admin</option>
        </select>
      </td>

      {/* Save / Cancel buttons */}
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
