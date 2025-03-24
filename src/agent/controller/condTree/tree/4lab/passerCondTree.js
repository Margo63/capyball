const CommandQueue = require("../../../commandQueue");
const {getEnemyGoal} = require("../../../utils/constants");
const {FL, KI, CMD, TR, root_exec, refresh_queue, handleReachedFlag} = require("../utils/condTreeUtils");
const {ball} = require("../../../utils/constants")

const rotation_speed = 30;
const goal_angle = 3;
const flag_closeness = 3;
const ball_closeness = 0.5;
const speed = 100;
const wait_time = 15;
const slowDownDistance = 3;
const slow_down_coefficient = 0.6;

const start_coords = "-20 0"

const init_commands = [{act: "flag", fl: "fprc"}, {act: "kick", fl: ball}]
const DT = {
    terminate_command: "sendCommand",
    state: {
        commands_queue: new CommandQueue(...init_commands),
        wait: 0,
    },
    root: {
        processCmd(input, state, cmd) {
            if (cmd === "play_on") {
                state.commands_queue.enqueueFront({act: 'tree', to: "refresh"})
            }
            if (cmd === "win_goal") {
                state.commands_queue.enqueueFront({act: 'tree', to: "refresh"})
            }
        },
        exec(input, state) {
            root_exec(input, state, {act: "flag", fl: "fprc"})
            console.log("exec", state.commands_queue)
        },
        next: (input, state) => {
            switch (state.action.act) {
                case CMD:
                    return "sendCommand"
                case FL:
                    return 'flagSeek'
                case KI:
                    return "ballSeek"
                case TR:
                    if (state.action.to === "refresh") {
                        console.log("----------------- refresh --------------------")
                        refresh_queue(state, init_commands)
                        state.command = {n: "move", v: start_coords};
                        state.wait = 0;
                        return 'sendCommand'
                    }
                default: {
                    console.log("Unknown act", state.action.act)
                }
            }
        },
    },
    ballSeek: {
        next: (input, state) => {
            if (!mgr.getVisible(state.action.fl)) {
                return "rotate"; // поворачиваемся
            }
            if (ball_closeness > mgr.getDistance(state.action.fl)) {
                return "assist"; // Если мяч близко, переходим в assist
            } else {
                return "farGoal"; // Иначе цель далеко
            }

        }
    },
    flagSeek: {
        next: (input, state) => {
            if (!mgr.getVisible(state.action.fl)) {
                return "rotate"; // Иначе поворачиваемся
            }
            if (flag_closeness > mgr.getDistance(state.action.fl)) {
                return "closeFlag"; // Если флаг близко, переходим в closeFlag
            } else {
                return "farGoal"; // Иначе цель далеко
            }

        }
    },
    closeFlag: {
        exec(input, state) {
            state.action = state.commands_queue.dequeue();
        },
        next: (input, state) => {
            if (state.commands_queue.isEmpty()) {
                return "sendCommand"
            } else {
                return "root"
            }
        },
    },
    rotate: {
        exec(input, state) {
            state.command = {n: "turn", v: rotation_speed}
        }
        ,
        next: (input, state) => "sendCommand",
    },
    farGoal: {
        next: (input, state) => {
            if (Math.abs(mgr.getAngle(state.action.fl)) > goal_angle) {
                return "rotateToGoal"; // Если угол больше goalAngle, поворачиваем к цели
            } else {
                return "runToGoal"; // Иначе бежим к цели
            }
        }
    },
    rotateToGoal: {
        exec(input, state) {
            state.command = {n: "turn", v: mgr.getAngle(state.action.fl)}
        },
        next: (input, state) => "sendCommand",
    },
    runToGoal: {
        exec(input, state) {
            state.command = {n: "dash", v: Math.min(100, mgr.getDistance(state.action.fl) * 15)}
        },
        next: (input, state) => "sendCommand",
    },
    assist: {
        next: (input, state) => {
            if (mgr.getVisibleTeammatesCount() > 0) {
                return "pass"; // Если видим игрока, передаем мяч
            } else {
                return "wait"; // Иначе ждем
            }
        }
    },
    wait: {
        next: (input, state) => {
            if (state.wait >= wait_time) {
                return "findPlayer"; // Если время ожидания истекло, ищем игрока
            } else {
                state.wait++;
                return "sendCommand"; // Иначе увеличиваем время ожидания
            }
        }
    },
    findPlayer: {
        exec(input, state) {
            state.command = {n: "kick", v: `10 ${-30 - (Math.random() * 10) % 5}`}
        },
        next: (input, state) => "sendCommand",
    },
    pass: {
        exec(input, state) {
            //let params = mgr.getAngleAndStrength(p);
            const teammate = mgr.getVisibleTeammate()
            const dist = teammate.p[0];
            const angle = teammate.p[1];

            let kick_strength = Math.min(50, Math.floor(dist * 4))
            let kick_angle = Math.max(angle);

            state.command = {n: "kick", v: kick_strength + " " + kick_angle};
            state.commands_queue.dequeue()
            state.commands_queue.enqueueFront({act: "cmd", cmd: {n: "say", v: "go"}})

        },
        next: (input, state) => "sendCommand",
    },
    sendCommand: {
        command: (input, state) => state.command,
    },
}
module.exports = DT;