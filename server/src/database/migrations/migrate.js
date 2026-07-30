import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

async function runMigrations() {
    console.log('Starting PostgreSQL database migrations...');

    const clientConfig = process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
        }
        : {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'internflow',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
        };

    const client = new Client(clientConfig);

    try {
        await client.connect();
        console.log('Connected to PostgreSQL database.');

        const files = fs.readdirSync(__dirname)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Ensure they run in numerical order

        for (const file of files) {
            console.log(`Executing migration: ${file}...`);
            const filePath = path.join(__dirname, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            await client.query(sql);
            console.log(`✓ ${file} completed successfully.`);
        }

        console.log('All migrations completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigrations();
