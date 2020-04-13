const {gql} = require('apollo-server-express');

const typeDefs = gql`
type User {
    id: ID
    name: String
    email: String
    icon: String
}
type LoginResponse {
    token: String
    user: User
}
type Deck{
    gameId: ID
    owner: User
    cards: [Card]
}
type Card{
    id: ID
    fileName: String
}
type Game{
    id: ID
    status: String
    creator: ID
    players: [User]
    turn: Int
    decks: [ID]
}
type CreatedGame{
    id:ID
}
type PlayerModifyResponse{
    players: [User],
    gameId: ID,
    creator: ID
}
type submitCardResponse{
    status: String
    gameId: ID
    actionType: String
}
type Query {
    currentUser: User!,
    getGameInfo(gameId: ID): Game!
    getDeck(gameId: ID): Deck!
}
type Mutation {
    signup(name: String!, email: String!, password: String!): User!
    login(email: String!, password: String!): LoginResponse!
    modifyUser(name: String!, icon: String!): User!
    createGame: CreatedGame
    joinGame(gameId: ID!): Game
    leaveGame(gameId: ID!): Game
    changeGameStatus(gameId: ID!, newStatus: String!): Game
    selectCard(gameId:ID!, cardId:ID!, actionType: String!): submitCardResponse
}
type Subscription {
    playerUpdate(gameId: ID!): PlayerModifyResponse
    gameUpdate(gameId: ID!): Game
}
`;


module.exports = typeDefs;
