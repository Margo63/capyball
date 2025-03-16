const Agent = require('../agent/agentGrid')
const DT = require('../agent/controller/condTree/constCondTree');
const TA = require('../agent/controller/automaton/Runer')
//const DT = require('../agent/controller/condTree/twoPlayersCondTree');
//const DT = require('../agent/controller/condTree/goalKeeperCondTree');
const Controller = require('../agent/controller/controller')
const VERSION = 7 // Версия сервера
let teamName = "teamB" // Имя команды

let controller = new Controller(DT,TA, teamName, "r");
let agent1 = new Agent(controller); // Создание экземпляра агента-15
require('../serverCommunication/socket')(agent1, teamName, VERSION) //Настройка сокета
// let agent2 = new Agent(controller); // Создание экземпляра агента-15
// require('../serverCommunication/socket')(agent2, teamName, VERSION) //Настройка сокета
// let agent3 = new Agent(controller); // Создание экземпляра агента-15
// require('../serverCommunication/socket')(agent3, "teamA", VERSION) //Настройка сокета

agent1.socketSend("move", `-1 15`)
// agent2.socketSend("move", `-1 18`)
// agent2.socketSend("move", `-1 -15`)
