const Book = require("../models/book.js");
const Cart = require("../models/cart.js");
const CartItem = require("../models/cartItem.js");
const order = require("../models/order.js");
const { Op, where } = require("sequelize");
const sequelize = require("../utils/database.js");
const Order = require("../models/order.js");
const { promise } = require("bcrypt/promises.js");
const { addNewItem } = require("../utils/helper.js");
class orderservice {
  static async addToCart(id, quantity = 1, isBorrowed, duration, user) {
    try {
      if (isBorrowed && quantity > 1) {
        throw {
          message: "you can not borrow more than one same book",
        };
      }
      let cart;
      let existingbook;
      const available = await Book.findByPk(id);
      if (!available) {
        throw { message: "Book is not availble " };
      }
      const availableBook = available.dataValues;
      if (availableBook.quantity < quantity) {
        throw { message: `only ${availableBook.quantity} book remain` };
      }

      const carts = await user.getCarts({
        where: { order: false },
      });

      if (carts.length === 0) {
        cart = await user.createCart({
          order: false,
          userEmail: user.dataValues.email,
        });
        const response = await addNewItem(
          cartId,
          id,
          quantity,
          isBorrowed,
          duration
        );
      } else {
        cart = carts[0];
      }
      const cartId = cart.dataValues.id;
      const existingItem = await CartItem.findAll({
        where: { cartId, BookId: id, isBorrowed },
      });

      if (existingItem.length === 0) {
        const response = await addNewItem(
          cartId,
          id,
          quantity,
          isBorrowed,
          duration
        );

        const { title } = availableBook;
        return {
          success: true,
          error: null,
          cartItem: {
            id,
            quantity: 1,
            title,
          },
        };
      } else {
        throw {
          message: "this book is already in your cart",
        };
      }

      // let newQuantity = quantity;
      // console.log(existingbook, id);
      // if (existingbook.length === 0) {
      //   let book = existingbook[0];
      //   newQuantity = book.cartItem.dataValues.quantity * 1 + quantity * 1;
      // }

      // let { title } = availableBook;
      // console.log(
      //   "TTTTTTTTTTTTTTTTTTTTT",
      //   "GGGGGGGGGGGGGGGGGGGG",
      //   title,
      //   cart.addBook,
      //   duration
      // );

      // const response = await cart.addBook(available, {
      //   through: { quantity: newQuantity, isBorrowed, duration },
      // });
      // console.log(
      //   "<<<<<<<<<<<<<<<<<<<<<<<<",
      //   response,
      //   ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
      // );
      // return {
      //   success: true,
      //   cartItem: {
      //     id,
      //     quantity: newQuantity,
      //     title,
      //   },
      //   error: null,
      // };
    } catch (error) {
      console.log("CCCCCCCCCCCCCCCCCCCCC", error);
      throw error;
    }
  }

  static async updateCart(id, quantity, isBorrowed, duration, user) {
    try {
      console.log("AAAAAAAAAAAAAAAAAAAAAAA", user);
      const regex = /(\d+)(\D+)/;
      let buyType;
      const [_, BookId, borrow] = id.match(regex);

      if (borrow === "true") {
        buyType = true;
      } else {
        buyType = false;
      }
      const carts = await user.getCarts({ where: { order: false } });
      console.log("AAAAAAAAAAAAAAAAAAAAAAAAA", carts);
      if (carts.length === 0)
        throw { message: "you need add this product in cart first" };
      const cart = carts[0];
      const cartId = cart.dataValues.id;
      const whereClause = {
        where: { cartId, isBorrowed: buyType, BookId },
      };
      const cartItem = await CartItem.findAll(whereClause);
      if (cartItem.length === 0)
        throw { message: "This item does not belongs to cart" };
      if (isBorrowed !== null) {
        const response = await CartItem.update({ isBorrowed }, whereClause);
        if (response.length !== 0) {
          return {
            success: true,
            error: null,
          };
        } else {
          return {
            success: false,
            error: null,
          };
        }
      } else if (duration !== null) {
        const response = await CartItem.update(
          { duration: duration + "" },
          whereClause
        );
        if (response.length !== 0) {
          return {
            success: true,
            error: null,
          };
        } else {
          return {
            success: false,
            error: null,
          };
        }
        return response;
      } else if (quantity !== null && quantity <= 10) {
        const response = await CartItem.update({ quantity }, whereClause);
        if (response.length !== 0) {
          return {
            success: true,
            error: null,
          };
        } else {
          return {
            success: false,
            error: null,
          };
        }
      }
    } catch (error) {
      throw error;
    }
  }

