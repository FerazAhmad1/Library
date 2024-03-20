const express = require("express");
const { configDotenv } = require("dotenv");
configDotenv({
  path: `${__dirname}/config.env`,
});
const userService = require("../services/user.js");

console.log(process.env.DIALECT, __dirname);
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.js");
const sequelize = require("../utils/database.js");
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
    type Query {
        getUsers:[user]
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
    type Mutation {
      addUser(name: String!, email: String!,password:String):addUserResponse
      loginHandler(email: String!,password:String):loginResponse
    }
    `,
    resolvers: {
      Query: {
        getUsers: () => [
          { id: 1, email: "ferazkhan4@gmail.com", name: "Feraz" },
        ],
      },
      Mutation: {
        addUser: async (parent, args) => {
          try {
            const { name, email, password } = args;
            const response = await userService.addUser(name, email, password);
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
      },
    },
  });

  await server.start();
  await sequelize.sync();
  app.use("/graphql", expressMiddleware(server));
  const port = 8000;
  app.listen(port, () => {
    console.log(`app is running on server ${8000}`);
  });
}

startServer();
