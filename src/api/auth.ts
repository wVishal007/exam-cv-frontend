import { api } from "../lib/axios";
import type { AuthTokens, User } from "../types";

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<void> {
  await api.post("/add/user", payload);
}

export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<AuthTokens> {
  const { data } = await api.post<AuthTokens>("/login/user", payload);
  return data;
}

export async function fetchProfile(): Promise<User> {
  const { data } = await api.get<User>("/my/profile");
  return data;
}