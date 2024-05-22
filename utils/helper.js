const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const CartItem = require("../models/cartItem.js");
const Book = require("../models/book.js");
exports.protector = async ({ token }) => {
  try {
    if (!token) {
      throw {
        message: "Please send token",
      };
    }
    let decoded;
    try {
      decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      console.log("Ffffffffff", decoded);
    } catch (error) {
      throw {
        message: "UnAthurorized user",
      };
    }

    const user = await User.findByPk(decoded.email);

    if (!user) {
      throw {
        message: "The user belongs to this token does not exist",
      };
    }

    return { user };
  } catch (error) {
    throw error;
  }
};

exports.addNewItem = async (cartId, BookId, quantity, isBorrowed, duration) => {
  try {
    const books = await Book.findAll({ where: { id: 1 } });
    const stringbooks = await Book.findAll({ where: { id: "1" } });
    console.log("number", books, stringbooks, "string");
    const response = await CartItem.create({
      cartId,
      BookId,
      quantity,
      isBorrowed,
      duration,
    });
    return response;
  } catch (error) {
    throw error;
  }
};
