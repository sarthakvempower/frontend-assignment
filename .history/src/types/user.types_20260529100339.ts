// This file defines the shape of a User object.
// We import this wherever we work with users so
// TypeScript can catch mistakes like typos.

export type Role = 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}
