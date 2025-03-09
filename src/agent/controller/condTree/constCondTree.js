const CommandQueue = require("../commandQueue");
const {getEnemyGoal} = require("../utils/constants");
const FL = "flag", KI = "kick", CMD = "cmd"

const DT = {
    terminate_command: "sendCommand",
    state: {
        // пока оставила на всякий случай
        sequence: [{act: FL, fl: "frb"}, {act: FL, fl: 'gl'}, {act: KI, fl: "b", goal: "gr"}], // массив целей - переделать на очередь
        commands_queue: new CommandQueue(
            {act: "kick", fl: "b", goal: "gr"},
            {act: "flag", fl: "fct"},
            {act: "flag", fl: "gl"},
            {act: "flag", fl: "fglb"},
            {act: "flag", fl: "fct"},
            // {act: "flag", fl: "fplc"},
            // {act: "flag", fl: "fprt"},
            // {act: "flag", fl: "fplc"},
            // {act: "flag", fl: "fprb"},
            // {act: "flag", fl: "fplc"},
            // {act: "flag", fl: "fc"},
            // {act: "flag", fl: "frb"},
            // {act: "flag", fl: "gr"},
            // {act: "flag", fl: "fc"},
            // {act: "flag", fl: "frb"},
            // {act: "flag", fl: "fc"}
        ),
        command: null, // команда
        prev_command: null, // предыдущая
        action: null // текущее действие
    },
    root: {
        exec(mgr, state) {
            if (state.commands_queue.isEmpty()) {
                console.log("Query is empty")
                // как только придёт новая цель - он переключится на неё. А пока пусть бегает за мячиком
                state.action = {act: KI, fl: "b", goal: getEnemyGoal(mgr.position)}
                return
            }
            state.action = state.commands_queue.peek();
            state.prev_command = state.command
            if (state.action.act === CMD) {
                state.commands_queue.dequeue();
                state.command = state.action.cmd
            } else {
                state.command = null
            }
        },
        next: (mgr, state) => {
            switch (state.action.act) {
                case FL:
                    return 'flagSeek'
                case KI:
                    return "ballSeek"
                case CMD:
                    return "sendCommand"
                default:
                    console.log("Unknown act", state.action.act)

            }
        }
    },
    flagSeek: {
        next: (mgr, state) => {
            if (mgr.getVisible(state.action.fl)) {
                return 3 > mgr.getDistance(state.action.fl) //далеко?
                    ? "closeFlag" // близко
                    : "farGoal" // далеко
            } else {
                return "rotateToGoal"
            }
        }
    },
    closeFlag: {
        exec(mgr, state) {
            state.commands_queue.dequeue()
            state.action = state.commands_queue.peek()
        },
        next: (mgr, state) => "root",
    },
    farGoal: {
        next: (mgr, State) => {
            return mgr.getAngle(State.action.fl)
            > Math.min(30, mgr.getDistance(State.action.fl) * 2)  // большой угол
                ? "rotateToGoal" // поворачиваемся
                : "runToGoal" // бежим к цели
        }
    },
    rotateToGoal: {
        exec(mgr, state) {
            let angle
            mgr.getVisible(state.action.fl)
                ? angle = mgr.getAngle(state.action.fl)
                : angle = mgr.getTurnToObjectAngle(state.action.goal, is_last_turn(state))
            state.command = {n: "turn", v: angle}
        },
        next: (mgr, state) => "sendCommand"
    },
    runToGoal: {
        exec(mgr, state) {
            state.command = {n: "dash", v: 100}
        },
        next: (mgr, state) => "sendCommand"
    },
    sendCommand: {command: (mgr, state) => state.command},
    ballSeek: {
        next: (mgr, state) => {
            if (mgr.getVisible(state.action.fl)) {
                return 0.5 > mgr.getDistance(state.action.fl) // мяч далеко?
                    ? "closeBall" // близко
                    : "farGoal" // далеко
            } else {
                return "rotateFixAngle"
            }
        },
    },
    rotateFixAngle: {
        exec(mgr, state) {//add rotate from controller
            state.command = {n: "turn", v: "30"}
        },
        next: (mgr, state) => "sendCommand",
    },
    closeBall: {
        next: (mgr, state) => {
            let angle, v
            mgr.getVisible(state.action.goal)
                ? {angle, v} = mgr.kickBallVisible(state.action.goal)
                : {angle, v} = mgr.kickBallInVisible(state.action.goal, is_last_turn(state))
            state.command = {n: "kick", v: v, a: angle}
            state.commands_queue.enqueueFront({act: 'cmd', cmd: {n: "turn", v: angle}})
            return "sendCommand"
        }
    },
}
const is_last_turn = (state) => state.prev_command && state.prev_command.n === 'turn'
module.exports = DT