export interface User {
  id?: number | null;
  email: string;
  password: string;
  createdAt?: string | null;
}

export interface Token {
  token: string;
}