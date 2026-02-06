
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';
import Shop from '../src/models/Shop';

dotenv.config();

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB');

        // Create a default shop if not exists
        let shop = await Shop.findOne({ name: 'Main Shop' });
        if (!shop) {
            shop = await Shop.create({
                name: 'Main Shop',
                address: { city: 'Default City' },
                contact: { email: 'shop@example.com' }
            });
            console.log('Default shop created');
        }

        const users = [
            {
                email: 'admin@example.com',
                password: 'password123',
                name: 'Grand Admin',
                role: 'grand_admin'
            },
            {
                email: 'staff@example.com',
                password: 'password123',
                name: 'Staff Member',
                role: 'staff',
                shopId: shop._id
            }
        ];

        for (const u of users) {
            const exists = await User.findOne({ email: u.email });
            if (exists) {
                console.log(`User ${u.email} already exists. Updating...`);
                exists.role = u.role as any;
                exists.password = u.password;
                exists.isActive = true; // Ensure they are active!
                if (u.shopId) exists.shopId = u.shopId;
                await exists.save();
            } else {


                await User.create(u);
                console.log(`User ${u.email} created`);
            }
        }

        console.log('Seeding completed');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedUsers();
