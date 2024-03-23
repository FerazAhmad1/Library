const Book = require("../models/book.js");
const { Op } = require("sequelize");
class orderservice {
  static async addToCart(id, quantity, isBorrowed, duration, user) {
    try {
      const available = await Book.findByPk(id);
      if (!available) {
        throw "Book is not availble ";
      }
      const book = available.dataValues;
      if (book.quantity < quantity) {
        throw `only ${book.quantity} book remain`;
      }
      const cart = await user.getCart();
      const existingbook = await cart.getBooks({ where: { id } });
      console.log(
        "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
        existingbook[0].dataValues.cartItem
      );
      if (existingbook.length !== 0) {
        quantity =
          existingbook[0].dataValues.cartItem.dataValues.quantity * 1 +
          quantity * 1;
      }
      const response = await cart.addBook(available, {
        through: { quantity: quantity, isBorrowed, duration },
      });
      console.log("RRRRRRRRRRRRRRRRRRRRRRRRRRR", response);
      const data = response.map((Item) => Item.dataValues);

      return {
        success: true,
        cartItem: data,
        error: null,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = orderservice;
