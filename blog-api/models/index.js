import sequelize from "../config/db.js";
import User from "./user.model.js";
import Blog from "./blog.model.js";

// A User can have many Blogs. A Blog belongs to exactly one User (the author).
User.hasMany(Blog, {
    foreignKey: "userId",
    onDelete: "CASCADE",
});
Blog.belongsTo(User, {
    foreignKey: "userId",
    as: "author",
});

export { sequelize, User, Blog };
