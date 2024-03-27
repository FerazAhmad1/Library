const express = require("express");
const { configDotenv } = require("dotenv");
configDotenv({
  path: `${__dirname}/config.env`,
});
const userService = require("../services/user.js");
const bookservice = require("../services/book.js");
const orderservice = require("../services/order.js");
console.log(process.env.DIALECT, __dirname);
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
const Book = require("../models/book.js");
const Cart = require("../models/cart.js");
const CartItem = require("../models/cartItem.js");
const Order = require("../models/order.js");

const Userbook = require("../models/userbook.js");
const UserbookItem = require("../models/userBookItem.js");
const sequelize = require("../utils/database.js");

const { promisify } = require("util");

const { protector } = require("../utils/helper.js");

console.log(process.env.DB_NAME);
async function startServer() {
  const app = express();

  app.use(cors());
  app.use(bodyParser.json());

  const signInToken = (id, email) => {
    const token = jwt.sign({ id, email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    console.log(token);
    return token;
  };

  const server = new ApolloServer({
    typeDefs: `type user {
        id:ID!,
        email:String!,
        name:String!
    }
      type readUserResponse {
        success: Boolean! ,
        error: String,
        user:user
      }
    type addUserResponse {
      success: Boolean!
      token: String
      error: String
      user: user
    }
    type loginResponse{
      success: Boolean!
      token: String
      error: String
    }
    type Book {
      id:ID,
      title:String,
      quantity:Int
       error:String
    }
     type deleteresponse{
      success:Boolean!
      error:String
     }
    type searchBookresponse{
      available:Boolean!
      error:String
      Book:[Book]
    }
    type cartItem{
      id:ID
      quantity:Int
      title:String
    }
    type addToCartresponse {
      success:Boolean,
      error:String,
      cartItem:cartItem
    }
   type Query {
    getUsers:[user]
    readBook(id:ID!):Book
    readUser(email:String!):readUserResponse
    searchBook(id:ID,title:String,author:String): searchBookresponse
   }
    type Mutation {
      addUser(name: String!, email: String!,password:String!):addUserResponse
      loginHandler(email: String!,password:String):loginResponse
      createbook(title:String!, author:String!,quantity:Int,price:Int!):Book
      updateBook(id:ID!, title:String, author:String, quantity:Int ):Book
      deleteBook(id:ID!):deleteresponse
      updateUser(email:String!,name:String, password:String!):deleteresponse
      deleteUser(email:String!):deleteresponse
      addToCart(id:ID!,quantity:Int!,isBorrowed:Boolean!,duration:String!):addToCartresponse
      decreaseQuantity(id:ID!,quantity:Int!):Book
      increaseQuantity(id:ID!,quantity:Int!):Book
      placeOrder:addToCartresponse
    }
    `,
    resolvers: {
      Query: {
        getUsers: () => [
          { id: 1, email: "ferazkhan4@gmail.com", name: "Feraz" },
        ],
        readBook: async (parent, args) => {
          try {
            const { id } = args;
            const response = await bookservice.readBook();
          } catch (error) {
            return {
              id: null,
              title: null,
              author: null,
              error: error.message,
            };
          }
        },
        readUser: async (parent, args) => {
          try {
            const { email } = args;
            const response = await userService.readUser(email);
            return response;
          } catch (error) {
            return {
              success: false,
              error: error.message,
              user: null,
            };
          }
        },
        searchBook: async (parent, args, context) => {
          try {
            const authorize = await protector(context);
            if (!authorize.user) {
              throw {
                message: "you are not authorize to perform this action",
              };
            }
            console.log("ppppppppppppppppppppppp", args);

            const id = args.id;

            const title = args.title;

            const author = args.author;

            const response = await bookservice.searchBook(id, title, author);
            return response;
          } catch (error) {
            return {
              available: false,
              error: error.message,
              Book: [null],
            };
          }
        },
      },
      Mutation: {
        addUser: async (parent, args, context) => {
          try {
            console.log("hhhhhhhhhhhhhhh", context, args);
            const { name, email, password } = args;
            const response = await userService.addUser(name, email, password);
            const newCart = await response.createCart({ order: false });
            const data = response.dataValues;
            const { id } = data;
            const token = signInToken(id, email);
            return {
              success: true,
              token,
              error: null,
              user: data,
            };
          } catch (error) {
            console.log("gggggggggg", error);
            return {
              success: false,
              token: null,
              error: error.message,
              user: null,
            };
          }
        },
        loginHandler: async (parent, args) => {
          try {
            const { email, password } = args;
            const response = await userService.loginHandler(email, password);
            return response;
          } catch (error) {
            return {
              success: false,
              error: error.message,
              token: null,
            };
          }
        },
        updateUser: async (parent, args) => {
          try {
            const { email, name, password } = args;
            const response = await userService.updateUser(
              email,
              name,
              password
            );
            return response;
          } catch (error) {
            return {
              success: false,
              error: error.message,
            };
          }
        },
        deleteUser: async (parent, args) => {
          try {
            const { email } = { args };
            const response = await userService.deleteUser(email);
            return response;
          } catch (error) {
            return {
              success: false,
              error: error.message,
            };
          }
        },
        createbook: async (parent, args, context) => {
          try {
            const authorize = await protector(context);
            if (authorize.user && authorize.user.dataValues.role !== "admin") {
              throw "you are not authorize to perform this action";
            }
            const { title, author, quantity, price } = args;
            const response = await bookservice.createBook(
              title,
              author,
              quantity,
              price,
              authorize.user
            );
            return response;
          } catch (error) {
            return {
              id: null,
              title: null,
              author: null,
              error: error,
            };
          }
        },
        updateBook: async (parent, args) => {
          try {
            const { id, title, author, quantity } = args;
            const response = bookservice.updateBook(
              id,
              title,
              author,
              quantity
            );
            return response;
          } catch (error) {
            return {
              id: null,
              title: null,
              author: null,
              error: error.message,
            };
          }
        },

        deleteBook: async (parent, args) => {
          try {
            const { id } = args;
            const response = await bookservice.deleteBook(id);
            return response;
          } catch (error) {
            return {
              success: "false",
              error: error.message,
            };
          }
        },

        addToCart: async (parent, args, context) => {
          s;
          const { id, quantity, isBorrowed, duration } = args;
          try {
            const authorize = await protector(context);
            console.log(
              "hhhhhoooooooooooooooooooooohhhhh",
              authorize.user.getCart
            );

            const response = await orderservice.addToCart(
              id,
              quantity,
              isBorrowed,
              duration,
              authorize.user
            );
            return response;
          } catch (error) {
            return {
              succees: false,
              cartItem: null,
              error: error,
            };
          }
        },
        placeOrder: async (_, __, context) => {
          try {
            const authorize = await protector(context);
            orderservice.placeOrder(authorize.user);
          } catch (error) {}
        },

        decreaseQuantity: async (parent, args, context) => {
          const { id, quantity } = args;
          try {
            const authorize = await protector(context);

            const response = await orderservice.decreaseQuantity(
              id,
              quantity,
              authorize.user
            );
          } catch (error) {
            return {
              id,
              quantity,
              title: null,
              error: error,
            };
          }
        },
        increaseQuantity: async (parent, args, context) => {
          const { id, quantity } = args;
          try {
            const authorize = await protector(context);
            const response = await orderservice.increaseQuantity(
              id,
              quantity,
              authorize.user
            );
          } catch (error) {
            return {
              error: error,
              id,
              title: null,
              quantity: null,
            };
          }
        },
      },
    },
  });

  await server.start();
  Book.belongsTo(User, {
    constraints: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  User.hasMany(Book);
  Book.belongsTo(User);
  User.hasOne(Cart);
  Cart.belongsTo(User);
  Book.belongsToMany(Cart, { through: CartItem });
  Cart.belongsToMany(Book, { through: CartItem });
  User.hasOne(Order);
  Order.belongsTo(User);
  User.hasOne(Userbook);
  Userbook.belongsTo(User);
  Book.belongsToMany(Userbook, { through: UserbookItem });
  Userbook.belongsToMany(Book, { through: UserbookItem });

  await sequelize.sync();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        if (req.headers.authorization) {
          const token = req.headers.authorization.split(" ")[1];

          return { token };
        }
        return {};
      },
    })
  );
  const port = 8000;
  app.listen(port, () => {
    console.log(`app is running on server ${8000}`);
  });
}

startServer();
