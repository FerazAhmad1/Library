const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const UserBookItem = sequelize.define("userbookItem", {
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
  },
  isBorrowed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  dateOfIssue: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  expiryTime: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: Date.now() + 30 * 24 * 60 * 60 * 1000,
    validate: {
      isAfter: Date.now(),
      isWithin: [Date.now(), Date.now() + 3 * 30 * 24 * 60 * 60 * 1000],
    },
  },
});

// Hook to prevent updating dateOfIssue
UserBookItem.beforeUpdate((instance, options) => {
  if (instance.changed("dateOfIssue")) {
    throw new Error("Cannot update date of issue");
  }
});
