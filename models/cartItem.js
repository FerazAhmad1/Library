const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const CartItem = sequelize.define("cartItem", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notGreaterThanTen(value) {
        if (value > 10) {
          console.log("ffffffffffffffffffffffffffffffffffffffff", value);
          throw new Error("Quantity cannot be greater than 10");
        }
      },
    },
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isValidDuration(value) {
        if (this.isBorrowed) {
          if (!(parseInt(value) >= 1 && parseInt(value) <= 3)) {
            throw new Error(
              "Duration must be between 1 and 3 months when isBorrowed is true"
            );
          }
        } else {
          if (value !== "LIFETIME") {
            throw new Error(
              "Duration must be 'LIFETIME' when isBorrowed is false"
            );
          }
        }
      },
    },
  },
  isBorrowed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

module.exports = CartItem;
