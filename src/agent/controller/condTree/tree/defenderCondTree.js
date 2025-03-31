const CommandQueue = require("../../commandQueue");
const {getEnemyGoal, getMyGoal} = require("../../utils/constants");
const {FL, KI, CMD, TR, root_exec, refresh_queue, handleReachedFlag, amITheClosest} = require("./utils/condTreeUtils");
const {ball} = require("../../utils/constants")
const ctu = require("./utils/condTreeUtils")

const rotation_speed = 30;
const goal_angle = 3;
const flag_closeness = 3;
const ball_closeness = 1;
const speed = 100;
const wait_time = 15;
const SLOW_COEFF = 0.8;
const ROTATE_ANGLE = 15;
const DIST_TO_MOVE = 20;
const BALL_CLOSE_DIST = 2;
const SLOW_CLOSE_COEFF = 0.8;

const DT = {
    terminate_command: "sendCommand",
    state: {
        commands_queue: new CommandQueue({act: 'tree', to: "refresh"}),
        wait: 0,
        init_commands: [{act: "flag", fl: "fp?c"}, {act: "kick", fl: ball}],
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
            if (input.isEnemySide && !input.amIClosestToBall &&
                (state.commands_queue.isEmpty() || state.commands_queue.peek().act !== "flag")) {
                refresh_queue(state, state.init_commands, input.side)
            }
            root_exec(state, {act: "kick", fl: ball})
            state.start = ctu.getFlag(state.start_flag, input.side)
        },
        next: (input, state) => {
            switch (state.action.act) {
                case KI:
                    if (input.amINeedToKickBall) {
                        return 'checkBallVisibility'
                    } else state.commands_queue.enqueueFront({act: "flag", fl: state.start})
                case FL:
                    return "checkPosition"
                case CMD:
                    return "sendCommand"
                case TR:
                    if (state.action.to === "refresh") {
                        console.log("----------------- refresh --------------------")
                        refresh_queue(state, state.init_commands, input.side)
                        state.command = {n: "move", v: `${state.start.coords.x} ${state.start.coords.y}`};
                        state.wait = 0;
                        return 'sendCommand'
                    }
                default: {
                    console.log("Unknown act", state.action.act)
                    state.commands_queue.dequeue()
                    return "root"
                }
            }
        },
    },
    checkPosition: {
        next: (input, state) => {
            const distanceToGoal = ctu.getDistance(state.start.name, input.see, input.agent);
            if (distanceToGoal < 5) {
                state.commands_queue.dequeue()
                return "checkBallVisibilityInStart"; // Если у ворот, следим за мячом
            } else {
                return "findGoal"; // Если не у ворот, ищем их
            }
        }
    },
    checkBallVisibilityInStart: {
        next: (input, state) => {
            if (!ctu.getVisible(ball, input.see)) {
                return "findBall"; // Если не виден, поворачиваемся к нему
            } else if (ctu.getDistance(ball, input.see) < 1) {
                return "kickBall"; // Если рядом, пытаемся отбить// TODO ловим?
            } else if (ctu.getDistance(ball, input.see) < DIST_TO_MOVE && !is_last_kick(state)) {
                return "moveToBall"; // Если мяч достаточно близко, бежим к нему
            }
            return "turnToBall"; // Иначе продолжаем следить за мячом
            // } else {
            //     return "catchBall"; // Если совсем рядом, то ловим
            // }
        }
    },
    checkBallVisibility: {// TODO переписать нормально
        next: (input, state) => {
            if (!ctu.getVisible(ball, input.see)) {
                return "findBall"; // Если не виден, поворачиваемся к нему
            } else if (ctu.getDistance(ball, input.see, input.agent) < 1) {
                return "kickBall"; // Если рядом, пытаемся отбить// TODO ловим?
            } else if ((ctu.getDistance(ball, input.see, input.agent) < DIST_TO_MOVE || input.amIClosestToBall) && !is_last_kick(state)) {
                return "moveToBall"; // Если мяч достаточно близко или ближе нас никого, бежим к нему
            }
            state.commands_queue.enqueueFront({act: "flag", fl: "fp?c"})
            const distanceToGoal = ctu.getDistance(state.start.name, input.see, input.agent);
            if (ctu.getDistance(ball, input.see) < DIST_TO_MOVE || distanceToGoal < 5) {
                return "checkPosition" // Иначе продолжаем следить за мячом
            } else return "findGoal";
            // } else {
            //     return "catchBall"; // Если совсем рядом, то ловим
            // }
        }
    },
    findBall: {
        exec(input, state) {
            state.command = {n: "turn", v: ROTATE_ANGLE} // TODO: более умное что-то
        }, next: (input, state) => "sendCommand"
    },
    turnToBall: {
        exec(input, state) {
            state.command = {n: "turn", v: ctu.getAngle(ball, input.see)}
        }, next: (input, state) => "sendCommand"
    },
    moveToBall: {
        exec(input, state) {
            let {v, angle} = ctu.hardGoToObject(ball, input.see)
            if (input.amIClosestToBall) {
                if (ctu.getDistance(ball, input.see) < BALL_CLOSE_DIST) {
                    state.command = {n: "dash", v: v * SLOW_CLOSE_COEFF, a: angle};
                } else {
                    state.command = {n: "dash", v: v, a: angle};
                }
            } else {
                state.command = {n: "dash", v: v * SLOW_COEFF, a: angle};
            }
        },
        next: (input, state) => "sendCommand"
    },
    findGoal: {
        next: (input, state) => {
            if (ctu.getVisible(state.start.name, input.see)) {
                return "moveToGoal"; // Если видим ворота, бежим к ним
            } else {
                return "rotateToFindGoal"; // Иначе поворачиваемся, чтобы найти ворота
            }
        }
    },
    rotateToFindGoal: {
        exec(input, state) {
            state.command = {n: "turn", v: ROTATE_ANGLE};
        }, next: (input, state) => "sendCommand"
    },
    moveToGoal: {
        exec(input, state) {
            const {v, angle} = ctu.hardGoToObject(state.start.name, input.see, input.agent);
            state.command = {n: "dash", v: v, a: angle};
        }, next: (input, state) => "sendCommand"
    },
    catchBall: {
        exec(input, state) {
            if (ctu.getDistance(ball, input.see) < 0.5) {
                state.command = {n: "catch", v: ctu.getAngle(ball, input.see)};
            } else {
                console.log("ЧТО Я ТУТ ДЕЛАЮ")
            }
        }, next: (input, state) => "sendCommand"
    },
    kickBall: {
        exec(input, state) {
            let enemy_goal = getEnemyGoal(input.side)
            let my_goal = getMyGoal(input.side)
            if (ctu.getVisible(enemy_goal.name, input.see)) {
                state.command = {n: "kick", v: 100, a: ctu.getAngle(enemy_goal.name, input.see)}; // Бьем по воротам
            } else {
                if (ctu.getVisible(my_goal.name, input.see)) {
                    state.command = {n: "kick", v: 100, a: -ctu.getAngle(my_goal.name, input.see)}; // Бьем по воротам
                }
                state.command = {n: "kick", v: 100, a: -ctu.getAngle(ball, input.see)}; // Отбиваем мяч
            }
        }, next: (input, state) => "sendCommand"
    },
    wait: { // оставила на всякий случай
        next: (input, state) => {
            if (state.wait >= wait_time) {
                return "findPlayer"; // Если время ожидания истекло, ищем игрока
            } else {
                state.wait++;
                return "sendCommand"; // Иначе увеличиваем время ожидания
            }
        }
    },
    findPlayer: {// оставила на всякий случай
        exec(input, state) {
            state.command
            if (input.canKick) {
                let enemy_goal = getEnemyGoal(input.side)
                if (ctu.getVisible(enemy_goal.name, input.see)) {
                    state.command = {n: "kick", v: 100, a: ctu.getAngle(enemy_goal.name, input.see)}; // Бьем по воротам
                    return
                }
                let my_goal = getMyGoal(input.side)
                if (ctu.getVisible(my_goal.name, input.see)) {
                    state.command = {n: "kick", v: 100, a: -ctu.getAngle(my_goal.name, input.see)}; // Бьем НЕ по воротам
                    return;
                }
                if (ctu.getVisible("ft0", input.see)) {
                    state.command = {n: "kick", v: 100, a: ctu.getAngle("ft0", input.see)}
                    return;
                }
                if (ctu.getVisible("fb0", input.see)) {
                    state.command = {n: "kick", v: 100, a: ctu.getAngle("fb0", input.see)}
                    return
                }
                if (ctu.getVisible("fg" + input.side + 't', input.see)) {
                    state.command = {n: "kick", v: 100, a: -180}
                    return;
                }
                if (ctu.getVisible("fg" + input.side + 'b', input.see)) {
                    state.command = {n: "kick", v: 100, a: -180}
                    return;
                }
                state.command = {n: "kick", v: 100, a: -ctu.getAngle(ball, input.see)}; // Отбиваем мяч
            }
        },
        next: (input, state) => "sendCommand",
    },
    pass: {// оставила на всякий случай
        exec(input, state) {
            let teammate = ctu.getVisibleTeammate(input.see, input.team_name)
            const dist = teammate.p[0];
            const angle = teammate.p[1];

            let kick_strength = Math.max(50, Math.floor(dist))
            let kick_angle = Math.min(angle);

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

const is_last_kick = (state) => state.prev_command && state.prev_command.n === 'kick'

module.exports = DT;