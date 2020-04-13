const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const actionSchema = new Schema({
    gameId:{
        type: Schema.Types.ObjectId,
        ref: 'Game'
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    actionType: {
        type: String
    },
    cardId:{
        type: Schema.Types.ObjectId,
        ref: 'Card'
    }
})


module.exports = mongoose.model('Action', actionSchema)
