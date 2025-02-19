const Agent = require('./agent')
const VERSION = 7 // Версия сервера
let teamName = "teamA" // ИМЯ команды
let teamName2 = "teamB"
let agent1 = new Agent(); // Создание экземпляра агента
//let agent2 = new Agent();
// let agent3 = new Agent();
// let agent4 = new Agent();
// let agent5 = new Agent();
 require('./socket')(agent1, teamName, VERSION) //Настройка сокета
//require('./socket')(agent2, teamName2, VERSION)
// require('./socket')(agent3, teamName, VERSION)
// require('./socket')(agent4, teamName, VERSION)
// require('./socket')(agent5, teamName, VERSION)
//agent2.socketSend("move", `-15 0`) // Размещение игрока на поле

