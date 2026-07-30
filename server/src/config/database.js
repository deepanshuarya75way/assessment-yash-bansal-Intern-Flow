import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const poolConfig = process.env.DATABASE_URL
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
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    };

export const pgPool = new Pool(poolConfig);

/**
 * Converts MySQL-style '?' placeholders in SQL queries to PostgreSQL '$1', '$2', ... placeholders
 * and automatically appends RETURNING id for INSERT queries if not already present.
 */
export function convertSql(sql) {
    let index = 1;
    let convertedSql = sql.replace(/\?/g, () => `$${index++}`);

    // If it's an INSERT statement and doesn't already contain RETURNING clause
    if (/^\s*INSERT\s+INTO/i.test(convertedSql) && !/RETURNING/i.test(convertedSql)) {
        convertedSql += ' RETURNING id';
    }

    return convertedSql;
}

/**
 * Execute query and format return value as [rows, meta] to maintain compatibility with mysql2 pool.query
 */
export const query = async (sql, params = []) => {
    const formattedSql = convertSql(sql);
    const res = await pgPool.query(formattedSql, params);

    const rows = res.rows || [];
    const meta = {
        insertId: rows.length > 0 && rows[0].id ? rows[0].id : 0,
        affectedRows: res.rowCount,
        rowCount: res.rowCount
    };

    return [rows, meta];
};

export const getConnection = async () => {
    const client = await pgPool.connect();
    const wrappedClient = {
        query: async (sql, params = []) => {
            const formattedSql = convertSql(sql);
            const res = await client.query(formattedSql, params);
            const rows = res.rows || [];
            const meta = {
                insertId: rows.length > 0 && rows[0].id ? rows[0].id : 0,
                affectedRows: res.rowCount,
                rowCount: res.rowCount
            };
            return [rows, meta];
        },
        release: () => client.release()
    };
    return wrappedClient;
};

export const testConnection = async () => {
    try {
        const client = await pgPool.connect();
        console.log('PostgreSQL database connected successfully');
        client.release();
    } catch (error) {
        console.error('PostgreSQL database connection failed:', error.message);
    }
};

export const closePool = async () => {
    await pgPool.end();
};

const poolAdapter = {
    query,
    execute: query,
    getConnection,
    closePool
};

export default poolAdapter;
