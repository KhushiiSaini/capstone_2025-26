import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import jwt from "jsonwebtoken";
import { registerStudentEvent } from "./routes/events";
const fastify = Fastify({ logger: true });
const PORT = 3114;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface AuthUser {
  email: string;
  id?: number;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  preferredName?: string;
  email: string;
  phoneNumber?: string;
  dob?: string | null;
  dietaryRestrictions?: string;
  emergencyContact?: string;
  mediaConsent?: boolean;
  program?: string;
  year?: string;
  studentNumber?: string;
  pronouns?: string;
}

// Mock user database for development
const mockUsers: { [email: string]: AuthUser } = {
  "user@teamd.local": { email: "user@teamd.local", id: 1 },
  "test@teamd.dev": { email: "test@teamd.dev", id: 2 },
  "demo@teamd.local": { email: "demo@teamd.local", id: 3 },
  "alice.johnson@mcmaster.ca": { email: "alice.johnson@mcmaster.ca", id: 4 },
  "bob.smith@mcmaster.ca": { email: "bob.smith@mcmaster.ca", id: 5 },
      'charlie.brown@mcmaster.ca': { email: 'charlie.brown@mcmaster.ca', id: 6}

};

const profileStore: Record<string, UserProfile> = {
  "user@teamd.local": {
    firstName: "Taylor",
    lastName: "Morgan",
    preferredName: "Tay",
    email: "user@teamd.local",
    phoneNumber: "905-555-0101",
    dob: "1999-03-18",
    dietaryRestrictions: "Vegetarian",
    emergencyContact: "Jordan Morgan - 905-555-1199",
    mediaConsent: true,
    program: "Software Engineering",
    year: "4",
    studentNumber: "400123456",
    pronouns: "They/Them",
  },
  "test@teamd.dev": {
    firstName: "Priya",
    lastName: "Singh",
    email: "test@teamd.dev",
    phoneNumber: "289-666-1234",
    dob: "2000-07-11",
    dietaryRestrictions: "None",
    emergencyContact: "Arjun Singh - 289-777-0101",
    mediaConsent: false,
    program: "Mechanical Engineering",
    year: "3",
    studentNumber: "400654321",
    pronouns: "She/Her",
  },
  "demo@teamd.local": {
    firstName: "Logan",
    lastName: "Chen",
    email: "demo@teamd.local",
    phoneNumber: "416-210-8888",
    dob: "1998-01-05",
    dietaryRestrictions: "Peanut allergy",
    emergencyContact: "Kai Chen - 416-210-1212",
    mediaConsent: true,
    program: "Civil Engineering",
    year: "Masters",
    studentNumber: "401111222",
    pronouns: "He/Him",
  },
  "alice.johnson@mcmaster.ca": {
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice.johnson@mcmaster.ca",
    phoneNumber: "905-777-2121",
    dob: "2001-05-12",
    dietaryRestrictions: "Gluten-free",
    emergencyContact: "Sam Johnson - 905-777-1111",
    mediaConsent: true,
    program: "Electrical Engineering",
    year: "2",
    studentNumber: "401999888",
    pronouns: "She/Her",
  },
  "bob.smith@mcmaster.ca": {
    firstName: "Bob",
    lastName: "Smith",
    email: "bob.smith@mcmaster.ca",
    phoneNumber: "905-444-3434",
    dob: "1997-11-02",
    dietaryRestrictions: "None",
    emergencyContact: "Erin Smith - 905-444-9898",
    mediaConsent: false,
    program: "Materials Engineering",
    year: "PhD",
    studentNumber: "402000123",
    pronouns: "He/Him",
  },
  "charlie.brown@mcmaster.ca": {
    firstName: "Charlie",
    lastName: "Brown",
    email: "charlie.brown@mcmaster.ca",
    phoneNumber: "905-555-0102",
    dob: "2001-11-05",
    dietaryRestrictions: "Gluten-Free",
    emergencyContact: "Sister: 905-555-3333",
    mediaConsent: true,
    program: "Mathematics",
    year: "4",
    studentNumber: "S3456789",
    pronouns: "They/Them",
  },

};

function getProfile(email: string): UserProfile {
  if (!profileStore[email]) {
    profileStore[email] = {
      firstName: "New",
      lastName: "User",
      email,
    };
  }
  return profileStore[email];
}

function validateUser(email: string): AuthUser | null {
  return mockUsers[email] || null;
}

function generateToken(user: AuthUser): string {
  return jwt.sign({ user }, JWT_SECRET, { expiresIn: "24h" });
}

function verifyToken(token: string): { user: AuthUser } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { user: AuthUser };
    return decoded;
  } catch (error) {
    return null;
  }
}

// Register plugins
await fastify.register(cors, {
  origin: "http://localhost:3014",
  credentials: true,
});

await fastify.register(cookie);
await registerStudentEvent(fastify);

// Auth hook
fastify.decorateRequest("user", null);

fastify.addHook("onRequest", async (request, reply) => {
  const protectedRoutes = ["/api/auth/me", "/api/auth/token"];
  const requiresAuth =
    protectedRoutes.includes(request.url) ||
    request.url.startsWith("/api/profile");

  if (requiresAuth) {
    const token = request.cookies["auth-token"];

    if (!token) {
      reply.code(401).send({ error: "Unauthorized" });
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      reply.code(401).send({ error: "Invalid token" });
      return;
    }

    (request as any).user = decoded.user;
  }
});

// Login endpoint
fastify.post("/api/auth/login", async (request, reply) => {
  try {
    const { email } = request.body as { email: string };

    if (!email) {
      return reply.code(400).send({ error: "Email is required" });
    }

    const user = validateUser(email);
    if (!user) {
      return reply.code(401).send({ error: "User not found" });
    }

    const token = generateToken(user);

    reply.setCookie("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    reply.send({
      success: true,
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (error) {
    fastify.log.error({ err: error }, "Login error");
    reply.code(500).send({ error: "Internal server error" });
  }
});

// Logout endpoint
fastify.post("/api/auth/logout", async (request, reply) => {
  reply.clearCookie("auth-token", { path: "/" });
  reply.send({ success: true });
});

// Get current user endpoint
fastify.get("/api/auth/me", async (request, reply) => {
  reply.send({ user: (request as any).user });
});

// Get token endpoint
fastify.get("/api/auth/token", async (request, reply) => {
  const token = request.cookies["auth-token"];
  reply.send({ token });
});

fastify.get("/api/profile", async (request, reply) => {
  const user = (request as any).user as AuthUser | undefined;
  if (!user) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  const profile = getProfile(user.email);
  reply.send(profile);
});

fastify.put("/api/profile", async (request, reply) => {
  const user = (request as any).user as AuthUser | undefined;
  if (!user) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  const updates = request.body as Partial<UserProfile>;
  const profile = getProfile(user.email);

  profileStore[user.email] = {
    ...profile,
    ...updates,
    email: user.email,
  };

  reply.send(profileStore[user.email]);
});

// Start server
try {
  await fastify.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`Team D User server running on http://localhost:${PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
