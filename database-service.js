const MongoClient = require('mongodb');

class GameInfo {
    constructor ( 
    gameName, 
    price, 
    maxBalls, 
    maxSelectedCheckbox,
    status = true,
    everyInMs = 86400000, 
    nextGameDate = false, 
    lastWiningNumbers = false, 
    bougthTicketsCount = 0, 
    gamesCount = 0, 
    nextGameAddressRef = '', 
    nextGameAddressId = '', 
    nextGameAddressDb = '',
    _id = new MongoClient.ObjectID()
    ) {
        this._id = _id;
        this.gameName = gameName;
        this.price = price;
        this.status = status;
        this.everyInMs = everyInMs;
        this.maxBalls = maxBalls;
        this.maxSelectedCheckbox = maxSelectedCheckbox;
        this.nextGameDate = nextGameDate;
        this.lastWiningNumbers = lastWiningNumbers;
        this.bougthTicketsCount = bougthTicketsCount;
        this.gamesCount = gamesCount;
        this.nextGameAddress = {
            $ref: nextGameAddressRef,
            $id: nextGameAddressId,
            $db: nextGameAddressDb
        }
    }
}

class GameRound {
    constructor( roundId, date, gameInfoAddressRef, gameInfoAddressId, gameInfoAddressDb, winNumbers = false, tickets = [], _id = new MongoClient.ObjectID()) {
        this._id = _id
        this.roundId = roundId,
        this.date = date,
        this.winNumbers = winNumbers,
        this.tickets = tickets,
        this.gameInfoAddress = {
            $ref: gameInfoAddressRef,
            $id: gameInfoAddressId,
            $db: gameInfoAddressDb
        }
    }
}

class User {
    constructor(userEmail, userPassword, _id = new MongoClient.ObjectID()) {
        this._id = _id,
        this.userEmail = userEmail,
        this.userPassword = userPassword
    }
}

function addNewData(uri ,dataBase, collect, info) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(uri, (err, client) => {
            if(err) {
                reject(console.log(err));
            }
            const collection = client.db(dataBase).collection(collect);
            resolve(collection.insert(info));
            client.close();
        });
    });
}

function addNewRound (uri ,dataBase, collect, roundInfo) {
    return addNewData(uri, dataBase, collect, roundInfo);
}

function addNewUser(uri ,dataBase, collect, userInfo) {
    return addNewData(uri, dataBase, collect, userInfo);
}

function addNewGameInfo(uri ,dataBase, collect, gameInfo) {
    return addNewData(uri, dataBase, collect, gameInfo);
}

function updateData(uri ,dataBase, collect, searchOptions, info) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(uri, (err, client) => {
            if(err) {
                reject(console.log(err));
            }
            const collection = client.db(dataBase).collection(collect);
            resolve(collection.update(searchOptions, info));
            client.close();
        });        
    });

}

function addNewTickets(uri ,dataBase, collect, searchOptions, info) {
    MongoClient.connect(uri, (err, client) => {
        if(err) {
            return console.log(err);
        }
        const collection = client.db(dataBase).collection(collect);
        const res = collection.update(searchOptions, {$push: { tickets:{ $each: info }}});
        client.close();
        return res;
    });
}

function getInfo (uri ,dataBase, collect, searchOptions = {}) {
    return MongoClient.connect(uri).then(client => {
        const collection = client.db(dataBase).collection(collect);
        const res = collection.find(searchOptions).toArray().then();
        client.close();
        return res;
    });    
}

function getGameInfo (uri ,dataBase, collect, searchOptions = {}) {
    return getInfo(uri ,dataBase, collect, searchOptions)  
}

function getRoundInfo (uri ,dataBase, collect, searchOptions = {}) {
    return getInfo(uri ,dataBase, collect, searchOptions)  
}

function getUsersInfo (uri ,dataBase, collect, searchOptions = {}) {
    return getInfo(uri ,dataBase, collect, searchOptions)    
}

function removeData(uri ,dataBase, collect, searchOptions = {}) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(uri, (err, client) => {
            if(err) {
                reject(console.log(err));
            }
            const collection = client.db(dataBase).collection(collect);
            resolve(collection.remove(searchOptions));
            client.close();
        });
    });
}

module.exports = {
    GameInfo: GameInfo,
    GameRound: GameRound,
    User: User,
    getInfo: getInfo,
    getGameInfo: getGameInfo,
    getRoundInfo: getRoundInfo,
    getUsersInfo: getUsersInfo,
    addNewGameInfo: addNewGameInfo,
    addNewData: addNewData,
    addNewRound: addNewRound,
    addNewTickets: addNewTickets,
    addNewUser: addNewUser,
    updateData: updateData,
    removeData: removeData
}