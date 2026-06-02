import { useState, useEffect } from "react";
import { User } from "../types/user.types";
import { userService } from "../services/userService";

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string;
  updateUser: (updated: User) => void;
  deleteUser: (id: string) => void;
  deleteMultiple: (ids: string[]) => void;
}

// Fetches users on mount and exposes in-memory CRUD operations.
// All changes are local — no writes are sent to the API.
export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Runs once when the component mounts — fetches the user list
  useEffect(() => {
    userService
      .getAll()
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err?.message ?? "An unknown error occurred");
        setLoading(false);
      });
  }, []);

  // Replaces the matching user in the array by id
  function updateUser(updated: User): void {
    setUsers(users.map((user) => (user.id === updated.id ? updated : user)));
  }

  // Removes a single user from the array by id
  function deleteUser(id: string): void {
    setUsers(users.filter((user) => user.id !== id));
  }

  // Removes all users whose ids are in the provided array
  function deleteMultiple(ids: string[]): void {
    setUsers(users.filter((user) => !ids.includes(user.id)));
  }

  return { users, loading, error, updateUser, deleteUser, deleteMultiple };
}
