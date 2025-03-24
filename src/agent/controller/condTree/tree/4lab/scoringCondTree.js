const CommandQueue = require("../../../commandQueue");
const {getEnemyGoal} = require("../../../utils/constants");
const {
    FL,
    KI,
    CMD,
    TR,
    TM,
    handleReachedFlag,
    root_exec,
    refresh_queue,
    is_last_turn
} = require("../utils/condTreeUtils");
const {ball} = require("../../../utils/constants")

const init_commands = [{act: "flag", fl: "fplb"},
    {act: "teammate"}
];

const start_coords = "-20 -15"

const DT = {
    terminate_command: "sendCommand",
    state: {
        commands_queue: new CommandQueue(...init_commands),
        command: null,
        prev_command: null, // Предыдущая команда
        action: null, // Текущее действие
    },
    root: {
        processCmd(mgr, state, cmd) {
            console.log("CMD", cmd)
            if (cmd === "play_on") {
                state.commands_queue.enqueueFront({act: 'tree', to: "refresh"})
            }
            if (cmd === "win_goal") {
                state.commands_queue.enqueueFront({act: 'tree', to: "refresh"})
            }
            if (cmd === '"go"') {
                state.commands_queue.enqueueFront({act: "kick", fl: ball, goal: getEnemyGoal(mgr.position)})
                return;
            }
        },
        exec(mgr, state) {
            root_exec(mgr, state, {act: 'tree', to: "sendCommand"})
        },

        next: (mgr, state) => {
            switch (state.action.act) {
                case CMD:
                    return "sendCommand"
                case FL:
                    return 'flagSeek'
                case KI:
                    return "ballSeek"
                case TM:
                    return "teammateSeek"
                case TR:
                    if (state.action.to === "refresh") {
                        console.log("----------------- refresh --------------------")
                        refresh_queue(state, init_commands)
                        state.command = {n: "move", v: state.start_coords};
                        state.wait = 0;
                        return 'sendCommand'
                    }
                    return state.action.to
                default: {
                    console.log("Unknown act", state.action.act)
                    state.commands_queue.dequeue()
                }
            }
        },
    },
    goalPath: {
        next: (mgr, state) => {
            if (mgr.getVisible(state.action.fl)) {
                return "rootNext"; // Если объект видим, переходим к следующему шагу
            } else {
                return "rotate"; // Иначе поворачиваемся
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
        next: (mgr, state) => {
            if (state.commands_queue.isEmpty()) {
                return "sendCommand"
            } else {
                return "root"
            }
        },
    },
    farGoal: {
        next: (mgr, State) => {
            return mgr.getAngle(State.action.fl)
            > Math.min(15, mgr.getDistance(State.action.fl) * 2)  // большой угол
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
            state.command = {n: "dash", v: Math.min(100, mgr.getDistance(state.action.fl) * 40)}
        },
        next: (mgr, state) => "sendCommand"
    },
    sendCommand: {command: (mgr, state) => state.command},
    ballSeek: {
        next: (mgr, state) => {
            if (mgr.getVisible(state.action.fl)) {
                return 1 > mgr.getDistance(state.action.fl) // мяч далеко?
                    ? "closeBall" // близко
                    : "farGoal" // далеко
            } else {
                return "rotateFixAngle"
            }
        },
    },
    teammateSeek: {
        next: (mgr, state) => {
            let teammate = mgr.getVisibleTeammate()
            if (teammate) {

                const dist = teammate.p[0];
                const angle = teammate.p[1];
                if (dist < 10) {
                    return "closeFlag"
                } else {
                    return angle > Math.min(30, dist * 2)  // большой угол
                        ? "rotateToTeammate" // поворачиваемся
                        : "runToTeammate" // бежим к цели
                }
            } else {
                return "rotateFixAngle"
            }
        },
    },
    rotateToTeammate: {
        exec(mgr, state) {
            state.command = {n: "turn", v: mgr.getVisibleTeammate().p[1]}
        },
        next: (mgr, state) => "sendCommand"
    },
    runToTeammate: {
        exec(mgr, state) {
            state.command = {n: "dash", v: 100}
        },
        next: (mgr, state) => "sendCommand"
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

const is_last_kick = (state) => state.prev_command && state.prev_command.n === 'kick'

module.exports = DT;