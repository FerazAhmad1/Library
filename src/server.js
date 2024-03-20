const express = require("express");

const { configDotenv } = require("dotenv");
configDotenv({
  path: `${__dirname}/../config.env`,
});
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const bodyParser = require("body-parser");
const cors = require("cors");

const userModel = require("../models/user.js");
const sequelize = require("../utils/database.js");
console.log(process.env.DB_NAME);
async function startServer() {
  const app = express();

  app.use(cors());
  app.use(bodyParser.json());
  const server = new ApolloServer({
    typeDefs: `type user {
        id:ID!,
        email:String!,
        name:String!
    }
    type Query {
        getUsers:[user]
    }
    type Mutation {
      addUser(name: String!, email: String!,password:String): user
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
          console.log(args);
          // await userModel.create()
          return;
        },
      },
    },
  });

  await server.start();
  await sequelize.sync({ force: true });
  app.use("/graphql", expressMiddleware(server));
  const port = 8000;
  app.listen(port, () => {
    console.log(`app is running on server ${8000}`);
  });
}

startServer();
