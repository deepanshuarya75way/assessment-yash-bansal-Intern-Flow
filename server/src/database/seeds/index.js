import dotenv from 'dotenv';
import pool from '../../config/database.js';
import { defaultSkills } from './skills.seed.js';

dotenv.config();

async function runSeeds() {
    console.log('Starting PostgreSQL database seeding...');
    
    try {
        console.log('Seeding skills...');
        for (const skill of defaultSkills) {
            await pool.query(
                'INSERT INTO skills (name, category, description) VALUES (?, ?, ?) ON CONFLICT (name) DO NOTHING',
                [skill.name, skill.category, skill.description]
            );
        }
        console.log(`✓ Seeded ${defaultSkills.length} skills successfully.`);
        
        console.log('Note: Roles are seeded via migrations.');
        console.log('All seeding completed successfully!');
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    } finally {
        if (pool.closePool) {
            await pool.closePool();
        }
    }
}

runSeeds();
