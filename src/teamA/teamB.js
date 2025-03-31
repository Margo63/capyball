const param1 = process.argv.slice(2);

const Agent = require('../agent/agentGrid')
const Controller = require('../agent/controller/controller')
const VERSION = 7 // Версия сервера
let teamName = "teamB" // Имя команды
console.log(param1)
let getControllers = (type) => {
    const ctrl1_p = require(`../agent/controller/comand/${type}/level_1`)
    const ctrl2_p = require(`../agent/controller/comand/${type}/level_2`)
    const ctrl3_p = require(`../agent/controller/comand/${type}/level_3`)
    return [ctrl1_p, ctrl2_p, ctrl3_p]
}

switch (Number(param1[0])) {

    case 0: {//goalKeeper
        const controllers = getControllers("goalkeeper")
        let controller2 = new Controller(teamName, controllers, Number(param1[0]));
        let agent2 = new Agent(controller2);
        require('../serverCommunication/socket')(agent2, teamName, VERSION, true)
        agent2.socketSend("move", `-50 0`)
        break;
    }
    case 1:
    case 2:
    case 3: {
        const controllers = getControllers("centre_defender")
        let controller2 = new Controller(teamName, controllers, Number(param1[0]));
        let agent2 = new Agent(controller2);
        require('../serverCommunication/socket')(agent2, teamName, VERSION)
        agent2.socketSend("move", `0 0`)
        break;
    }
    case 4:
    case 5:
    case 6:
    case 7: {
        const controllers = getControllers("defender")
        let controller2 = new Controller(teamName, controllers, Number(param1[0]));
        let agent2 = new Agent(controller2);
        require('../serverCommunication/socket')(agent2, teamName, VERSION)
        agent2.socketSend("move", `-25 0`)
        break
    }
    case 8:
    case 9:
    case 10: {
        const controllers = getControllers("forward")
        let controller2 = new Controller(teamName, controllers, Number(param1[0]));
        let agent2 = new Agent(controller2);
        require('../serverCommunication/socket')(agent2, teamName, VERSION)
        agent2.socketSend("move", `25 0`)
        break
    }

}