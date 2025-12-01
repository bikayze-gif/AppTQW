
import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";
import mysql from "mysql2/promise";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MySQLStorage implements IStorage {
  private pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool({
      host: "170.239.85.233",
      port: 3306,
      user: "ncornejo",
      password: "N1c0l7as17",
      database: "ncornejo", // ajusta el nombre de tu base de datos
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    const users = rows as User[];
    return users[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    const users = rows as User[];
    return users[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    await this.pool.execute(
      'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
      [id, insertUser.username, insertUser.password]
    );
    return { ...insertUser, id };
  }
}

export const storage = new MySQLStorage();
