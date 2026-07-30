import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import pool from '../../config/database.js';

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Diya', 'Ananya', 'Kavya', 'Avni', 'Saanvi', 'Riya', 'Pari', 'Anika', 'Navya', 'Khushi', 'Rohan', 'Meera', 'Kiran', 'Priya', 'Amit', 'Neha', 'Rahul', 'Sneha', 'Vikram', 'Pooja'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Patel', 'Joshi', 'Mishra', 'Yadav', 'Choudhary', 'Thakur', 'Rajput', 'Das', 'Bose', 'Chatterjee', 'Iyer', 'Menon', 'Nair', 'Pillai', 'Reddy', 'Gowda', 'Rao', 'Desai', 'Mehta', 'Shah'];
const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
const colleges = ['IIT Delhi', 'IIT Bombay', 'NIT Trichy', 'BITS Pilani', 'VIT Vellore', 'SRM Chennai', 'Manipal Institute of Technology', 'Delhi Technological University', 'Anna University', 'Jadavpur University'];
const statuses = ['not_started', 'active', 'completed'];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function seedDummyUsers() {
    console.log('Generating password hash...');
    const defaultPassword = 'password123';
    const passwordHash = await bcrypt.hash(defaultPassword, 12);
    
    // Config: Role ID mappings
    // 1: admin, 2: mentor (project manager), 3: student (intern), 4: team_lead, 5: placement_coordinator
    const seedConfig = [
        { roleId: 1, count: 1, rolePrefix: 'admin', staticEmail: 'admin@demo.com' },
        { roleId: 3, count: 10, rolePrefix: 'intern', staticEmail: 'student@demo.com' },
        { roleId: 5, count: 10, rolePrefix: 'pc', staticEmail: 'coordinator@demo.com' },
        { roleId: 4, count: 5, rolePrefix: 'tl', staticEmail: 'teamlead@demo.com' },
        { roleId: 2, count: 5, rolePrefix: 'pm', staticEmail: 'mentor@demo.com' }
    ];

    let totalUsersAdded = 0;
    const internIds = [];
    const mentorIds = [];
    
    for (const config of seedConfig) {
        console.log(`Seeding ${config.count} users for role ${config.roleId}...`);
        for (let i = 1; i <= config.count; i++) {
            const firstName = getRandomItem(firstNames);
            const lastName = getRandomItem(lastNames);
            // Use static email for the first user of each role, randomize the rest
            const email = (i === 1 && config.staticEmail) ? config.staticEmail : `${config.rolePrefix}${i}.${firstName.toLowerCase()}@internflow.demo`;
            const phone = `+9198765${Math.floor(10000 + Math.random() * 90000)}`;
            const department = getRandomItem(departments);
            const college = config.roleId === 3 ? getRandomItem(colleges) : null;
            const bio = `Hi, I am ${firstName}. I work in ${department} and am excited to be here!`;
            const status = config.roleId === 3 ? getRandomItem(statuses) : 'not_started';
            
            try {
                const [result] = await pool.query(
                    `INSERT INTO users (
                        uuid, first_name, last_name, email, password_hash, role_id, 
                        department, college, profile_picture_url, phone, bio, internship_status, 
                        theme_preference, email_verified, is_active
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name`,
                    [
                        uuidv4(),
                        firstName,
                        lastName,
                        email,
                        passwordHash,
                        config.roleId,
                        department,
                        college,
                        `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}`,
                        phone,
                        bio,
                        status,
                        'light',
                        true,
                        true
                    ]
                );
                
                // Fetch the ID explicitly to handle ON CONFLICT safely
                const [[userRow]] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
                
                // Track IDs for internships mapping
                if (config.roleId === 3) internIds.push(userRow.id);
                if (config.roleId === 2) mentorIds.push(userRow.id);
                
                totalUsersAdded++;
            } catch (err) {
                console.error(`Error inserting ${email}:`, err.message);
            }
        }
    }

    console.log(`\nSuccessfully seeded ${totalUsersAdded} dummy users.`);
    
    // Seed Internships
    if (internIds.length > 0 && mentorIds.length > 0) {
        console.log(`Seeding ${internIds.length} internships...`);
        let internshipsAdded = 0;
        
        for (const internId of internIds) {
            const mentorId = getRandomItem(mentorIds);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30)); // Started within last 30 days
            
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 6); // 6 month internship
            
            try {
                await pool.query(
                    `INSERT INTO internships (user_id, mentor_id, title, company, start_date, end_date, status)
                     VALUES (?, ?, ?, 'InternFlow internal', ?, ?, 'active')`,
                    [internId, mentorId, 'Software Engineering Intern', startDate, endDate]
                );
                internshipsAdded++;
            } catch (err) {
                console.error(`Error inserting internship for intern ${internId}:`, err.message);
            }
        }
        console.log(`Successfully seeded ${internshipsAdded} internships.`);
    }

    console.log('\nDefault login password for all dummy users is: password123');
    
    // Log sample emails for testing
    console.log('\nStatic Demo Emails for One-Click Login:');
    console.log('- Admin: admin@demo.com');
    console.log('- Intern: student@demo.com');
    console.log('- Placement Coordinator: coordinator@demo.com');
    console.log('- Team Lead: teamlead@demo.com');
    console.log('- Project Manager (Mentor): mentor@demo.com');
}

seedDummyUsers()
    .then(() => pool.closePool ? pool.closePool() : process.exit(0))
    .catch((err) => {
        console.error('Seeding failed:', err);
        if (pool.closePool) pool.closePool();
        process.exit(1);
    });
