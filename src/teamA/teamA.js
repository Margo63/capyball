
const param1 = process.argv.slice(2);

const Agent = require('../agent/agentGrid')
const Controller = require('../agent/controller/controller')
const VERSION = 7 // Версия сервера
let teamName = "teamA" // Имя команды
console.log(param1)
switch (Number(param1[0])) {
    case 1:{ //goalKeeper
        const ctrl1 = require('../agent/controller/comand/goalkeeper/level_1')
        const ctrl2 = require('../agent/controller/comand/goalkeeper/level_2')
        const ctrl3 = require('../agent/controller/comand/goalkeeper/level_3')

        let controller1 = new Controller( teamName, [ctrl1, ctrl2, ctrl3], 0);
        let agent1 = new Agent(controller1); // Создание экземпляра агента-15
        require('../serverCommunication/socket')(agent1, teamName, VERSION, true)
        agent1.socketSend("move", `-50 0`)
        break;
    }
    case 2:{
        const ctrl1_p = require('../agent/controller/comand/centre_defender/level_1')
        const ctrl2_p = require('../agent/controller/comand/centre_defender/level_2')
        const ctrl3_p = require('../agent/controller/comand/centre_defender/level_3')
        let controller2 = new Controller(teamName, [ctrl1_p, ctrl2_p, ctrl3_p], 1);
        let agent2 = new Agent(controller2);
        require('../serverCommunication/socket')(agent2, teamName, VERSION)
        agent2.socketSend("move", `-25 0`)

        break;
    }
    case 3:{
        const ctrl1_p = require('../agent/controller/comand/centre_defender/level_1')
        const ctrl2_p = require('../agent/controller/comand/centre_defender/level_2')
        const ctrl3_p = require('../agent/controller/comand/centre_defender/level_3')
        let controller2 = new Controller(teamName, [ctrl1_p, ctrl2_p, ctrl3_p], 2);
        let agent2 = new Agent(controller2);
        require('../serverCommunication/socket')(agent2, teamName, VERSION)
        agent2.socketSend("move", `-25 0`)
        break;
    }
    case 4:{
        const ctrl1_p = require('../agent/controller/comand/centre_defender/level_1')
        const ctrl2_p = require('../agent/controller/comand/centre_defender/level_2')
        const ctrl3_p = require('../agent/controller/comand/centre_defender/level_3')
        let controller2 = new Controller(teamName, [ctrl1_p, ctrl2_p, ctrl3_p], 3);
        let agent2 = new Agent(controller2);
        require('../serverCommunication/socket')(agent2, teamName, VERSION)
        agent2.socketSend("move", `-25 0`)
        break;
    }
    case 5:{
        const ctrl1_p = require('../agent/controller/comand/defender/level_1')
        const ctrl2_p = require('../agent/controller/comand/defender/level_2')
        const ctrl3_p = require('../agent/controller/comand/defender/level_3')
        let controller2 = new Controller(teamName, [ctrl1_p, ctrl2_p, ctrl3_p], 4);
        let agent2 = new Agent(controller2);
        require('../serverCommunication/socket')(agent2, teamName, VERSION)
        agent2.socketSend("move", `-25 0`)
        break;
    }
    case 6:{
        const ctrl1_p = require('../agent/controller/comand/defender/level_1')
        const ctrl2_p = require('../agent/controller/comand/defender/level_2')
        const ctrl3_p = require('../agent/controller/comand/defender/level_3')
        let controller2 = new Controller(teamName, [ctrl1_p, ctrl2_p, ctrl3_p], 5);
        let agent2 = new Agent(controller2);
        require('../serverCommunication/socket')(agent2, teamName, VERSION)
        agent2.socketSend("move", `-25 0`)
        break;
    }
    case 7:{
        const ctrl1_p = require('../agent/controller/comand/defender/level_1')
        const ctrl2_p = require('../agent/controller/comand/defender/level_2')
        const ctrl3_p = require('../agent/controller/comand/defender/level_3')
        let controller2 = new Controller(teamName, [ctrl1_p, ctrl2_p, ctrl3_p], 6);
        let agent2 = new Agent(controller2);
        require('../serverCommunication/socket')(agent2, teamName, VERSION)
        agent2.socketSend("move", `-25 0`)
        break;
    }
    case 8:{
        const ctrl1_p = require('../agent/controller/comand/defender/level_1')
        const ctrl2_p = require('../agent/controller/comand/defender/level_2')
        const ctrl3_p = require('../agent/controller/comand/defender/level_3')
        let controller2 = new Controller(teamName, [ctrl1_p, ctrl2_p, ctrl3_p], 7);
        let agent2 = new Agent(controller2);
        require('../serverCommunication/socket')(agent2, teamName, VERSION)
        agent2.socketSend("move", `-25 0`)
        break;
    }
    case 9:{
        const ctrl1_p = require('../agent/controller/comand/forward/level_1')
        const ctrl2_p = require('../agent/controller/comand/forward/level_2')
        const ctrl3_p = require('../agent/controller/comand/forward/level_3')
        let controller2 = new Controller(teamName, [ctrl1_p, ctrl2_p, ctrl3_p], 8);
        let agent2 = new Agent(controller2);
        require('../serverCommunication/socket')(agent2, teamName, VERSION)
        agent2.socketSend("move", `-25 0`)
        break;
    }
    case 10:{
        const ctrl1_p = require('../agent/controller/comand/forward/level_1')
        const ctrl2_p = require('../agent/controller/comand/forward/level_2')
        const ctrl3_p = require('../agent/controller/comand/forward/level_3')
        let controller2 = new Controller(teamName, [ctrl1_p, ctrl2_p, ctrl3_p], 9);
        let agent2 = new Agent(controller2);
        require('../serverCommunication/socket')(agent2, teamName, VERSION)
        agent2.socketSend("move", `-25 0`)
        break;
    }
    case 11:{
        const ctrl1_p = require('../agent/controller/comand/forward/level_1')
        const ctrl2_p = require('../agent/controller/comand/forward/level_2')
        const ctrl3_p = require('../agent/controller/comand/forward/level_3')
        let controller2 = new Controller(teamName, [ctrl1_p, ctrl2_p, ctrl3_p], 10);
        let agent2 = new Agent(controller2);
        require('../serverCommunication/socket')(agent2, teamName, VERSION)
        agent2.socketSend("move", `-25 0`)
        break;
    }
}