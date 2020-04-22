const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// const { pubsub } = require('../schema');
const pubsub = require("../schema/pubsub");
const _ = require("lodash");
const debug = require("debug")("esquisse:game");

const gameSchema = new Schema({
    players: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    creator: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    status: {
        type: String,
        default: "new",
    },
    turn: {
        type: String,
        default: 0,
    },
    turnVotes: [
        {
            type: Schema.Types.ObjectId,
            ref: "Action",
        },
    ],
    turnDeck: [
        {
            type: Schema.Types.ObjectId,
            ref: "Action",
        },
    ],
    currentWord: {
        type: String,
    },
    distributedCards: [
        {
            type: Schema.Types.ObjectId,
            ref: "Card",
        },
    ],
    decks: [
        {
            type: Schema.Types.ObjectId,
            ref: "Deck",
        },
    ],
    gamePoints: {
        type: Array,
    },
    turnPoints: {
        type: Array,
    },
    // createdAt: {
    //     type: Date,
    //     expires: 150000,
    //     default: Date.now
    // }
});

//

gameSchema.statics.evaluateTurn = async function (gameId, turnMaster) {
    const game = await this.findById(gameId)
        .populate({
            path: "turnDeck",
            populate: {
                path: "card",
            },
        })
        .populate({
            path: "turnVotes",
            populate: {
                path: "card",
            },
        });

    const points = game.players.map((player) => ({ player, points: 0 }));
    const masterCardId = game.turnDeck.find(
        (card) => card.owner.toString() === turnMaster
    );
    const votesForMaster = game.turnVotes
        .filter((vote) => vote.card.id === masterCardId)
        .map((el) => el.owner);
    const hasMasterWon =
        votesForMaster > 0 && votesForMaster < game.players.length - 1;

    if (hasMasterWon) {
        votesForMaster.push(turnMaster);
        points.forEach((el, idx) => {
            if (votesForMaster.indexOf(el.player.toString()) > -1) {
                points[idx] = { ...el, points: el.points + 3 };
            }
        });
    } else {
        points.forEach((el, idx) => {
            if (el.player.toString() !== turnMaster) {
                points[idx] = { ...el, points: el.points + 2 };
            }
        });
    }

    console.log("hasMasterWon", hasMasterWon);
    console.log(points);

    const otherPlayers = game.players.filter(
        (player) => player.toString() !== turnMaster
    );
    console.log("OtherPlayers ", otherPlayers);
    otherPlayers.forEach((player) => {
        const playerCardId = game.turnDeck.find(
            (card) => card.owner.toString() === player.toString()
        ).card.id;
        const votesReceived = game.turnVotes.filter(
            (vote) => vote.card.id === playerCardId
        );
        const pointsId = points.findIndex((el) => el.player === player);
        const pointsObj = points[pointsId];
        points[pointsId] = {
            ...pointsObj,
            points: pointsObj.points + votesReceived.length,
        };
    });
    console.log("FINAL POINTS", points);
    game.turnPoints = points;
    game.gamePoints = points.map((el, idx) => {
        let points;
        if (game.gamePoints[idx]) {
            points = el.points + game.gamePoints[idx].points;
        } else {
            points = el.points;
        }
        return { ...el, points };
    });
    game.save();
    return game;
};

module.exports = mongoose.model("Game", gameSchema);
