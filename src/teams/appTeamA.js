const Agent = require('../agent/agentGrid')
//const DT = require('../agent/controller/condTree/constCondTree');
//const DT = require('../agent/controller/condTree/twoPlayersCondTree');
const DT = require('../agent/controller/condTree/goalKeeperCondTree');
const TA = require('../agent/controller/automaton/automaton')
const Controller = require('../agent/controller/controller')
const VERSION = 7 // Версия сервера
let teamName = "teamA" // Имя команды

let controller = new Controller(DT,TA, teamName);
let agent1 = new Agent(controller); // Создание экземпляра агента-15
require('../serverCommunication/socket')(agent1, teamName, VERSION) //Настройка сокета

agent1.socketSend("move", `-1 -20`)
