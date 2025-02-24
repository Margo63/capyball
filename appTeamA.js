const Agent = require('./agentGrid')
const VERSION = 7 // Версия сервера
let teamName = "teamA" // Имя команды

let agent1 = new Agent(); // Создание экземпляра агента-15
 require('./socket')(agent1, teamName, VERSION) //Настройка сокета
//agent1.socketSend("move", `-20 -5`)