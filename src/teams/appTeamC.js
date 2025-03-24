const Agent = require('../agent/agentGrid')
const Controller = require('../agent/controller/controller')
const VERSION = 7 // Версия сервера
let teamName = "teamC" // Имя команды
{
    const ctrl1 = require('../agent/controller/comand/goalkeeper/level_1')
    const ctrl2 = require('../agent/controller/comand/goalkeeper/level_2')
    const ctrl3 = require('../agent/controller/comand/goalkeeper/level_3')

    const DT_GOALKEEPER = require('../agent/controller/condTree/tree/goalKeeperCondTree');
    let controller1 = new Controller(teamName, [ctrl1, ctrl2, ctrl3], 0);
    let agent1 = new Agent(controller1); // Создание экземпляра агента-15
    require('../serverCommunication/socket')(agent1, teamName, VERSION, true)
    agent1.socketSend("move", `-20 0`)
}


const ctrl1_p = require('../agent/controller/comand/player/level_1')
const ctrl2_p = require('../agent/controller/comand/player/level_2')
const ctrl3_p = require('../agent/controller/comand/player/level_3')
const DT_GOALKEEPER = require("../agent/controller/condTree/tree/goalKeeperCondTree");
const ctrl1 = require("../agent/controller/comand/goalkeeper/level_1");
const ctrl2 = require("../agent/controller/comand/goalkeeper/level_2");
const ctrl3 = require("../agent/controller/comand/goalkeeper/level_3");
{

    let controller2 = new Controller(teamName, [ctrl1_p, ctrl2_p, ctrl3_p], 1);
    let agent2 = new Agent(controller2);
    require('../serverCommunication/socket')(agent2, teamName, VERSION)
    agent2.socketSend("move", `-25 0`)

}


{
    let controller3 = new Controller(teamName, [ctrl1_p, ctrl2_p, ctrl3_p], 5);
    let agent3 = new Agent(controller3);
    require('../serverCommunication/socket')(agent3, teamName, VERSION)
    agent3.socketSend("move", `-25 -10`)
}