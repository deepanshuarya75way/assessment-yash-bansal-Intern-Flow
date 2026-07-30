import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

import pool, { closePool } from '../../config/database.js';

/**
 * Seeds the roles table with default roles and their permission sets.
 * Uses INSERT … ON DUPLICATE KEY UPDATE to be idempotent.
 */
async function seedRoles() {
  const roles = [
    {
      name: 'Super Admin',
      slug: 'super_admin',
      description: 'Full system access with all permissions',
      permissions: {
        users:       { create: true, read: true, update: true, delete: true },
        projects:    { create: true, read: true, update: true, delete: true },
        tasks:       { create: true, read: true, update: true, delete: true },
        evaluations: { create: true, read: true, update: true, delete: true },
        settings:    { manage: true },
        reports:     { view: true, export: true },
      },
    },
    {
      name: 'Admin',
      slug: 'admin',
      description: 'Administrative access for managing interns, projects, and evaluations',
      permissions: {
        users:       { create: true, read: true, update: true, delete: false },
        projects:    { create: true, read: true, update: true, delete: true },
        tasks:       { create: true, read: true, update: true, delete: true },
        evaluations: { create: true, read: true, update: true, delete: false },
        settings:    { manage: false },
        reports:     { view: true, export: true },
      },
    },
    {
      name: 'Mentor',
      slug: 'mentor',
      description: 'Guides interns, reviews tasks, and provides evaluations',
      permissions: {
        users:       { create: false, read: true, update: false, delete: false },
        projects:    { create: true, read: true, update: true, delete: false },
        tasks:       { create: true, read: true, update: true, delete: false },
        evaluations: { create: true, read: true, update: true, delete: false },
        settings:    { manage: false },
        reports:     { view: true, export: false },
      },
    },
    {
      name: 'Team Lead',
      slug: 'team_lead',
      description: 'Leads a team of interns, manages sprints and task assignments',
      permissions: {
        users:       { create: false, read: true, update: false, delete: false },
        projects:    { create: false, read: true, update: true, delete: false },
        tasks:       { create: true, read: true, update: true, delete: false },
        evaluations: { create: false, read: true, update: false, delete: false },
        settings:    { manage: false },
        reports:     { view: true, export: false },
      },
    },
    {
      name: 'Intern',
      slug: 'intern',
      description: 'Internship participant with access to assigned tasks and personal progress',
      permissions: {
        users:       { create: false, read: false, update: false, delete: false },
        projects:    { create: false, read: true, update: false, delete: false },
        tasks:       { create: false, read: true, update: true, delete: false },
        evaluations: { create: false, read: true, update: false, delete: false },
        settings:    { manage: false },
        reports:     { view: false, export: false },
      },
    },
  ];

  console.log('🌱  Seeding roles…');

  for (const role of roles) {
    await pool.execute(
      `INSERT INTO roles (name, description, permissions)
       VALUES (?, ?, ?)
       ON CONFLICT (name) DO UPDATE SET
         description = EXCLUDED.description,
         permissions = EXCLUDED.permissions`,
      [role.name, role.description, JSON.stringify(role.permissions)]
    );
    console.log(`  ✅  Role "${role.name}" seeded.`);
  }

  console.log('🌱  Roles seeding complete.\n');
}

export default seedRoles;

// Allow standalone execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedRoles()
    .then(() => closePool())
    .catch((err) => {
      console.error('❌  Roles seeding failed:', err.message);
      closePool();
      process.exit(1);
    });
}
