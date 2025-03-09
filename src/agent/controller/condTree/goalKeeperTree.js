const CommandQueue = require("../commandQueue");
const {getEnemyGoal, getMyGoal} = require("../utils/constants");
const FL = "flag", KI = "kick", CMD = "cmd"

const DT = {
    terminate_command: "sendCommand",
    state: {
        // пока оставила на всякий случай
        sequence: [{act: FL, fl: "b", goal: 'gl'}],
        commands_queue: new CommandQueue({act: FL, fl: "b", goal: 'gl'}),
        command: null, // команда
        prev_command: null, // предыдущая
        action: null // текущее действие
    },
    root: {
        exec(mgr, state) {
            if (state.commands_queue.isEmpty()) {
                console.log("Query is empty")
                // как только придёт новая цель - он переключится на неё. Защищает ворота
                state.action = {act: KI, fl: "b", goal: getMyGoal(mgr.position)}
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
            if (mgr.getVisible(ball)) {
                return mgr.getDistance(ball) < 5
                    ? "ballClose"
                    : "ballFar"
            } else {
                return "findBall"
            }
        }
    },
    findBall: {
        exec(mgr, state) {
            state.command = {n: "turn", v: 30} // TODO: более умное что-то
        },
        next: (mgr, state) => "sendCommand"
    },
    ballClose: {
        exec(mgr, state) {
            state.command =
                mgr.getDistance("b") < 2
                    ? {n: "catch", v: mgr.getAngle(ball)}
                    : {n: "kick", v: 100, a: 0}// TODO: более умное что-то
        },
        next: (mgr, state) => "sendCommand"
    },
    ballFar: {
        next: (mgr, state) => {
            return mgr.isNearGates()
                ? "rotateToBallVisible"
                : "goToGates"
        }
    },
    rotateToBallVisible: {
        exec(mgr, state) {
            state.command = {n: "turn", v: mgr.getAngle(state.action.fl)}
        },
        next: (mgr, state) => "sendCommand"
    },


    goToGates: {
        next: (mgr, state) => {
            return mgr.getDistance(state.action.gl) < 5
                ? "turnToGates"
                : "gatesFar"
        }
        // exec(mgr, state) {
        //     state.action = {act: FL, fl: 'gc'};
        //     state.command = null
        // },
        // next: "goalVisible"
    },

    turnToGates: {
        exec(mgr, state) {//add rotate from controller
            state.command = {n: "turn", v: "180"}
        },
        next: (mgr, state) => "sendCommand"
    },
    gatesFar: {
        next: (mgr, state) => {
            return mgr.getAngle(state.action.gl) > 4
                ? "rotateToGoal"
                : "runToGoal"
        }
    },
    rotateToGoal: {
        exec(mgr, state) {
            state.command = {n: "turn", v: mgr.getAngle(state.action.gl)}
        },
        next: (mgr, state) => "sendCommand"
    },
    runToGoal: {
        exec(mgr, state) {
            state.command = {n: "dash", v: 70}
        },
        next: (mgr, state) => "sendCommand"
    },


    sendCommand: {
        command: (mgr, state) => state.command,
    },
}
const is_last_turn = (state) => state.prev_command && state.prev_command.n === 'turn'
const ball = "b"
module.exports = DT