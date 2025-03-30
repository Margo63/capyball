const Agent = require('../agent/agentGrid')
const Controller = require('../agent/controller/controller')
const VERSION = 7 // Версия сервера
let teamName = "teamA" // Имя команды
/*
{
    const ctrl1 = require('../agent/controller/comand/goalkeeper/level_1')
    const ctrl2 = require('../agent/controller/comand/goalkeeper/level_2')
    const ctrl3 = require('../agent/controller/comand/goalkeeper/level_3')

    let controller1 = new Controller(teamName, [ctrl1, ctrl2, ctrl3], 0);
    let agent1 = new Agent(controller1); // Создание экземпляра агента-15
    require('../serverCommunication/socket')(agent1, teamName, VERSION, true)
    agent1.socketSend("move", `-20 0`)
}
*/

const ctrl1_f = require('../agent/controller/comand/forward/level_1')
const ctrl2_f = require('../agent/controller/comand/forward/level_2')
const ctrl3_f = require('../agent/controller/comand/forward/level_3')
{
    let controller2 = new Controller(teamName, [ctrl1_f, ctrl2_f, ctrl3_f], 8);
    let agent2 = new Agent(controller2);
    require('../serverCommunication/socket')(agent2, teamName, VERSION)
    agent2.socketSend("move", `-25 0`)
}


{
    let controller3 = new Controller(teamName, [ctrl1_f, ctrl2_f, ctrl3_f], 9);
    let agent3 = new Agent(controller3);
    require('../serverCommunication/socket')(agent3, teamName, VERSION)
    agent3.socketSend("move", `-25 -10`)
}

{
    let controller3 = new Controller(teamName, [ctrl1_f, ctrl2_f, ctrl3_f], 10);
    let agent3 = new Agent(controller3);
    require('../serverCommunication/socket')(agent3, teamName, VERSION)
    agent3.socketSend("move", `-25 -10`)
}

/*
const ctrl1_d = require('../agent/controller/comand/defender/level_1')
const ctrl2_d = require('../agent/controller/comand/defender/level_2')
const ctrl3_d = require('../agent/controller/comand/defender/level_3')
{
    let controller4 = new Controller(teamName, [ctrl1_d, ctrl2_d, ctrl3_d], 4);
    let agent4 = new Agent(controller4);
    require('../serverCommunication/socket')(agent4, teamName, VERSION)
    agent4.socketSend("move", `-25 -10`)
}
{
    let controller5 = new Controller(teamName, [ctrl1_d, ctrl2_d, ctrl3_d], 5);
    let agent5 = new Agent(controller5);
    require('../serverCommunication/socket')(agent5, teamName, VERSION)
    agent5.socketSend("move", `-25 -10`)
}
{
    let controller6 = new Controller(teamName, [ctrl1_d, ctrl2_d, ctrl3_d], 6);
    let agent6 = new Agent(controller6);
    require('../serverCommunication/socket')(agent6, teamName, VERSION)
    agent6.socketSend("move", `-25 -10`)
}
{
    let controller7 = new Controller(teamName, [ctrl1_d, ctrl2_d, ctrl3_d], 7);
    let agent7 = new Agent(controller7);
    require('../serverCommunication/socket')(agent7, teamName, VERSION)
    agent7.socketSend("move", `-25 -10`)
}

 */