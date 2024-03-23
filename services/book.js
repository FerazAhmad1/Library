const Book = require("../models/book.js");
const { Op } = require("sequelize");
class bookservice {
  static async searchBook(id, title, author) {
    try {
      let whereClause = {};

      if (id) {
        whereClause.id = id;
      }
      if (title) {
        whereClause.title = { [Op.like]: `%${title}%` };
      }
      if (author) {
        whereClause.author = { [Op.like]: `%${author}%` };
      }

      console.log("wwwwwwwwwwwwwwwwwwwwwwwww", whereClause);
      const book = await Book.findAll({ where: whereClause });
      const books = book.map((data) => data.dataValues);

      console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", books);
      if (books.length === 0) {
        return {
          available: false,
          error: "we do not have this book",
          books: [],
        };
      }

      return {
        available: true,
        error: null,
        Book: books,
      };
    } catch (error) {
      throw error;
    }
  }

  static async readBook(id) {
    try {
      const book = await Book.findByPk(id);
      if (!book) {
        return {
          available: false,
          error: "Book not found",
          book: null,
        };
      }
      return {
        available: true,
        error: null,
        book,
      };
    } catch (error) {
      console.error("Error reading book:", error);
      throw new Error("Error reading book");
    }
  }

  static async createBook(title, author, quantity, price, admin) {
    try {
      const newBook = await admin.createBook({
        title,
        author,
        quantity,
        price,
      });
      console.log("NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN", newBook);
      return newBook;
    } catch (error) {
      console.error("Error creating book:", error);
      throw new Error("Error creating book");
    }
  }

  static async deleteBook(id) {
    try {
      const book = await Book.findByPk(id);
      if (!book) {
        return {
          success: false,
          error: "Book not found",
        };
      }
      await book.destroy();
      return {
        success: true,
        error: null,
      };
    } catch (error) {
      console.error("Error deleting book:", error);
      throw new Error("Error deleting book");
    }
  }

  static async updateBook({ id, title, author, quantityToAdd }) {
    try {
      const book = await Book.findByPk(id);
      if (!book) {
        return {
          success: false,
          error: "Book not found",
        };
      }
      const currentQuantity = book.quantity || 0;
      const newQuantity = currentQuantity + quantityToAdd;
      const updatedBook = await book.update({
        title,
        author,
        quantity: newQuantity,
      });

      return {
        success: true,
        error: null,
      };
    } catch (error) {
      console.error("Error updating book:", error);
      throw new Error("Error updating book");
    }
  }
}

module.exports = bookservice;
