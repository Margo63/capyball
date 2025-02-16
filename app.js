const Agent = require('./agent')
const VERSION = 7 // Версия сервера
let teamName = "teamA" // ИМЯ команды
let agent = new Agent(); // Создание экземпляра агента
require('./socket')(agent, teamName, VERSION) //Настройка сокета
agent.socketSend("move", `-15 0`) // Размещение игрока на поле