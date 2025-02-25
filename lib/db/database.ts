import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

class Database {
  private static instance: Database;
  private _client: postgres.Sql;
  private _db: ReturnType<typeof drizzle>;

  private constructor() {
    // biome-ignore lint: Forbidden non-null assertion
    this._client = postgres(process.env.POSTGRES_URL!);
    this._db = drizzle(this._client);
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public get db() {
    return this._db;
  }

  public get client() {
    return this._client;
  }
}

export const db = Database.getInstance().db;
