import React from "react";
import { User, Role } from "../types/user.types";
import { EditRow } from "./EditRow";

interface Props {
  user: User;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSave: (updated: User) => void;
  onCancelEdit: () => void;
}

// Renders one table row. Switches to EditRow when isEditing is true.
// All action handlers are passed down from UsersTable — this component
// only displays data and reports user interactions upward.
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
  // Show inline edit inputs when this row's id matches editingId in the parent
  if (isEditing) {
    return (
      <tr className={isSelected ? "row selected" : "row"}>
        <EditRow user={user} onSave={onSave} onCancel={onCancelEdit} />
      </tr>
    );
  }

  return (
    <tr className={isSelected ? "row selected" : "row"}>
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          aria-label={`Select ${user?.name ?? "user"}`}
        />
      </td>

      <td>{user?.name}</td>

      <td style={{ color: "#6b7280" }}>{user?.email}</td>

      <td>
        {/* Strict equality against the enum value instead of a raw string */}
        <span
          className={`badge ${user?.role === Role.Admin ? "badge-admin" : "badge-member"}`}
        >
          {user?.role}
        </span>
      </td>

      <td>
        <button
          className="btn-icon btn-icon-edit"
          onClick={onEdit}
          title="Edit"
          aria-label={`Edit ${user?.name}`}
        >
          <img
            src="/edit.svg"
            width={16}
            height={16}
            alt=""
            aria-hidden="true"
          />
        </button>

        <button
          className="btn-icon btn-icon-delete"
          onClick={onDelete}
          title="Delete"
          aria-label={`Delete ${user?.name}`}
        >
          <img
            src="/delete.svg"
            width={16}
            height={16}
            alt=""
            aria-hidden="true"
          />
        </button>
      </td>
    </tr>
  );
}
