import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Event from './models/Event.js';

dotenv.config();
connectDB();

const seedEvents = async () => {
  try {
    const admin = await User.findOne({ role: 'Admin' });
    if (!admin) {
      console.error('No admin user found. Please create an admin first.');
      process.exit(1);
    }

    const events = [
      {
        title: '33rd India Convergence Expo 2026',
        description: "The IT Department is organizing a visit to India's biggest technology expo at Bharat Mandapam, New Delhi. The expo showcases cutting-edge innovations in 6G, AI, IoT, Fintech, Blockchain, SaaS, Cloud Computing, Cybersecurity, Digital Transformation, Space Technologies, and Smart City solutions.\n\nOnly 40 seats available for 4I789 students.\n\nRegistration Link: https://www.convergenceindia.org/visitor-registration.aspx\nConfirmation (upload screenshot): https://forms.gle/Xc1wtrrGf9VvDKKE9\n\nLast Date for Registration: 21st March 2026\n\nCoordinators: Dr. Neha Singh | Dr. Meenu Garg | Dr. Deepika Bansal",
        event_date: new Date('2026-03-24'),
        venue: 'Bharat Mandapam, New Delhi',
        created_by: admin._id,
      },
      {
        title: 'Poster Submission – Co-Curricular Achievements',
        description: "All students must submit posters highlighting their participation in co-curricular activities or competitions won during the previous semester. Posters may be used for departmental records, display, and accreditation purposes. Ensure all information is accurate and complete.\n\nSubmission Link: https://forms.gle/JrfXb34gcwhcNPPV6\n\nLast Date for Submission: 25th March 2026\n\nFor queries, contact the department office.\nDr. Bhaskar Kapoor (Student Record Coordinator, IT Department)",
        event_date: new Date('2026-03-25'),
        venue: 'Online Submission – IT Department',
        created_by: admin._id,
      },
    ];

    for (const ev of events) {
      const exists = await Event.findOne({ title: ev.title });
      if (!exists) {
        await Event.create(ev);
        console.log('Added: ' + ev.title);
      } else {
        console.log('Already exists: ' + ev.title);
      }
    }

    console.log('Events seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error: ' + error.message);
    process.exit(1);
  }
};

// Wait for DB connection then seed
setTimeout(seedEvents, 2000);
