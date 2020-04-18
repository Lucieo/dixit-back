const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const { pubsub } = require('../schema');
const pubsub = require('../schema/pubsub')
const _ = require('lodash');
const debug = require('debug')('esquisse:game');

const gameSchema = new Schema({
    players: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        default: "new"
    },
    turn:{
        type: String,
        default:0
    },
    turnVotes:[{
        type: Schema.Types.ObjectId,
        ref: 'Action',
    }],
    turnDeck:[{
        type: Schema.Types.ObjectId,
        ref: 'Action',
    }],
    currentWord:{
        type: String
    }
    ,
    distributedCards:[{
        type: Schema.Types.ObjectId,
        ref: 'Card'
    }],
    decks:[{
        type: Schema.Types.ObjectId,
        ref: 'Deck'
    }],
    points:{
        type: Array
    }
    // createdAt: { 
    //     type: Date, 
    //     expires: 150000,
    //     default: Date.now 
    // }
})

// 

gameSchema.statics.evaluateTurn = async function(gameId, turnMaster){
    const game = await this.findById(gameId)
    .populate({
        path:'turnDeck',
        populate:{
          path: "card"
        }
    })
    .populate({
        path:'turnVotes',
        populate:{
          path: "card"
        }
      });
    
    const points = []
    game.players.forEach(player=>{
        const playerCardId = game.turnDeck.find(card=>card.owner.toString()===player.toString()).card.id;
        const votesReceived = game.turnVotes.filter(vote=>vote.card.id===playerCardId)
        if(player.toString()!==turnMaster){
            //Regular Player
            points.push({player: player, points: votesReceived.length})
        }
        else{
            //TurnMaster
            if(votesReceived===0 || votesReceived===game.players.length-1){
                points.forEach((pointRegistry, index)=>{
                    if(pointRegistry.player.toString()!==turnMaster){
                        points[index] = {...pointRegistry, points: pointRegistry.points+2}
                    }
                })
            }
            else{
                points.forEach((pointRegistry, index)=>{
                    points[index] = {...pointRegistry, points: pointRegistry.points+3}
                })
            }
        }
    })



    console.log(points)
}

module.exports = mongoose.model('Game', gameSchema)


// gameSchema.methods.currentTurnIsOver = function() {
    //     const turnCount = (+this.turn)+1;
    //     return this.sketchbooks.every(
    //         sketchbook => sketchbook.pages.length >= turnCount
    //     );
    // }
    
    // gameSchema.methods.isOver = function() {
    //    return this.status === 'over' || +this.turn >= this.players.length
    // }
    
    // const cacheKeyResolver = ({ _id, turn }) => `${_id}-${turn}`;
    // const memoizedPublishTimeToSubmit = _.memoize(({ _id, turn }) => {
    //     return new Promise((resolve) => {
    //         //Odd means drawing mode - Even means guessing mode
    //         const delay = (turn%2==0) ? 60000 : 90000
    //         console.log("DELAY", delay) 
    //         setTimeout(() => {
    //             pubsub.publish("TIME_TO_SUBMIT", {
    //                 timeToSubmit: {
    //                     id: _id.toString(),
    //                     turn: parseInt(turn, 10) - 1
    //                 }
    //             });
    //             debug("LOOPING FROM SUBMITQUEUE!")
    //             memoizedPublishTimeToSubmit.cache.delete(cacheKeyResolver({ _id, turn }));
    //             resolve();
    //         }, delay);
    //     })
    // }, cacheKeyResolver)
    // gameSchema.statics.publishTimeToSubmit = memoizedPublishTimeToSubmit;
    
    // gameSchema.statics.checkCompletedTurn = async function (gameId) {
    //     const game = await this.findById(gameId)
    //         .populate('sketchbooks')
    //         .populate('players')
    
    //     if(game.currentTurnIsOver()) {
    //       debug('ALL RESPONSES RECEIVED CALLED FROM GAME STATIC METHOD')
    //       game.turn=(+game.turn+1)
    //       if(game.isOver()){
    //         game.status="over";
    //       }
    //       await game.save()
    //       pubsub.publish("GAME_UPDATE", { gameUpdate: game});
    //       debug('ALL RESPONSES RECEIVED DONE')
    //       this.publishTimeToSubmit(game);
    //     }
    // }
