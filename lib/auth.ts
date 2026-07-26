export type Role = "patient" | "doctor" | "admin";

export interface DemoUser {
  id: number;
  email: string;
  password: string;
  role: Role;
  name: string;
  initials: string;
  fname?: string;
  lname?: string;
  dob?: string;
  age?: number;
  phone?: string;
  address?: string;
  occupation?: string;
  bloodGroup?: string;
  conditions?: string;
  createdAt?: string;
}

const DEMO_USERS: DemoUser[] = [
  { id: 1, email: "patient@abuth.ng", password: "patient123", role: "patient", name: "Emeka Bello", initials: "EB" },
  { id: 2, email: "doctor@abuth.ng", password: "doctor123", role: "doctor", name: "Dr. Aisha Musa", initials: "AM" },
  { id: 3, email: "admin@abuth.ng", password: "admin123", role: "admin", name: "System Admin", initials: "SA" },
];

const SESSION_KEY = "abuth_session";
const PATIENTS_KEY = "abuth_patients";

function getRegisteredPatients(): DemoUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(PATIENTS_KEY) || "[]");
  } catch {
    return [];
  }
}

export const ROLE_ROUTES: Record<Role, string> = {
  patient: "/patient-dashboard",
  doctor: "/doctor-dashboard",
  admin: "/admin-dashboard",
};

export function login(
  email: string,
  password: string,
  role: Role | ""
): { user: DemoUser } | { error: string } {
  if (!email || !password || !role) {
    return { error: "Please fill in all fields." };
  }
  const allUsers = [...DEMO_USERS, ...getRegisteredPatients()];
  const user = allUsers.find(
    (u) => u.email === email && u.password === password && u.role === role
  );
  if (!user) {
    return { error: "Invalid credentials or role selection. Please try again." };
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return { user };
}

export interface RegisterInput {
  fname: string;
  lname: string;
  email: string;
  dob: string;
  phone: string;
  address: string;
  password: string;
  confirm: string;
  bloodGroup: string;
  occupation: string;
  conditions: string;
}

export function register(input: RegisterInput): { user: DemoUser } | { error: string } {
  const { fname, lname, email, dob, phone, password, confirm } = input;
  if (!fname || !lname || !email || !dob || !phone || !password || !confirm) {
    return { error: "Please fill all required fields." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }
  const existing = getRegisteredPatients();
  if (existing.find((u) => u.email === email) || DEMO_USERS.find((u) => u.email === email)) {
    return { error: "An account with this email already exists." };
  }
  const age = new Date().getFullYear() - new Date(dob).getFullYear();
  const newUser: DemoUser = {
    id: Date.now(),
    email,
    password,
    role: "patient",
    name: `${fname} ${lname}`,
    initials: `${fname[0]}${lname[0]}`.toUpperCase(),
    fname,
    lname,
    dob,
    age,
    phone,
    address: input.address,
    occupation: input.occupation,
    bloodGroup: input.bloodGroup,
    conditions: input.conditions,
    createdAt: new Date().toISOString(),
  };
  existing.push(newUser);
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(existing));
  return { user: newUser };
}

export function getCurrentUser(): DemoUser | null {
  if (typeof window === "undefined") return null;
  const d = localStorage.getItem(SESSION_KEY);
  return d ? JSON.parse(d) : null;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
