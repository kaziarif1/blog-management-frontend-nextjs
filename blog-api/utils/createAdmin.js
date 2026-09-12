/**
 * Promotes an existing user to admin, or creates a new admin user if the
 * email doesn't exist yet. Run with:
 *
 *   npm run create-admin -- admin@example.com password123 Admin User
 *
 * Satisfies the assignment requirement to "manually update role = admin"
 * without needing to touch MySQL directly.
 */
import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import { sequelize, User } from "../models/index.js";

const run = async () => {
    const [, , email, password, firstname = "Admin", lastname = "User"] = process.argv;

    if (!email || !password) {
        console.log("Usage: npm run create-admin -- <email> <password> [firstname] [lastname]");
        process.exit(1);
    }

    await sequelize.sync();

    let user = await User.findOne({ where: { email } });

    if (user) {
        user.role = "admin";
        user.isActive = true;
        await user.save();
        console.log(`Existing user ${email} has been promoted to admin.`);
    } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await User.create({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            role: "admin",
            isActive: true,
        });
        console.log(`New admin user created: ${email}`);
    }

    process.exit(0);
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
