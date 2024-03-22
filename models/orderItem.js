const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const OrderItem = sequelize.define("orderItem", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
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
    defaultValue: null, // Default to null until item is shipped
    validate: {
      isShippedDateValid(value) {
        if (value && value < this.orderDate.getTime()) {
          throw new Error("Shipped date cannot be earlier than order date");
        }
      },
    },
  },
});

module.exports = OrderItem;
