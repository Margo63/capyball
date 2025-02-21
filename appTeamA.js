const Agent = require('./agent')
const VERSION = 7 // Версия сервера
let teamName = "teamA" // ИМЯ команды

let agent1 = new Agent(); // Создание экземпляра агента-15
 require('./socket')(agent1, teamName, VERSION) //Настройка сокета
