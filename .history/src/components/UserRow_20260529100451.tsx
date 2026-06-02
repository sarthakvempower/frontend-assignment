import React from 'react';
import { User } from '../types/user.types';
import { EditRow } from './EditRow';

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
  // If this row is being edited, show input fields instead
  if (isEditing) {
    return (
      <tr className={isSelected ? 'row selected' : 'row'}>
        <EditRow user={user} onSave={onSave} onCancel={onCancelEdit} />
      </tr>
    );
  }

  return (
    <tr className={isSelected ? 'row selected' : 'row'}>
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
        />
      </td>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>
        <span className={`badge badge-${user.role}`}>{user.role}</span>
      </td>
      <td>
        <button className="btn-icon" onClick={onEdit} title="Edit">✏️</button>
        <button className="btn-icon" onClick={onDelete} title="Delete">🗑️</button>
      </td>
    </tr>
  );
}
