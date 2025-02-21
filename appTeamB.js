const Agent = require('./agent')
const VERSION = 7 // Версия сервера
let teamName2 = "teamB"
let agent1 = new Agent(); // Создание экземпляра агента5
require('./socket')(agent1, teamName2, VERSION) //Настройка сокета
agent1.socketSend("move", `-5 0`)