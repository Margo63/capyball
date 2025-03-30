const CommandQueue = require("../../commandQueue");
const {getEnemyGoal} = require("../../utils/constants");
const {handleReachedFlag} = require("./utils/condTreeUtils");
const FL = "flag", KI = "kick", CMD = "cmd"

const DT_TwoPlayers = {
    terminate_command: "sendCommand",
    state: {
        sequence: [{act: FL, fl: "frb"}, {act: FL, fl: 'gl'}, {act: KI, fl: "b", goal: "gr"}],
        commands_queue: new CommandQueue(
            {act: "flag", fl: "gl"},
            {act: "kick", fl: "b", goal: "gr"},
            {act: "flag", fl: "fct"},
            {act: "flag", fl: "fglb"},
            {act: "flag", fl: "fct"}
        ),
        command: null,
        prev_command: null,
        action: null,
        closestTeammate: null // мой лидер
    },
    root: {
        processCmd(mgr, state, cmd) {
            if (cmd === "win_goal") {
                let currentCommand = state.commands_queue.peek()
                if (currentCommand && currentCommand.act === 'kick') {
                    state.commands_queue.dequeue()
                }
            }
            if (cmd.startsWith('"reached_')) {
                const message = cmd.replace(/"/g, ''); // Удаляем кавычки
                const flag = message.split("_")[1]; // Получаем флаг из сообщения
                handleReachedFlag(flag, state);
                return
            }
        },
        exec(mgr, state) {
            if (state.commands_queue.isEmpty()) {
                console.log("Query is empty")
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
                return 3 > mgr.getDistance(state.action.fl)
                    ? "closeFlag"
                    : "farGoal"
            } else {
                const visibleTeammatesCount = mgr.getVisibleTeammatesCount();
                if (visibleTeammatesCount === 0) {
                    // Если нет, ищём хоть что-то
                    return "rotateToGoal"
                }
                return "handleClosestTeammate";
            }
        }
    },
    closeFlag: {
        exec(mgr, state) {
            let message = `reached_${state.action.fl}`
            state.command = {n: "say", v: message}
            state.commands_queue.dequeue()
        },
        next: (mgr, state) => "sendCommand",
    },
    farGoal: {
        next: (mgr, state) => {
            // Если нет видимых игроков, используем дерево движения по флагам
            return mgr.getAngle(state.action.fl) > Math.min(30, mgr.getDistance(state.action.fl) * 2)
                ? "rotateToGoal"
                : "runToGoal"
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
                return 0.5 > mgr.getDistance(state.action.fl)
                    ? "closeBall"
                    : "farGoal"
            } else {
                const visibleTeammatesCount = mgr.getVisibleTeammatesCount();
                if (visibleTeammatesCount === 0) {
                    // Если нет, ищём хоть что-то
                    return "rotateFixAngle"
                }
                return "handleClosestTeammate";
            }
        },
    },
    rotateFixAngle: {
        exec(mgr, state) {
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

    handleClosestTeammate: {
        exec(mgr, state) {
            const teammates = mgr.getVisibleTeammates(); // Получаем список видимых игроков
            const closestTeammate = teammates.reduce((closest, current) => {
                return current.p[0] < closest.p[0] ? current : closest;
            });
            if (state.closestTeammate !== closestTeammate) {
                state.closestTeammate = closestTeammate;    // Сохраняем ближайшего игрока в состоянии

                //let message = `obeyed_${mgr.id}_${state.closestTeammate.cmd.p[2]}`
                // state.commands_queue.enqueueFront({act: 'cmd', cmd: {n: "say", v: message}})

            }
        },
        next: (mgr, state) => {
            const dist = state.closestTeammate.p[0];
            const angle = state.closestTeammate.p[1];

            if (dist < 1 && Math.abs(angle) < 40) {
                return "avoidCollision"; // Если слишком близко, избегаем столкновения
            } else if (dist > 10) {
                return "farDistance"; // Если далеко, обрабатываем как большое расстояние
            } else {
                return "closeDistance"; // Если на среднем расстоянии, обрабатываем как небольшое расстояние
            }
        }
    },
    avoidCollision: {
        exec(mgr, state) {
            state.command = {n: "turn", v: 30};
        },
        next: (mgr, state) => "sendCommand"
    },
    farDistance: {
        next: (mgr, state) => {
            const angle = state.closestTeammate.p[1];
            return Math.abs(angle) > 5
                ? "turnToTeammate"
                : "dashToTeammate"
        }
    },
    turnToTeammate: {
        exec(mgr, state) {
            state.command = {n: "turn", v: state.closestTeammate.p[1]};
        },
        next: (mgr, state) => "sendCommand"
    },
    dashToTeammate: {
        exec(mgr, state) {
            state.command = {n: "dash", v: 80};
        },
        next: (mgr, state) => "sendCommand"
    },
    closeDistance: {
        next: (mgr, state) => {
            const angle = state.closestTeammate.p[1];
            return angle > 40 || angle < 25
                ? "adjustAngle"
                : "dashSlowly"
        }
    },
    adjustAngle: {
        exec(mgr, state) {
            state.command = {n: "turn", v: state.closestTeammate.p[1] - 30};
        },
        next: (mgr, state) => "sendCommand"
    },
    dashSlowly: {
        next: (mgr, state) => {
            const dist = state.closestTeammate.p[0];
            return dist < 7
                ? "dashVerySlow"
                : "dashModerate"
        }
    },
    dashVerySlow: {
        exec(mgr, state) {
            state.command = {n: "dash", v: 20};
        },
        next: (mgr, state) => "sendCommand"
    },
    dashModerate: {
        exec(mgr, state) {
            state.command = {n: "dash", v: 40};
        },
        next: (mgr, state) => "sendCommand"
    },
}
const is_last_turn = (state) => state.prev_command && state.prev_command.n === 'turn'
module.exports = DT_TwoPlayers;