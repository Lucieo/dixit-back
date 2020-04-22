const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const { User } = require("./models");
const path = require("path");
const { typeDefs, resolvers } = require("./schema");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { json } = require("express");
const debug = require("debug")("dixit:server");
const addCards = require("./addCards");

const app = express();

app.use("/images", express.static(path.join(__dirname, "images")));

app.use(json({ limit: "2mb" }));
const { MONGO_URI } = process.env;
debug(MONGO_URI);

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    next();
});

const getUser = async (token) => {
    try {
        if (token) {
            const id = jwt.verify(
                token.split(" ")[1],
                process.env.SESSION_SECRET
            ).id;
            const user = await User.findById(id);
            return user;
        }
        return null;
    } catch (err) {
        return null;
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req, connection }) => {
        if (connection) {
            return connection.context;
        } else {
            const token = req.headers.authorization || "";
            const user = await getUser(token);
            return {
                user,
            };
        }
    },
    playground: {
        settings: {
            "request.credentials": "same-origin",
        },
    },
    introspection: true,
});

module.exports = {
    getUser,
};

//addCards()

if (require.main === module) {
    const http = require("http");
    server.applyMiddleware({ app });
    const httpServer = http.createServer(app);
    server.installSubscriptionHandlers(httpServer);
    console.log(MONGO_URI);
    mongoose.connect(MONGO_URI).then((result) => {
        httpServer.listen({ port: process.env.PORT || 4000 }, () =>
            debug(`🚀 Server ready`)
        );
    });
}
