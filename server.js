const express = require ('express');
const bodyParser = require ('body-parser');
const cors = require ('cors');
const dbService = require('./database-service');
const GameFlow = require ('./game-flow');

const uri = "mongodb://localhost:27017";
const db = 'lottery-db';
const lotteriesInfo = 'lotteries-info'
const lotteries = 'lott-';
const users = 'users';

const gameFlow = new GameFlow.GameFlow(uri, db, lotteries, lotteriesInfo, users);
gameFlow.gameInit(); // starts game loop

const corsOptions = {
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200
}

const app = express();
app.use(bodyParser.json());
app.use(cors(corsOptions));

app.get("/", (request, response) => {
    response.send("<h2>Привет Express!</h2>");
});

app.route('/api/gameData/home').get((request, response) => {
    dbService.getGameInfo(uri, db, lotteriesInfo).then(res => {
        response.send(res.map(x => x = {
            gameName: x.gameName,
            jackpot: x.bougthTicketsCount * x.price / 2,
            nextGame: x.nextGameDate,
            lastWin: x.lastWiningNumbers
        }));
    });
});

app.route('/api/gameData/check').get((request, response) => {
    dbService.getGameInfo(uri, db, lotteriesInfo).then(res => {
        response.send(res.map(x => x = { 
            gameName: x.gameName,
            gamesCount: x.gamesCount
        }));
    });
});

app.route('/api/gameData/buy').get((request, response) => {
    dbService.getGameInfo(uri, db, lotteriesInfo).then(res => {
        response.send(res.map(x => x = {
            gameName: x.gameName,
            maxBalls: x.maxBalls,
            maxSelectedCheckbox: x.maxSelectedCheckbox
        }));
    });
});

app.route('/api/gameData/newTicket').put((request, response) => {
    body = request.body;
    dbService.getGameInfo(uri, db, lotteriesInfo, {gameName: body.gameName}).then(res => res.map(element => {
        console.log(element)
        dbService.addNewTickets(uri, db, lotteries + body.gameName, {_id: element.nextGameAddress.oid}, [{userId: body.userId, numbers: body.numbers}]);
        response.status(200).send(['got']);
    }));
});

app.route('/api/login').post((request, response) => {
    dbService.getUsersInfo(uri, db, users, {userEmail: request.body.userEmail, userPassword: request.body.userPassword}).then(res => {
        if(res.length === 1) {
            response.status(200).send({userEmail: res[0].userEmail, userId: res[0]._id, userPassword: 'valid'});
        }
        else if (res.length === 0) {
            response.status(201).send(['notUser']);
        }
        else { 
            response.status(203).send(['error']);
        } 
    });
});

app.route('/api/signin').put((request, response) => {
    dbService.getUsersInfo(uri, db, users, {userEmail: request.body.userEmail}).then(res => {
        if(res.length != 0) {
            response.status(201).send(['exist']);
        }
        else {
            dbService.addNewUser(uri, db, users, new dbService.User(request.body.userEmail, request.body.userPassword)).then(res => {
                console.log(res);
                response.status(200).send(new dbService.User(request.body.userEmail, request.body.userPassword, res.ops[0]._id))
            });
        }
    });
});

app.listen(3000); //start listening and replying for requests