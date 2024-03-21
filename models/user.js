const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../utils/database.js");
const bcrypt = require("bcrypt");

const User = sequelize.define("user", {
  id: {
    type: DataTypes.INTEGER,
    unique: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    index: true,
    primaryKey: true,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "user",
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

User.addHook("beforeSave", "hashedpassword", async function (user, option) {
  if (user.changed("password")) {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    user.password = hashedPassword;
  }
  return;
});
module.exports = User;
