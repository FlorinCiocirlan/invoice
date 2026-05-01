import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export { sql };

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      cui TEXT,
      reg_com TEXT,
      address TEXT,
      city TEXT,
      county TEXT,
      email_contact TEXT,
      invoice_series TEXT DEFAULT 'F',
      invoice_start_number INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS invoice_series TEXT DEFAULT 'F'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS invoice_start_number INTEGER DEFAULT 1`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_contact TEXT`;

  await sql`
    CREATE TABLE IF NOT EXISTS bank_accounts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      bank_name TEXT NOT NULL,
      iban TEXT NOT NULL,
      swift TEXT,
      currency TEXT DEFAULT 'EUR',
      is_default BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS clients (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      cui TEXT,
      reg_com TEXT,
      address TEXT,
      city TEXT,
      country TEXT DEFAULT 'ROMANIA',
      email TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      client_id INTEGER REFERENCES clients(id),
      bank_account_id INTEGER REFERENCES bank_accounts(id),
      invoice_number TEXT NOT NULL,
      issue_date DATE NOT NULL,
      due_date DATE NOT NULL,
      currency TEXT DEFAULT 'EUR',
      exchange_rate NUMERIC(10,4),
      notes TEXT,
      status TEXT DEFAULT 'draft',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS bank_account_id INTEGER REFERENCES bank_accounts(id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id SERIAL PRIMARY KEY,
      invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      unit TEXT DEFAULT 'BUC',
      quantity NUMERIC(10,2) NOT NULL,
      unit_price NUMERIC(10,2) NOT NULL,
      total NUMERIC(10,2) NOT NULL
    )
  `;
}
