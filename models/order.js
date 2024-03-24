const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../utils/database.js");

const Order = sequelize.define("order", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    primaryKey: true,
  },
});

module.exports = Order;
