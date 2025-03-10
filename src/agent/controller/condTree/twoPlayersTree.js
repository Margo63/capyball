const CommandQueue = require("../commandQueue");
const {getEnemyGoal} = require("../utils/constants");
const FL = "flag", KI = "kick", CMD = "cmd"

const DT_TwoPlayers = {
    state: {
        // пока оставила на всякий случай
        sequence: [{act: "flag", fl: "frb"}, {act: "flag", fl: 'gl'}, {act: "kick", fl: "b", goal: "gr"}],
        commands_queue: new CommandQueue({act: "flag", fl: "frb"}, {act: "flag", fl: 'gl'}, {
            act: "kick",
            fl: "b",
            goal: "gr"
        }),

        command: null,
        prev_command: null, // предыдущая
        action: null, // текущее действие
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
        next: (mgr, state) => "checkTeammates"
    },

    checkTeammates: {
        next: (mgr, state) => {
            return mgr.getVisibleTeammatesCount() === 0
                ? "flagMovement" // Если нет видимых игроков, используем дерево движения по флагам
                : "oneTeammateVisible"
        }
    },

    flagMovement: {
        // Здесь можно вставить логику из предыдущего дерева для движения по флагам
        next: (mgr, state) => "root"
    },

    oneTeammateVisible: {
        next: (mgr, state) => {
            return mgr.getDistanceToTeammate() < 1 && Math.abs(mgr.getAngleToTeammate()) < 40
                ? "avoidCollision"
                : "checkDistance"
        }
    },
    avoidCollision: {
        exec(mgr, state) {
            state.command = {n: "turn", v: 30};
        },
        next: (mgr, state) => "sendCommand"
    },

    checkDistance: {
        next: (mgr, state) => {
            return mgr.getDistanceToTeammate() > 10
                ? "farDistance"
                : "closeDistance"
        }
    },

    farDistance: {
        next: (mgr, state) => {
            return Math.abs(mgr.getAngleToTeammate()) > 5
                ? "turnToTeammate"
                : "dashToTeammate"
        }
    },

    turnToTeammate: {
        exec(mgr, state) {
            state.command = {n: "turn", v: mgr.getAngleToTeammate()};
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
            return mgr.getAngleToTeammate() > 40 || mgr.getAngleToTeammate() < 25
                ? "adjustAngle"
                : "dashSlowly"
        }
    },

    adjustAngle: {
        exec(mgr, state) {
            state.command = {n: "turn", v: mgr.getAngleToTeammate() - 30};
        },
        next: (mgr, state) => "sendCommand"
    },

    dashSlowly: {
        next: (mgr, state) => {
            return mgr.getDistanceToTeammate() < 7
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

    sendCommand: {
        command: (mgr, state) => state.command
    }
};

module.exports = DT_TwoPlayers;