  static async cart(user) {
    try {
      const carts = await user.getCarts({ where: { order: false } });
      if (carts.length === 0) {
        return {
          grandTotal: null,
          cartItem: [null],
        };
      }
      const cart = carts[0];
      const cartId = cart.dataValues.id;
      // Eager loading

      // const books = await Cart.findByPk(cartId, {
      //   include: [
      //     {
      //       model: Book,
      //       attributes: ["id", "title", "price"],
      //       through: { attributes: ["quantity", "duration", "isBorrowed"] },
      //       required: true,
      //     },
      //   ],
      // });
      // console.log("books", "books", books.dataValues.Books);

      // Lazy loading

      const cartItems = await CartItem.findAll({
        where: { cartId },
        attributes: ["id", "quantity", "duration", "isBorrowed", "BookId"],
      });

      const responseMaker = async (cartItems) => {
        let grandTotal = 0;
        const bookdata = await Promise.all(
          cartItems.map(async (data) => {
            let IdType;
            let total;
            const item = data.dataValues;
            console.log("ggggggggggggggggggggggggggggg", item);
            const { BookId: id, quantity, duration, isBorrowed } = item;
            const book = await Book.findByPk(id, {
              attributes: ["title", "author", "price"],
            });
            const {
              title = null,
              price = null,
              author = null,
            } = book.dataValues;
            if (isBorrowed) {
              total = quantity * 30 * duration;
              IdType = id + "true";
            } else {
              total = price * quantity;
              IdType = id + "false";
            }
            grandTotal += total;
            const result = {
              id: IdType,
              isBorrowed,
              quantity,
              duration,
              title,
              author,
              price,
              total,
            };

            return result;
          })
        );
        return { grandTotal, cartItem: bookdata };
      };
      const books = await responseMaker(cartItems);
      console.log("TTTTTTTTTTTTTTTTTTTTTTTTTTTTT", books);

      return books;
    } catch (error) {
      console.log(error);
    }
  }

  static async placeOrder(user) {
    try {
      const carts = await user.getCarts({ where: { order: false } });
      if (carts.length === 0) {
        throw { message: "user has not any cart" };
      }
      const cart = carts[0];
      console.log(
        "LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL",
        cart,
        carts
      );
      const cartItems = await cart.getBooks();
      let grandTotal = 0;
      console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh", user.setCarts);
      const Books = cartItems.map((el) => {
        console.log(el.dataValues.cartItem.dataValues);
        const total =
          el.dataValues.cartItem.dataValues.quantity * el.dataValues.price;
        grandTotal = grandTotal + total;
        return {
          id: el.dataValues.id,
          title: el.dataValues.title,
          price: el.dataValues.price,
          ...el.dataValues.cartItem.dataValues,
          total,
        };
      });

      console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh", Books);
      const cartId = cart.dataValues.id;
      console.log();
      const order = user.createOrder({
        id: cartId,
        orderDate: Date.now(),
        orderStatus: "pending",
      });
      const updatecart = await Cart.update(
        { order: true },
        {
          where: {
            id: cartId,
          },
        }
      );
      console.log("gggggggggggggggggggggggggggggggggggggggggggg", updatecart);
      // console.log("gggggggggggggggggggggggggggg", updateCartStatus);
      // const cartItem = await CartItem.findAll({
      //   where: { cartId },
      //   include: [{ model: Cart, include: [{ model: Book }] }],
      // });
      // console.log("/////////////////////", cartItem);
      // const existingbook = await cart.getBooks();
      // console.log("vvvvvvvvvvvvv", existingbook[0].cartItem);
    } catch (error) {
      console.log(
        "EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
        error.message
      );
    }
  }

  static async decreaseQuantity(id, qty, user) {
    let newQuantity;
    try {
      const carts = await user.getCarts({ where: { order: false } });
      const cart = carts[0];
      const book = await cart.getBooks({ where: { id } });
      // console.log(await cart.setBooks(book, { through: { quantity: 1 } }));
      if (book.length === 0) {
        throw { message: "this book does not prsent in your cart" };
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
      const carts = await user.getCarts({ where: { order: false } });
      const cart = carts[0];
      const book = await cart.getBooks({ where: { id } });
      if (book.length === 0) {
        throw {
          message: "this book does not belongs to your cart.First add to cart",
        };
      }
      let cartBook = book[0].dataValues.cartItem.dataValues;
      const { quantity, title } = cartBook;

      if (quantity >= 10) {
        throw { message: "you can not add more book" };
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
