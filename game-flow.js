const dbService = require('./database-service');
const alarm = require('alarm');
const mailer = require('./mailer');

class GameFlow {
    constructor( uri, db = 'lottery-db', lott = 'lott-', lotteriesInfo = 'lotterries-info', users = 'users') {
        this.uri = uri,
        this.db = db,
        this.lott  = lott,
        this.lotteriesInfo = lotteriesInfo,
        this.users = users
    }

    gameInit() {
        let currentDate = new Date();
        console.log(currentDate);
        dbService.getGameInfo(this.uri, this.db, this.lotteriesInfo).then(res => {
            res.forEach(element => {
            if(element.nextGameDate != false && element.status) {
                console.log('setRound');
                this._setRoundAlarm(element);
            }
            else if (!element.nextGameDate && element.status) {
                console.log('setNewRound');
                this._setNewRound(element, currentDate);
            }
            });
        });
    }

    _setRoundAlarm(gameInfo) {
        console.log("Setting alarm for " + gameInfo.gameName);
        alarm(new Date(gameInfo.nextGameDate), (_ => this._endRound(gameInfo)));
    }

    _endRound(gameInfo) {
        console.log("End round for " + gameInfo.gameName);
        const winNumbers = this._getWinNumbers(gameInfo.maxSelectedCheckbox, gameInfo.maxBalls);
        dbService.updateData(this.uri, this.db, this.lott + gameInfo.gameName, {_id: gameInfo.nextGameAddress.oid }, {$set: {winNumbers: winNumbers}}).then(updRes => {
            dbService.updateData(this.uri, this.db, this.lotteriesInfo, {_id: gameInfo._id}, {$set : {lastWiningNumbers: winNumbers }}).then(updRes => {
                this._setNewRound(gameInfo, new Date());
                this._checkWins(winNumbers, gameInfo.nextGameAddress.oid);
            });
        });
    }

    _getWinNumbers(size, max) {
        let result = [];
        let number;
        while (result.length < size) {
            number = this._getRandomInt(0, max);
            result.includes(number) ? number = 0 : result.push(number);
        }
        return result.sort((a, b) => a-b);
    }

    _getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    }

    _setNewRound(gameInfo, date) {
        const normDate = this._normalizeDate(new Date(+date + gameInfo.everyInMs));
        dbService.addNewRound(this.uri, this.db, this.lott + gameInfo.gameName, new dbService.GameRound(
            gameInfo.gamesCount, 
            normDate,
            this.lotteriesInfo,
            gameInfo._id,
            this.db
        )).then(res => {
                dbService.getRoundInfo(this.uri, this.db, this.lott + gameInfo.gameName, {
                roundId: gameInfo.gamesCount,
                'gameInfoAddress.$id': gameInfo._id
            }).then(res => res.map( res => {
                dbService.updateData(this.uri, this.db, this.lotteriesInfo, {_id: gameInfo._id}, {
                    $set: {
                        nextGameDate: res.date,
                        gamesCount: gameInfo.gamesCount + 1,
                        'nextGameAddress.$ref': this.lott + gameInfo.gameName,
                        'nextGameAddress.$id': res._id,
                        'nextGameAddress.$db': this.db
                    }
                }).then(updRes => {
                    dbService.getGameInfo(this.uri, this.db, this.lotteriesInfo, {_id: gameInfo._id}).then(x => {
                        x.forEach(element => this._setRoundAlarm(element));
                    });
                });
            }));
        });
    }

    _normalizeDate (date) {
        date.setSeconds(0, 0);
        return date;
    }

    _checkWins (winNumbers, roundId, gameName) {
        console.log('checkWins');
        dbService.getRoundInfo(this.uri, this.db, this.lott + gameName, { _id: roundId}).then(res => res.forEach(element => {
            if( element.tickets.length != 0 ) {
                element.tickets.forEach(ticket => {
                    let count = 0;
                    winNumbers.forEach(number => {
                        ticket.numbers.includes(number) ? count = count : count++ ;
                    });
                    if (count != 0) {
                        this._notifyUser(gameName, ticket.userId, winNumbers, ticket.numbers);
                    }
                });                
            }
        }));
    }

    _notifyUser(gameName, userId, winNumbers, userNumbers) {
        dbService.getUsersInfo(this.uri, this.db, this.users, {_id: userId}).then(res => res.forEach(user => {
            const textToSend = 'Confgatulation!\nYou win in ' + gameName + ' !\nWinning numbers: ' + 
            winNumbers + '\nYour numbers: ' + userNumbers ;
            mailer.sendMail(user.userEmail, textToSend);
        }));
    }

}

module.exports = {
    GameFlow: GameFlow
}