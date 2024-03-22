const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../utils/database.js");

const UserBook = sequelize.define("userbook", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    unique: true,
    primaryKey: true,
  },
});

module.exports = UserBook;
