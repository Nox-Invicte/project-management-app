export type User = {
  id: string;
  fullName: string;
  email: string;
};

export type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
};

export type LoginInput = Pick<RegisterInput, "email" | "password">;

export type AuthSession = {
  user: User;
  accessToken?: string;
};
