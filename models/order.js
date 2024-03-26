const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../utils/database.js");

const Order = sequelize.define("order", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    primaryKey: true,
    index: true,
  },
  orderDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  orderStatus: {
    type: DataTypes.ENUM("pending", "processing", "shipped"),
    allowNull: false,
    defaultValue: "pending",
  },
  shippedDate: {
    type: DataTypes.BIGINT,
    allowNull: true,
    defaultValue: null,
    validate: {
      isShippedDateValid(value) {
        if (value && value < this.orderDate.getTime()) {
          throw new Error("Shipped date cannot be earlier than order date");
        }
      },
    },
  },
});

module.exports = Order;
