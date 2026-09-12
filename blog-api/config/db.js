import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// Central Sequelize instance connected to MySQL. All models import this
// same instance so they share one connection pool to the "blogdb" database.
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "mysql",
        logging: false,
        define: {
            // Custom "createAt" / "updateAt" column names (no underscore)
            // to match the assignment's required schema exactly.
            timestamps: true,
            createdAt: "createAt",
            updatedAt: "updateAt",
        },
    }
);

export default sequelize;
