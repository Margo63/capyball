const Agent = require('../agent/agentGrid')
const Controller = require('../agent/controller/controller')
const VERSION = 7 // Версия сервера
let teamName = "teamA" // Имя команды


const ctrl1_p = require('../agent/controller/comand/player/level_1')
const ctrl2_p = require('../agent/controller/comand/player/level_2')
const ctrl3_p = require('../agent/controller/comand/player/level_3')
const DT_GOALKEEPER = require("../agent/controller/condTree/tree/goalKeeperCondTree");
const ctrl1 = require("../agent/controller/comand/goalkeeper/level_1");
const ctrl2 = require("../agent/controller/comand/goalkeeper/level_2");
const ctrl3 = require("../agent/controller/comand/goalkeeper/level_3");
{


    let controller4 = new Controller(teamName, [ctrl1_p, ctrl2_p, ctrl3_p], 3);
    let agent4 = new Agent(controller4);
    require('../serverCommunication/socket')(agent4, teamName, VERSION)
    agent4.socketSend("move", `-25 10`)
}


{
    let controller2 = new Controller(teamName, [ctrl1_p, ctrl2_p, ctrl3_p], 4);
    let agent2 = new Agent(controller2);
    require('../serverCommunication/socket')(agent2, teamName, VERSION)
    agent2.socketSend("move", `-25 0`)
}