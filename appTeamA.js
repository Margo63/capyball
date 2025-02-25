const Agent = require('./agentGrid')
const Controller = require('./controller')
const VERSION = 7 // Версия сервера
let teamName = "teamA" // Имя команды

let agent1 = new Agent(); // Создание экземпляра агента-15
 require('./socket')(agent1, teamName, VERSION) //Настройка сокета

const act = [{act: "flag", fl: "frb"}, {act: "flag", fl: "gl"},
    {асt: "flag", fl: "fc"}, {act: "kick", fl: "b", goal: "gr"}]

agent1.socketSend("move", `-20 -5`)

let controller = new Controller();
agent1.setController(controller)

