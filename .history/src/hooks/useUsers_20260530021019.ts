/**
 * @file useUsers.ts
 * @description Custom React hook — owns the master users array in memory.
 * Fetches from the API on mount, exposes CRUD operations.
 * No component should modify the users array directly — always go through
 * the functions returned by this hook.
 */

import { useState, useEffect } from "react";
import { User } from "../types/user.types";
import { userService } from "../services/userService";

/**
 * Return type of the useUsers hook.
 * Explicitly typed so callers know exactly what they get.
 */
interface UseUsersReturn {
  /** The full list of users currently in memory */
  users: User[];
  /** True while the first API fetch is in progress */
  loading: boolean;
  /** Non-empty string if the API call failed */
  error: string;
  /** Replace one user in the list (matched by id) */
  updateUser: (updated: User) => void;
  /** Remove one user from the list by id */
  deleteUser: (id: string) => void;
  /** Remove multiple users at once by their ids */
  deleteMultiple: (ids: string[]) => void;
}

/**
 * Fetches users from the API and provides in-memory CRUD operations.
 * All changes are in memory only — no API writes are made.
 *
 * @returns UseUsersReturn
 */
export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  /**
   * useEffect with empty [] runs exactly once — when the component mounts.
   * This is where the API fetch happens.
   */
  useEffect(() => {
    userService
      .getAll()
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        // Optional chaining: err?.message safely reads message
        // even if err is not a standard Error object
        setError(err?.message ?? "An unknown error occurred");
        setLoading(false);
      });
  }, []);

  /**
   * Replaces one user in the array by id.
   * Uses .map() — returns a new array, never mutates the existing one.
   *
   * @param updated - The updated user object (must have the same id)
   */
  function updateUser(updated: User): void {
    setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
  }

  /**
   * Removes one user from the array by id.
   *
   * @param id - The id of the user to remove
   */
  function deleteUser(id: string): void {
    setUsers(users.filter((u) => u.id !== id));
  }

  /**
   * Removes multiple users at once.
   * Used by the "Delete Selected" bulk action.
   *
   * @param ids - Array of user ids to remove
   */
  function deleteMultiple(ids: string[]): void {
    setUsers(users.filter((u) => !ids.includes(u.id)));
  }

  return { users, loading, error, updateUser, deleteUser, deleteMultiple };
}
