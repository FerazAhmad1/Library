const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../utils/database.js");

const Cart = sequelize.define("cart", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    unique: true,
    primaryKey: true,
  },
  order: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = Cart;
