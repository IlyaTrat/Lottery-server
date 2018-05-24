const dbService = require('./database-service');

uri = 'mongodb://localhost:27017';
db = 'lottery-db';
lotteriesInfo = 'lotteries-info';

dbService.addNewGameInfo(
    uri, 
    db, 
    lotteriesInfo,
    new dbService.GameInfo('Lottey 1', 5, 50, 5, true, 120000)
)

dbService.addNewGameInfo(
    uri, 
    db, 
    lotteriesInfo,
    new dbService.GameInfo('Lottey 2', 4.5, 45, 4, true, 180000)
);

dbService.addNewGameInfo(
    uri, 
    db, 
    lotteriesInfo,
    new dbService.GameInfo('Lottey 3', 4, 40, 4, true, 240000)
);

// dbService.removeData(uri, db, lotteries, {});
// dbService.removeData(uri, db, lotteriesInfo, {});