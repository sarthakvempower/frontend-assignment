import { useState, useEffect } from 'react';
import { User } from '../types/user.types';
import { userService } from '../services/userService';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    userService
      .getAll()
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  
  function updateUser(updated: User) {
    setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
  }

  
  function deleteUser(id: string) {
    setUsers(users.filter((u) => u.id !== id));
  }

  
  function deleteMultiple(ids: string[]) {
    setUsers(users.filter((u) => !ids.includes(u.id)));
  }

  return { users, loading, error, updateUser, deleteUser, deleteMultiple };
}
