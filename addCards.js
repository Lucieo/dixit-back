const testFolder = './images/';
const fs = require('fs');
const Card = require('./models/card');

const addCards = function(){
    fs.readdir(testFolder, (err, files) => {
        const cards = files
        .filter(file=>(file.indexOf('.jpg')>-1 || file.indexOf('.jpeg')>-1))
        .map(file =>{
                return {fileName: file}
        });
        console.log(cards)
        Card.insertMany(cards)
      });
} 

module.exports = addCards;