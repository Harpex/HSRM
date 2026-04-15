import { AuthUser } from "../types";

export interface RegisterInput {
  username: string;
  fullName: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role: "user" | "dietitian";
}

export interface LoginInput {
  identifier: string;
  password: string;
}

const encoder = new TextEncoder();

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const normalizeUsername = (username: string) => username.trim().toLowerCase();

export const hashPassword = async (password: string, salt: string) => {
  // Alpha demo: hashing is client-side because GitHub Pages has no backend runtime.
  // Production auth should move password handling to Supabase Auth or a trusted server.
  const payload = encoder.encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", payload);
  return toHex(digest);
};

export const validateRegisterInput = (input: RegisterInput, users: AuthUser[]) => {
  const username = normalizeUsername(input.username);
  const email = normalizeEmail(input.email);

  if (!/^[a-zA-Z0-9_]{3,24}$/.test(input.username.trim())) {
    return "Kullanıcı adı 3-24 karakter olmalı; harf, sayı ve alt çizgi kullanabilirsin.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Lütfen geçerli bir e-posta adresi gir.";
  }

  if (input.password.length < 8) {
    return "Şifre en az 8 karakter olmalı.";
  }

  if (!/[A-Za-z]/.test(input.password) || !/[0-9]/.test(input.password)) {
    return "Şifre en az bir harf ve bir rakam içermeli.";
  }

  if (input.password !== input.passwordConfirm) {
    return "Şifreler eşleşmiyor.";
  }

  if (users.some((user) => normalizeUsername(user.username) === username)) {
    return "Bu kullanıcı adı zaten kullanılıyor.";
  }

  if (users.some((user) => normalizeEmail(user.email) === email)) {
    return "Bu e-posta adresi zaten kayıtlı.";
  }

  return "";
};

export const createUser = async (input: RegisterInput): Promise<AuthUser> => {
  const salt = crypto.randomUUID();
  return {
    id: crypto.randomUUID(),
    username: input.username.trim(),
    fullName: input.fullName.trim(),
    email: normalizeEmail(input.email),
    role: input.role,
    passwordSalt: salt,
    passwordHash: await hashPassword(input.password, salt),
    createdAt: new Date().toISOString(),
  };
};

export const findLoginUser = async (input: LoginInput, users: AuthUser[]) => {
  const identifier = input.identifier.trim().toLowerCase();

  if (!identifier || !input.password) {
    return { user: null, error: "E-posta/kullanıcı adı ve şifre gerekli." };
  }

  const user = users.find(
    (candidate) => candidate.email.toLowerCase() === identifier || candidate.username.toLowerCase() === identifier,
  );

  if (!user) {
    return { user: null, error: "Bu bilgilerle kayıtlı kullanıcı bulunamadı." };
  }

  const passwordHash = await hashPassword(input.password, user.passwordSalt);
  if (passwordHash !== user.passwordHash) {
    return { user: null, error: "Şifre hatalı. Lütfen tekrar dene." };
  }

  return { user, error: "" };
};
