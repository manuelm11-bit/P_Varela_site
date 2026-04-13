import { db, withRetry } from "./db";
import {
  registrations,
  users,
  type InsertRegistration,
  type Registration,
  type User,
  type InsertUser
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  getRegistrations(): Promise<Registration[]>;
  deleteRegistration(id: number): Promise<void>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    return withRetry(async () => {
      const [registration] = await db.insert(registrations).values(insertRegistration).returning();
      return registration;
    });
  }

  async getRegistrations(): Promise<Registration[]> {
    return withRetry(() =>
      db.select().from(registrations).orderBy(registrations.createdAt)
    );
  }

  async deleteRegistration(id: number): Promise<void> {
    await withRetry(() =>
      db.delete(registrations).where(eq(registrations.id, id))
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return withRetry(async () => {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return withRetry(async () => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return withRetry(async () => {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    });
  }
}

export const storage = new DatabaseStorage();
