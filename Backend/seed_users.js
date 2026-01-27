const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const hospitalsPath = path.join(__dirname, 'system database', 'hospitals.json');

async function seedUsers() {
    try {
        const data = fs.readFileSync(hospitalsPath, 'utf8');
        const jsonData = JSON.parse(data);
        const hospitals = jsonData.hospitals;

        console.log(`Found ${hospitals.length} hospitals to process...`);

        for (const hospital of hospitals) {
            console.log(`Processing ${hospital.name} (${hospital.email})...`);

            // Check if user exists first to avoid unnecessary errors in logs if running multiple times is common
            // However, admin.createUser sends a confirmation email by default unless email_confirm is false.
            // We should assume we want to create them if they don't exist.

            const { data: userData, error } = await supabase.auth.admin.createUser({
                email: hospital.email,
                password: hospital.password,
                email_confirm: true, // Auto-confirm the email
                user_metadata: {
                    name: hospital.name,
                    hospital_id: hospital.id
                }
            });

            if (error) {
                console.error(`Error creating user ${hospital.email}:`, error.message);
            } else {
                console.log(`User created successfully: ${hospital.email} (ID: ${userData.user.id})`);
            }
        }

        console.log('Seeding completed.');

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

seedUsers();
