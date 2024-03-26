const Book = require("../models/book.js");
const Cart = require("../models/cart.js");
const CartItem = require("../models/cartItem.js");
const { Op } = require("sequelize");
const sequelize = require("../utils/database.js");
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
    const cart = await user.getCart({
      include: [
        {
          model: Book,
          through: {
            attributes: ["quantity", "duration", "isBorrowed"], // Include the quantity from the join table
          },
          attributes: ["id", "title", "price"],
        },
      ],
    });
    const Books = cart.Books.map((el) => {
      console.log(el.dataValues.cartItem.dataValues);
      return {
        id: el.dataValues.id,
        title: el.dataValues.title,
        price: el.dataValues.price,
        ...el.dataValues.cartItem.dataValues,
        total: el.dataValues.cartItem.dataValues.quantity * el.dataValues.price,
      };
    });

    console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh", Books);
    const cartId = cart.dataValues.id;

    // const cartItem = await CartItem.findAll({
    //   where: { cartId },
    //   include: [{ model: Cart, include: [{ model: Book }] }],
    // });
    // console.log("/////////////////////", cartItem);
    const existingbook = await cart.getBooks();
    // console.log("vvvvvvvvvvvvv", existingbook[0].cartItem);
  }
}

module.exports = orderservice;
