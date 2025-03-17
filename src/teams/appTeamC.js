const Agent = require('../agent/agentGrid')
const DT_PASSER = require('../agent/controller/condTree/tree/4lab/passerCondTree');
const DT_SCORING = require('../agent/controller/condTree/tree/4lab/scoringCondTree');
//const DT = require('../agent/controller/condTree/twoPlayersCondTree');
//const DT = require('../agent/controller/condTree/goalKeeperCondTree');
const Controller = require('../agent/controller/controller')
const VERSION = 7 // Версия сервера
let teamName = "teamA" // Имя команды


let controller1 = new Controller(DT_SCORING, teamName);
let agent2 = new Agent(controller1); // Создание экземпляра агента-15
require('../serverCommunication/socket')(agent2, teamName, VERSION) //Настройка сокета

agent2.socketSend("move", `-10 -20`)
