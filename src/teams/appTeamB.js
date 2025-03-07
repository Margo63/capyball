const Agent = require('../agent/agentGrid')
const DT = require('../agent/controller/condTree/GoalKeeperTree');
const Controller = require("../agent/controller/controller");
const VERSION = 7 // Версия сервера
let teamName = "teamB"
let controller = new Controller(DT);
let agent1 = new Agent(controller); // Создание экземпляра агента-15
require('../serverCommunication/socket')(agent1, teamName, VERSION) //Настройка сокета

const act = [{act: "flag", fl: "frb"}, {act: "flag", fl: "gl"},
    {асt: "flag", fl: "fc"}, {act: "kick", fl: "b", goal: "gr"}]

agent1.socketSend("move", `20 10`)
agent1.socketSend("turn", `175`)
