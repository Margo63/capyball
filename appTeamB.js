const Agent = require('./agentGrid')
const VERSION = 7 // Версия сервера
let teamName2 = "teamB"
let agent1 = new Agent(); // Создание экземпляра агента5
require('./socket')(agent1, teamName2, VERSION) //Настройка сокета
