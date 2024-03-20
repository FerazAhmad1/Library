const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../utils/database.js");

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
    primaryKey: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = User;
