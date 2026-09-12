import app from "./app.js";
import sequelize from "./config/db.js";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5000;

try {
    await sequelize.authenticate();
    // Creates the "users" and "blogs" tables in blogdb if they don't exist yet.
    await sequelize.sync();
    console.log("MySQL connection established and models synchronized.");
} catch (error) {
    console.log("Unable to connect to the database:", error);
    process.exit(1);
}

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
