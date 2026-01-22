import { currentUser } from "@clerk/nextjs/server";

export async function getCurrentUser() {
  try {
    return await currentUser();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
