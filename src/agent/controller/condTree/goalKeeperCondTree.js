const CommandQueue = require("../commandQueue");
const {getEnemyGoal, getMyGoal} = require("../utils/constants");
const FL = "flag", KI = "kick", CMD = "cmd", GT = "gate", PR = "protect"

const DT_Goalkeeper = {
    terminate_command: "sendCommand", state: {
        // Очередь команд
        commands_queue: new CommandQueue(
            {act: "gate"}, // Занимаем позицию в воротах
            {act: "protect", fl: "b"} // Отбиваем мяч
        ), command: null, prev_command: null, // Предыдущая команда
        action: null, // Текущее действие
    },
    root: {
        exec(mgr, state) {
            if (state.commands_queue.isEmpty()) {
                console.log("Query is empty");
                // Если очередь пуста, вратарь просто следит за мячом
                state.action = {act: "protect", fl: "b"};
                return;
            }
            state.action = state.commands_queue.peek();
            state.prev_command = state.command;
            if (state.action.act === CMD) {
                state.commands_queue.dequeue();
                state.command = state.action.cmd;
            } else {
                state.command = null;
            }
        },
        next: (mgr, state) => {
            switch (state.action.act) {
                case PR:
                    return 'checkBallVisibility'
                case GT:
                    return "checkPosition"
                case CMD:
                    return "sendCommand"
                default:
                    console.log("Unknown act", state.action.act)

            }
        }
    },
    checkPosition: {
        next: (mgr, state) => {
            const distanceToGoal = mgr.getDistance(getMyGoal(mgr.position).name);
            if (distanceToGoal < 5) {
                state.commands_queue.dequeue()
                return "checkBallVisibilityInGates"; // Если у ворот, следим за мячом
            } else {
                return "findGoal"; // Если не у ворот, ищем их
            }
        }
    },
    checkBallVisibilityInGates: {
        next: (mgr, state) => {
            if (!mgr.getVisible(ball)) {
                return "findBall"; // Если не виден, поворачиваемся к нему
            } else if (mgr.getDistance(ball) < 1) {
                return "kickBall"; // Если рядом, пытаемся отбить// TODO ловим?
            } else if (mgr.getDistance(ball) < 15 && !is_last_kick(state)) {
                return "moveToBall"; // Если мяч достаточно близко, бежим к нему
            }
            return "turnToBall"; // Иначе продолжаем следить за мячом
            // } else {
            //     return "catchBall"; // Если совсем рядом, то ловим
            // }
        }
    },
    checkBallVisibility: {// TODO переписать нормально
        next: (mgr, state) => {
            if (!mgr.getVisible(ball)) {
                return "findBall"; // Если не виден, поворачиваемся к нему
            } else if (mgr.getDistance(ball) < 1) {
                return "kickBall"; // Если рядом, пытаемся отбить// TODO ловим?
            } else if (mgr.getDistance(ball) < 15 && !is_last_kick(state)) {
                return "moveToBall"; // Если мяч достаточно близко, бежим к нему
            }
            state.commands_queue.enqueueFront({act: "gate"})
            return "checkPosition"; // Иначе продолжаем следить за мячом
            // } else {
            //     return "catchBall"; // Если совсем рядом, то ловим
            // }
        }
    },
    findBall: {
        exec(mgr, state) {
            state.command = {n: "turn", v: 30} // TODO: более умное что-то
        }, next: (mgr, state) => "sendCommand"
    },
    turnToBall: {
        exec(mgr, state) {
            state.command = {n: "turn", v: mgr.getAngle(ball)}
        }, next: (mgr, state) => "sendCommand"
    },
    moveToBall: {
        exec(mgr, state) {
            let {v, angle} = mgr.hardGoToObject(ball)
            state.command = {n: "dash", v: v, a: angle};
        },
        next: (mgr, state) => "sendCommand"
    },
    findGoal: {
        next: (mgr, state) => {
            if (mgr.getVisible(getMyGoal(mgr.position).name)) {
                return "moveToGoal"; // Если видим ворота, бежим к ним
            } else {
                return "rotateToFindGoal"; // Иначе поворачиваемся, чтобы найти ворота
            }
        }
    },
    rotateToFindGoal: {
        exec(mgr, state) {
            state.command = {n: "turn", v: 30}; // Поворачиваемся на 30 градусов
        }, next: (mgr, state) => "sendCommand"
    },
    moveToGoal: {
        exec(mgr, state) {
            const {v, angle} = mgr.hardGoToObject(getMyGoal(mgr.position).name);
            state.command = {n: "dash", v: v, a: angle};
        }, next: (mgr, state) => "sendCommand"
    },
    catchBall: {
        exec(mgr, state) {
            if (mgr.getDistance("b") < 0.5) {
                state.command = {n: "catch", v: mgr.getAngle(ball)};
            } else {
                console.log("ЧТО Я ТУТ ДЕЛАЮ")
            }
        }, next: (mgr, state) => "sendCommand"
    },
    kickBall: {
        exec(mgr, state) {
            let enemy_goal = getEnemyGoal(mgr.position)
            let my_goal = getMyGoal(mgr.position)
            if (mgr.getVisible(enemy_goal.name)) {
                state.command = {n: "kick", v: 100, a: mgr.getAngle(enemy_goal.name)}; // Бьем по воротам
            } else {
                if (mgr.getVisible(my_goal.name)) {
                    state.command = {n: "kick", v: 100, a: -mgr.getAngle(my_goal.name)}; // Бьем по воротам
                }
                state.command = {n: "kick", v: 100, a: -mgr.getAngle(ball)}; // Отбиваем мяч
            }
        }, next: (mgr, state) => "sendCommand"
    },
    sendCommand: {
        command: (mgr, state) => state.command
    }
};
const is_last_kick = (state) => state.prev_command && state.prev_command.n === 'kick'

const ball = "b"
module.exports = DT_Goalkeeper;