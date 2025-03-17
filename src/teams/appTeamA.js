const Agent = require('../agent/agentGrid')
const DT = require('../agent/controller/condTree/tree/constCondTree');
const DT_TEAM = require('../agent/controller/condTree/tree/twoPlayersCondTree');
const DT_GOALKEEPER = require('../agent/controller/condTree/tree/goalKeeperCondTree');
const DT_EMPTY = require('../agent/controller/condTree/tree/4lab/emptyCondTree');
const Controller = require('../agent/controller/controller')
const VERSION = 7 // Версия сервера
let teamName = "teamB" // Имя команды

//
// let controller = new Controller(DT_GOALKEEPER, teamName);
// let agent1 = new Agent(controller); // Создание экземпляра агента-15
// require('../serverCommunication/socket')(agent1, teamName, VERSION, true) //Настройка сокета
// agent1.socketSend("move", `-50 0`)

for (let i = -17; i <= 17; i += 17 * 2) {
    let controller1 = new Controller(DT_EMPTY, teamName);
    let agent1 = new Agent(controller1); // Создание экземпляра агента-15
    require('../serverCommunication/socket')(agent1, teamName, VERSION) //Настройка сокета
    agent1.socketSend("move", `-38 ${i}`)
}
