const Book = require("../models/book.js");
const { Op } = require("sequelize");
class orderservice {
  static async addToCart(id, quantity, isBorrowed, duration, user) {
    try {
      let existingbook;
      const available = await Book.findByPk(id);
      if (!available) {
        throw "Book is not availble ";
      }
      const availableBook = available.dataValues;
      if (availableBook.quantity < quantity) {
        throw `only ${availableBook.quantity} book remain`;
      }
      const cart = await user.getCart();
      existingbook = await cart.getBooks({ where: { id } });
      let newQuantity = quantity;
      console.log(existingbook, id);
      if (existingbook.length !== 0) {
        let book = existingbook[0];
        newQuantity = book.cartItem.dataValues.quantity * 1 + quantity * 1;
      }

      let { title } = availableBook;

      const response = await cart.addBook(available, {
        through: { quantity: newQuantity, isBorrowed, duration },
      });

      return {
        success: true,
        cartItem: {
          id,
          quantity: newQuantity,
          title,
        },
        error: null,
      };
    } catch (error) {
      throw error;
    }
  }

  static async placeOrder(user) {
    const cart = await user.getCart();
    const existingbook = await cart.getBooks();
  }
}

module.exports = orderservice;
