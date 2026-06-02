import { User } from "../types/user.types";

const API_URL = import.meta.env.VITE_API_URL;

export const userService = {
  // Fetches all users from the API. Throws if the response is not OK.
  async getAll(): Promise<User[]> {
    const response = await fetch(API_URL);

    if (!response?.ok) {
      throw new Error(
        `Failed to fetch users (status: ${response?.status ?? "unknown"})`,
      );
    }

    const data = await response.json();
    return (data as User[]) ?? [];
  },
};
