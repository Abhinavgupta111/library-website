import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Group from './models/Group.js';
import Conversation from './models/Conversation.js';

dotenv.config();

connectDB();

const campusData = [
  // 🎓 MAIT COURSES
  { name: "B.Tech CSE - MAIT", type: "course", tags: ["tech", "engineering", "mait", "cse"] },
  { name: "B.Tech IT - MAIT", type: "course", tags: ["tech", "engineering", "mait", "it"] },
  { name: "B.Tech ECE - MAIT", type: "course", tags: ["tech", "engineering", "mait", "ece"] },
  { name: "B.Tech EEE - MAIT", type: "course", tags: ["tech", "engineering", "mait", "eee"] },
  { name: "B.Tech Mechanical - MAIT", type: "course", tags: ["tech", "engineering", "mait", "mech"] },
  { name: "B.Tech AI & ML - MAIT", type: "course", tags: ["tech", "engineering", "mait", "ai", "ml"] },
  { name: "B.Tech Data Science - MAIT", type: "course", tags: ["tech", "engineering", "mait", "ds"] },
  { name: "MBA - MAIT", type: "course", tags: ["management", "mait", "mba"] },
  { name: "M.Tech CSE - MAIT", type: "course", tags: ["tech", "engineering", "mait", "mtech"] },
  { name: "M.Tech ECE - MAIT", type: "course", tags: ["tech", "engineering", "mait", "mtech"] },

  // 🎓 MAIMS COURSES
  { name: "BBA - MAIMS", type: "course", tags: ["management", "maims", "bba"] },
  { name: "BBA (B&I) - MAIMS", type: "course", tags: ["management", "maims", "finance"] },
  { name: "MBA - MAIMS", type: "course", tags: ["management", "maims", "mba"] },
  { name: "BA LLB - MAIMS", type: "course", tags: ["law", "maims", "ballb"] },
  { name: "BBA LLB - MAIMS", type: "course", tags: ["law", "maims", "bballb"] },
  { name: "BJMC - MAIMS", type: "course", tags: ["media", "journalism", "maims", "bjmc"] },

  // 🎭 MAIT SOCIETIES
  { name: "IEEE MAIT", type: "society", tags: ["tech", "mait", "ieee"] },
  { name: "CSI MAIT", type: "society", tags: ["tech", "mait", "csi"] },
  { name: "ISTE MAIT", type: "society", tags: ["tech", "mait", "iste"] },
  { name: "Coding Club / TechSurge", type: "society", tags: ["tech", "mait", "coding"] },
  { name: "Robotics Society", type: "society", tags: ["tech", "mait", "robotics"] },
  { name: "AI/ML Club", type: "society", tags: ["tech", "mait", "ai", "ml"] },
  { name: "Affinity – Dance Society", type: "society", tags: ["cultural", "dance", "mait"] },
  { name: "Aagaaz – Dramatics Society", type: "society", tags: ["cultural", "drama", "mait"] },
  { name: "Crescendo – Music Society", type: "society", tags: ["cultural", "music", "mait"] },
  { name: "Srijan – Fine Arts", type: "society", tags: ["cultural", "arts", "mait"] },
  { name: "Debate Society - MAIT", type: "society", tags: ["intellectual", "debate", "mait"] },
  { name: "Quiz Society - MAIT", type: "society", tags: ["intellectual", "quiz", "mait"] },
  { name: "MUN Society - MAIT", type: "society", tags: ["intellectual", "mun", "mait"] },
  { name: "Photography Society - MAIT", type: "society", tags: ["creative", "photography", "mait"] },
  { name: "Filmmaking Society - MAIT", type: "society", tags: ["creative", "film", "mait"] },
  { name: "Editorial Team - MAIT", type: "society", tags: ["creative", "content", "mait"] },
  { name: "NSS MAIT", type: "society", tags: ["social", "nss", "mait"] },
  { name: "Rotaract Club MAIT", type: "society", tags: ["social", "rotaract", "mait"] },
  { name: "E-Cell MAIT", type: "society", tags: ["business", "startup", "mait"] },

  // 🎭 MAIMS SOCIETIES
  { name: "E-Cell MAIMS", type: "society", tags: ["management", "business", "startup", "maims"] },
  { name: "Marketing Society MAIMS", type: "society", tags: ["management", "marketing", "maims"] },
  { name: "Finance Society MAIMS", type: "society", tags: ["management", "finance", "maims"] },
  { name: "HR Society MAIMS", type: "society", tags: ["management", "hr", "maims"] },
  { name: "Moot Court Society", type: "society", tags: ["law", "maims", "mootcourt"] },
  { name: "Legal Aid Society", type: "society", tags: ["law", "maims", "legal"] },
  { name: "ADR Society", type: "society", tags: ["law", "maims", "adr"] },
  { name: "Media Club MAIMS", type: "society", tags: ["media", "journalism", "maims"] },
  { name: "Film & Photo Society MAIMS", type: "society", tags: ["media", "creative", "maims"] },
  { name: "Content Creation MAIMS", type: "society", tags: ["media", "creative", "maims"] },
  { name: "Dance Society MAIMS", type: "society", tags: ["cultural", "dance", "maims"] },
  { name: "Music Society MAIMS", type: "society", tags: ["cultural", "music", "maims"] },
  { name: "Dramatics Society MAIMS", type: "society", tags: ["cultural", "drama", "maims"] },
  { name: "Fashion Society MAIMS", type: "society", tags: ["cultural", "fashion", "maims"] },
  { name: "Debate Society MAIMS", type: "society", tags: ["intellectual", "debate", "maims"] },
  { name: "Quiz Society MAIMS", type: "society", tags: ["intellectual", "quiz", "maims"] },
  { name: "NSS MAIMS", type: "society", tags: ["social", "nss", "maims"] },
  { name: "Rotaract MAIMS", type: "society", tags: ["social", "rotaract", "maims"] },

  // 🏫 GENERAL
  { name: "MAIT General", type: "general", tags: ["mait", "general"] },
  { name: "MAIMS General", type: "general", tags: ["maims", "general"] },
  { name: "Campus Hub", type: "general", tags: ["general"] },
];

const seedData = async () => {
  try {
    // Optional: Clear existing groups if you want a clean slate
    // await Group.deleteMany({});
    // await Conversation.deleteMany({ type: 'group' });

    console.log('Seeding campus data...');

    for (const item of campusData) {
      // Check if group already exists
      let group = await Group.findOne({ group_name: item.name });

      if (!group) {
        group = await Group.create({
          group_name: item.name,
          group_type: item.type,
          tags: item.tags,
          description: `Official group for ${item.name}`,
          is_official: true
        });

        // Create a corresponding Conversation for this group
        await Conversation.create({
          type: 'group',
          group_id: group._id,
          participants: [], // Will be populated as users join
          unreadCounts: {}
        });
        
        console.log(`Created: ${item.name}`);
      } else {
        // Update existing group with new fields if necessary
        group.group_type = item.type;
        group.tags = item.tags;
        await group.save();
        console.log(`Updated: ${item.name}`);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
