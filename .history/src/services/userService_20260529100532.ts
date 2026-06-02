import { User } from '../types/user.types';

const API_URL =
  'https://excelerate-profile-dev.s3.ap-south-1.amazonaws.com/1681980949109_users.json';

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  },
};
