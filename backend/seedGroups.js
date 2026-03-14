import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Group from './models/Group.js';
import User from './models/User.js';

dotenv.config();
connectDB();

const seedGroups = async () => {
  try {
    // Delete existing branch groups (optional, here we just clear all groups for a fresh start)
    await Group.deleteMany();

    const adminUser = await User.findOne({ role: 'Admin' });
    const adminId = adminUser ? adminUser._id : null;

    const branches = [
      { name: "B.Sc. (Hons) Computer Science", desc: "Official discussion group for the Computer Science department." },
      { name: "B.Sc. (Hons) Electronics", desc: "Official discussion group for the Electronics department." },
      { name: "B.Sc. (Mathematical Science)", desc: "Official discussion group for Mathematical Science students." },
      { name: "B.A. (Hons) Business Economics", desc: "Official discussion group for Business Economics (BBE)." },
      { name: "B.A. (Hons) Journalism", desc: "Official discussion group for Journalism students." },
      { name: "B.A. (Hons) English", desc: "Official discussion group for English literature students." },
      { name: "B.A. (Hons) Hindi", desc: "Official discussion group for Hindi literature students." },
      { name: "B.A. (Hons) Political Science", desc: "Official discussion group for Political Science." },
      { name: "B.Com (Hons)", desc: "Official discussion group for Commerce students." },
      { name: "B.A. Programme", desc: "Official discussion group for B.A. Programme students." },
      { name: "General Campus Area", desc: "A common space for all students of Maharaja Agrasen College." }
    ];

    const groupsToInsert = branches.map(branch => ({
      group_name: branch.name,
      group_type: 'Official',
      description: branch.desc,
      is_official: true,
      created_by: adminId,
      members: adminId ? [{ user: adminId, role: 'Admin' }] : []
    }));

    await Group.insertMany(groupsToInsert);

    console.log('Maharaja Agrasen College Branch Groups Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedGroups();
