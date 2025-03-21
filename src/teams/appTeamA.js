const Agent = require('../agent/agentGrid')
//const DT = require('../agent/controller/condTree/constCondTree');
//const DT = require('../agent/controller/condTree/twoPlayersCondTree');
const DT = require('../agent/controller/condTree/goalKeeperCondTree');
const TA = require('../agent/controller/automaton/goalKeeper')
const Controller = require('../agent/controller/controller')
const VERSION = 7 // Версия сервера
let teamName = "teamA" // Имя команды
const ctrl1 = require('../agent/controller/comand/goalKeeper/level_1')
const ctrl2 = require('../agent/controller/comand/goalKeeper/level_2')
const ctrl3 = require('../agent/controller/comand/goalKeeper/level_3')

const ctrl1_r = require('../agent/controller/comand/runer/level_1')
const ctrl2_r = require('../agent/controller/comand/runer/level_2')
const ctrl3_r = require('../agent/controller/comand/runer/level_3')

let controller = new Controller(DT, TA, teamName, [ctrl1_r,ctrl2_r,ctrl3_r],"l");
let agent1 = new Agent(controller); // Создание экземпляра агента-15
let a2 = new Agent(controller);
let a3 = new Agent(controller);
require('../serverCommunication/socket')(agent1, teamName, VERSION) //Настройка сокета
// require('../serverCommunication/socket')(a2, teamName, VERSION) //Настройка сокета
// require('../serverCommunication/socket')(a3, teamName, VERSION) //Настройка сокета

agent1.socketSend("move", `-15 0`, true)
// a2.socketSend("move", `-38 17`)
// a3.socketSend("move", `-38 -17`)
