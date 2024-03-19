const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const bodyParser = require("body-parser");
const cors = require("cors");

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
    `,
    resolvers: {
      Query: {
        getUsers: () => [{ user }],
      },
    },
  });

  await server.start();
  app.use("/graphql", expressMiddleware(server));
  const port = 8000;
  app.listen(port, () => {
    console.log(`app is running on server ${8000}`);
  });
}

startServer();
