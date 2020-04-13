const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deckSchema = new Schema({
    gameId:{
        type: Schema.Types.ObjectId,
        ref: 'Game'
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    cards:[{
        type: Schema.Types.ObjectId,
        ref: 'Card'
    }],
    createdAt: { 
        type: Date, 
        expires: 1000,
        default: Date.now
    }
})


module.exports = mongoose.model('Deck', deckSchema)
