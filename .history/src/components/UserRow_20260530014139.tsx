/**
 * @file UserRow.tsx
 * @description Renders a single table row.
 * Switches between view mode and edit mode based on the isEditing prop.
 * All action handlers come from the parent — this component is "dumb"
 * (it displays data and reports events, never manages state itself).
 *
 * Uses SVG icons instead of emoji for crisp rendering at all resolutions.
 */

import React from "react";
import { User, Role } from "../types/user.types";
import { EditRow } from "./EditRow";

/** Props accepted by UserRow */
interface Props {
  /** The user to display */
  user: User;
  /** Whether the checkbox for this row is checked */
  isSelected: boolean;
  /** Whether this row is in edit mode */
  isEditing: boolean;
  /** Called when the checkbox is toggled */
  onSelect: () => void;
  /** Called when the Edit (pencil) button is clicked */
  onEdit: () => void;
  /** Called when the Delete (trash) button is clicked */
  onDelete: () => void;
  /** Called by EditRow when Save is clicked */
  onSave: (updated: User) => void;
  /** Called by EditRow when Cancel is clicked */
  onCancelEdit: () => void;
}

/**
 * SVG pencil icon — used for the Edit button.
 * Pure SVG, no emoji, no external library needed.
 */
function PencilIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

/**
 * SVG trash icon — used for the Delete button.
 */
function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

/**
 * UserRow — one row in the users table.
 *
 * Optional chaining usage:
 *   user?.role safely reads role even if user is somehow undefined.
 *   In practice it won't be (TypeScript enforces it), but it's good habit.
 *
 * @param props - See Props interface above
 */
export function UserRow({
  user,
  isSelected,
  isEditing,
  onSelect,
  onEdit,
  onDelete,
  onSave,
  onCancelEdit,
}: Props) {
  // If this row is being edited, render EditRow instead of the normal cells
  if (isEditing) {
    return (
      <tr className={isSelected ? "row selected" : "row"}>
        <EditRow user={user} onSave={onSave} onCancel={onCancelEdit} />
      </tr>
    );
  }

  return (
    <tr className={isSelected ? "row selected" : "row"}>
      {/* Checkbox */}
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          aria-label={`Select ${user?.name ?? "user"}`}
        />
      </td>

      {/* Name — optional chaining: user?.name won't throw if undefined */}
      <td>{user?.name}</td>

      {/* Email */}
      <td style={{ color: "#6b7280" }}>{user?.email}</td>

      {/* Role badge — uses Role enum to compare: Role.Admin = 'admin' */}
      <td>
        <span
          className={`badge ${user?.role === Role.Admin ? "badge-admin" : "badge-member"}`}
        >
          {user?.role}
        </span>
      </td>

      {/* Actions — SVG icons, no emoji */}
      <td>
        <button
          className="btn-icon btn-icon-edit"
          onClick={onEdit}
          title="Edit"
          aria-label={`Edit ${user?.name}`}
        >
          <PencilIcon />
        </button>
        <button
          className="btn-icon btn-icon-delete"
          onClick={onDelete}
          title="Delete"
          aria-label={`Delete ${user?.name}`}
        >
          <TrashIcon />
        </button>
      </td>
    </tr>
  );
}
