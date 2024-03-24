const Book = require("../models/book.js");
const { Op } = require("sequelize");
class orderservice {
  static async addToCart(id, quantity, isBorrowed, duration, user) {
    try {
      const cart = await user.getCart();
      const existingbook = await cart.getBooks({ where: { id } });
      if (existingbook.length == 0) {
        throw `throw Book is not availble `;
      }
      let book = existingbook[0];
      let availableQuantity = book.dataValues.quantity;
      if (availableQuantity < quantity) {
        throw `only ${availableQuantity} is availbale   `;
      }
      let { title } = book.dataValues;
      quantity = book.cartItem.dataValues.quantity * 1 + quantity * 1;
      const response = await cart.addBook(book, {
        through: { quantity: quantity, isBorrowed, duration },
      });

      return {
        success: true,
        cartItem: {
          id,
          quantity,
          title,
        },
        error: null,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = orderservice;
