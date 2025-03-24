const CommandQueue = require("../../commandQueue");
const {getEnemyGoal} = require("../../utils/constants");
const {
    FL,
    KI,
    CMD,
    TR,
    root_exec,
    refresh_queue,
    handleReachedFlag,
    TM,
    is_last_turn
} = require("./utils/condTreeUtils");
const {ball} = require("../../utils/constants")
const ctu = require("./utils/condTreeUtils")

const rotation_speed = 30;
const goal_angle = 3;
const flag_closeness = 3;
const ball_closeness = 1;
const speed = 100;
const wait_time = 15;
const slowDownDistance = 3;
const slow_down_coefficient = 0.6;

const DT = {
    terminate_command: "sendCommand",
    state: {
        commands_queue: new CommandQueue({act: 'tree', to: "refresh"}),
        wait: 0,
        init_commands: [{act: "flag", fl: "fp*c"}, {act: "kick", fl: ball}],
        prev_command: null, // Предыдущая команда
        action: null, // Текущее действие
    },
    root: {
        processCmd(input, state, cmd) {
            if (cmd === "play_on") {
                state.commands_queue.enqueueFront({act: 'tree', to: "refresh"})
            }
            if (cmd === "win_goal") {
                state.commands_queue.enqueueFront({act: 'tree', to: "refresh"})
            }
            if (cmd === '"go"') {
                state.commands_queue.enqueueFront({act: "kick", fl: ball, goal: getEnemyGoal(input.side)})
            }
        },
        exec(input, state) {
            if (input.isMySide) {
                console.log("myside")
                refresh_queue(state, state.init_commands, input.side)
            }
            root_exec(state, {act: 'tree', to: "refresh"})
            console.log("exec", state.commands_queue)
        },
        next: (input, state) => {
            console.log("FORWAARD")
            switch (state.action.act) {
                case CMD:
                    return "sendCommand"
                case FL:
                    return 'flagSeek'
                case KI:
                    return "ballSeek"
                case TM:
                    return "ballSeek"
                case TR:
                    if (state.action.to === "refresh") {
                        console.log("----------------- refresh --------------------")
                        refresh_queue(state, state.init_commands, input.side)
                        state.command = {n: "move", v: state.start_coords};
                        state.wait = 0;
                        return 'sendCommand'
                    }
                default: {
                    console.log("Unknown act", state.action.act)
                    state.commands_queue.dequeue()
                }
            }
        },
    },
    goalPath: {
        next: (input, state) => {
            if (ctu.getVisible(state.action.fl, input.see)) {
                return "rootNext"; // Если объект видим, переходим к следующему шагу
            } else {
                return "rotate"; // Иначе поворачиваемся
            }
        }
    },
    flagSeek: {
        next: (input, state) => {
            if (ctu.getVisible(state.action.fl, input.see)) {
                return 3 > ctu.getDistance(state.action.fl, input.see, input.agent) //далеко?
                    ? "closeFlag" // близко
                    : "farGoal" // далеко
            } else {
                return "rotateToGoal"
            }
        }
    },
    closeFlag: {
        exec(input, state) {
            state.commands_queue.dequeue()
            state.action = state.commands_queue.peek()
        },
        next: (input, state) => {
            if (state.commands_queue.isEmpty()) {
                return "sendCommand"
            } else {
                return "root"
            }
        },
    },
    farGoal: {
        next: (input, state) => {
            return ctu.getAngle(state.action.fl, input.see)
            > Math.min(15, ctu.getDistance(state.action.fl, input.see, input.agent) * 2)  // большой угол
                ? "rotateToGoal" // поворачиваемся
                : "runToGoal" // бежим к цели
        }
    },
    rotateToGoal: {
        exec(input, state) {
            let angle
            ctu.getVisible(state.action.fl, input.see)
                ? angle = ctu.getAngle(state.action.fl, input.see)
                : angle = ctu.getTurnToObjectAngle(state.action.goal, is_last_turn(state), 30,  input.agent)
            console.log(2, {n: "turn", v: angle})
            state.command = {n: "turn", v: angle}
        },
        next: (input, state) => "sendCommand"
    },
    runToGoal: {
        exec(input, state) {
            state.command = {n: "dash", v: Math.min(100, ctu.getDistance(state.action.fl, input.see, input.agent) * 40)}
        },
        next: (input, state) => "sendCommand"
    },
    sendCommand: {command: (input, state) => state.command},
    ballSeek: {
        next: (input, state) => {
            if (ctu.getVisible(state.action.fl, input.see)) {
                return 1 > ctu.getDistance(state.action.fl, input.see, input.agent) // мяч далеко?
                    ? "closeBall" // близко
                    : "farGoal" // далеко
            } else {
                return "rotateFixAngle"
            }
        },
    },
    rotateFixAngle: {
        exec(input, state) {//add rotate from controller
            state.command = {n: "turn", v: "15"}
        },
        next: (input, state) => "sendCommand",
    },
    closeBall: {
        next: (input, state) => {
            let angle, v
            ctu.getVisible(state.action.goal, input.see)
                ? {angle, v} = ctu.kickBallVisible(state.action.goal, input.see)
                : {angle, v} = ctu.kickBallInVisible(state.action.goal, is_last_turn(state), input.side)
            if (!angle) {
                angle = 0
            }
            if (!v) {
                v = 20
            }
            state.command = {n: "kick", v: v, a: angle}
            state.commands_queue.enqueueFront({act: 'cmd', cmd: {n: "turn", v: angle}})
            return "sendCommand"
        }
    },
}
module.exports = DT;