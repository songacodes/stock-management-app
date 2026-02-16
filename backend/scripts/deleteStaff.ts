
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';

dotenv.config();

const deleteStaff = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB');

        const emailsToDelete = ['staff@example.com', 'staff@staff.tilestock.app'];

        const result = await User.deleteMany({ email: { $in: emailsToDelete } });
        console.log(`Successfully deleted ${result.deletedCount} staff users.`);

        process.exit(0);
    } catch (error) {
        console.error('Error deleting staff users:', error);
        process.exit(1);
    }
};

deleteStaff();
