import { User } from "../types/user.types";

const API_URL =
  "https://excelerate-profile-dev.s3.ap-south-1.amazonaws.com/1681980949109_users.json";

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
