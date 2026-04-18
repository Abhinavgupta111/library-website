import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Group from './models/Group.js';
import mongoose from 'mongoose';

dotenv.config();

const groups = [
    { group_name: '2I123', description: '2nd Year IT Section 1', group_type: 'Official', is_official: true },
    { group_name: '2I456', description: '2nd Year IT Section 2', group_type: 'Official', is_official: true },
    { group_name: '2I789', description: '2nd Year IT Section 3', group_type: 'Official', is_official: true },
    { group_name: '4I123', description: '4th Year IT Section 1', group_type: 'Official', is_official: true },
    { group_name: '4I456', description: '4th Year IT Section 2', group_type: 'Official', is_official: true },
    { group_name: '4I789', description: '4th Year IT Section 3', group_type: 'Official', is_official: true },
    { group_name: '6I123', description: '6th Semester IT Section 1', group_type: 'Official', is_official: true },
    { group_name: '6I456', description: '6th Semester IT Section 2', group_type: 'Official', is_official: true },
    { group_name: '6I789', description: '6th Semester IT Section 3', group_type: 'Official', is_official: true },
];

const seedData = async () => {
    try {
        await connectDB();
        
        const adminId = new mongoose.Types.ObjectId('69ab17f0d9364f6cd787f5a3');

        console.log('Clearing old groups...');
        await Group.deleteMany({});
        
        console.log('Seeding official groups...');
        for (let g of groups) {
            await Group.create({
                ...g,
                created_by: adminId,
                members: [{ user: adminId, role: 'Admin' }]
            });
            console.log(`Added group: ${g.group_name}`);
        }
        
        console.log('Successfully seeded groups!');
        process.exit();
    } catch (error) {
        console.error('Error seeding groups:', error);
        process.exit(1);
    }
};

seedData();
