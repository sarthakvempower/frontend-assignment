/**
 * @file userService.ts
 * @description API layer — all network calls live here.
 * Components never call fetch() directly. If the API URL changes,
 * only this file needs updating.
 */

import { User } from "../types/user.types";

const API_URL =
  "https://excelerate-profile-dev.s3.ap-south-1.amazonaws.com/1681980949109_users.json";

export const userService = {
  /**
   * Fetches all users from the remote API.
   *
   * Optional chaining note:
   *   response?.ok uses optional chaining to safely access .ok
   *   even if response were somehow undefined (defensive programming).
   *
   * @returns Promise resolving to an array of User objects
   * @throws Error if the HTTP response is not OK (4xx / 5xx)
   */
  async getAll(): Promise<User[]> {
    const response = await fetch(API_URL);

    // response?.ok — optional chaining: safely reads .ok
    if (!response?.ok) {
      throw new Error(
        `Failed to fetch users (status: ${response?.status ?? "unknown"})`,
      );
    }

    const data = await response.json();

    // Optional chaining when reading the array:
    // data is User[] from the API but we treat it safely
    return (data as User[]) ?? [];
  },
};
