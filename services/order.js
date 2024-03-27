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

  static async decreaseQuantity(id, qty, user) {
    let newQuantity;
    try {
      const cart = await user.getCart();
      const book = await cart.getBooks({ where: { id } });
      // console.log(await cart.setBooks(book, { through: { quantity: 1 } }));
      if (book.length === 0) {
        throw "this book does not prsent in your cart";
      }
      let cartBook = book[0].dataValues.cartItem.dataValues;
      const { quantity, title } = cartBook;

      if (qty >= quantity) {
        newQuantity = 0;
      } else {
        newQuantity = quantity - qty;
      }
      const response = await cart.setBooks(book, {
        through: { quantity: newQuantity },
      });

      return {
        id,
        title,
        quantity: newQuantity,
        error: null,
      };
    } catch (error) {
      throw error;
    }
  }

  static async increaseQuantity(id, qty, user) {
    let newQuantity;
    try {
      const cart = await user.getCart();
      const book = await cart.getBooks({ where: { id } });
      if (book.length === 0) {
        throw "this book does not belongs to your cart.First add to cart";
      }
      let cartBook = book[0].dataValues.cartItem.dataValues;
      const { quantity, title } = cartBook;

      if (quantity >= 10) {
        throw "you can not add more book";
      }
      if (quantity + qty >= 10) {
        newQuantity = 10;
      } else {
        newQuantity = quantity + qty;
      }
      await cart.setBooks(book, { through: { quantity } });
      return {
        id,
        title,
        quantity: newQuantity,
        error: null,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = orderservice;
