const {getEnemyGoal, FLAGS, getReverseSide} = require("../../../utils/constants");
const CommandQueue = require("../../../commandQueue");
const {getTurnAngle, isGoal} = require("../../../utils/actUtils");
const {getThirdSide} = require("../../../utils/mathUtils");
const {distance} = require("../../../utils/locationUtils");

class CondTreeUtils {

    static FL = "flag" // {act: FL, fl: "frb"}
    static KI = "kick" // {act: "kick", fl: "b", goal: "gl"}
    static CMD = "cmd" // {act: 'cmd', cmd: {n: "turn", v: angle}}
    static TR = "tree" // {act: 'tree', to: "refresh"}
    static GT = "gate" // {act: "gate"}
    static ST = "start" // {act: "start"}
    static PR = "protect" // {act: "protect", fl: "b"}
    static TM = "teammate" // {act: "teammate"}
    static root_exec(state, default_action) {
        if (state.commands_queue.isEmpty()) {
            console.log("Query is empty")
            // как только придёт новая цель - он переключится на неё.
            // А пока пусть выполняет дефолтную роль
            state.action = default_action
            return
        }
        state.action = state.commands_queue.peek();
        state.prev_command = state.command
        if (state.action.act === CondTreeUtils.CMD) {
            state.commands_queue.dequeue();
            state.command = state.action.cmd
        } else {
            state.command = null
        }
    }

    static handleReachedFlag(state, flag) {
        let queue = state.commands_queue
        if (!queue.isEmpty() && queue.peek().act === "flag" && queue.peek().fl === flag) {
            queue.dequeue()
        }
    }

    static refresh_queue = (state, init_commands, side) => {
        const replaced_init = CondTreeUtils.replaceQuestionMarks(init_commands, side)
        state.commands_queue.clear()
        state.commands_queue.enqueue(...replaced_init)
    }
    static is_last_turn = (state) => CondTreeUtils.is_last_command(state, "turn")

    static is_last_command = (state, command) => state.prev_command && state.prev_command.n === command

    static getVisible(fl, labels) {
        return CondTreeUtils.getIndex(fl, labels) !== -1
    }

    static replaceQuestionMarks(commands, side = 'r') {
        return commands.map(command => {
            const newCommand = {...command}; // Создаём копию объекта
            for (const key in newCommand) {
                if (typeof newCommand[key] === 'string') {
                    CondTreeUtils.replaceQuestionMark(newCommand[key], side)
                }
            }
            return newCommand;
        });
    }


    static getFlag(flag, side = 'r') {
        let result_flag = CondTreeUtils.replaceQuestionMark(flag, side)

        return {name: result_flag, coords: FLAGS[result_flag]}
    }

    static replaceQuestionMark(command, side = 'r') {
        command = command.replace(/\?/g, side); // Заменяем все '?' на replacementChar
        command = command.replace(/\*/g, getReverseSide(side)); // Заменяем все '*' на !replacementChar
        return command
    }


    static getDistance(fl, labels, agent) {
        if (CondTreeUtils.getVisible(fl, labels)) {
            return CondTreeUtils.getP(fl, labels).p[0]
        } else {
            //console.log(CondTreeUtils.agent)
            return distance(agent, FLAGS[fl])
        }
    }

    static getAngle(fl, labels) {
        return CondTreeUtils.getP(fl, labels).p[1]
    }

    static hardGoToObject(fl, labels, agent) {
        let angle
        let v = 100
        if (CondTreeUtils.getVisible(fl, labels)) {
            angle = CondTreeUtils.getAngle(fl, labels)
        } else {
            if (FLAGS[fl]) {
                angle = getTurnAngle(agent.x, agent.y, FLAGS[fl].x, FLAGS[fl].y, agent.angleRad)
            } else {
                v = 90
                angle = 45
            }
        }
        return {v: v, angle: angle}
    }

    static getVisibleTeammatesCount(labels, team_name) {
        return CondTreeUtils.getVisibleTeammates(labels, team_name).length
    }

    static getVisibleTeammates(labels, team_name) {
        //console.log(CondTreeUtils.labels.p_labels[0] ? CondTreeUtils.labels.p_labels[0].cmd.p : "", CondTreeUtils.team_name)
        const teammates = labels.p_labels.filter(player => {
            //console.log(player.cmd.p[1])
            return player.cmd.p[1] === '"' + team_name + '"'; // Проверяем название команды

        });
        //console.log(teammates)
        return teammates;
    }

    static getVisibleTeammate(labels, team_name) {
        const teammates = labels.p_labels.filter(player => {
            console.log(player.cmd.p[1])
            return player.cmd.p[1] === '"' + team_name + '"'; // Проверяем название команды

        });
        console.log(teammates)
        return teammates.length > 0 ? teammates[0] : null;
    }

    static kickBallVisible(fl, labels) {
        const index = CondTreeUtils.getIndex(fl, labels)
        let angle, v
        if (labels.all_labels[index].p[0] < 20) {
            v = 100
        } else {
            v = 40
            // let minus_speed = CondTreeUtils.labels.p_labels
            // // уменьшение скорости на minus_speed для того, чтобы не кидать на большие расстояния
            // v = Math.max(100 - minus_speed, 40)
        }
        angle = labels.all_labels[index].p[1]
        return {v: v, angle: angle}
    }

    static kickBallInVisible(fl, isLastActTurn, position) {
        let v = 50
        let goal = getEnemyGoal(position)
        let angle = CondTreeUtils.getTurnToObjectAngle(goal.coords, isLastActTurn, 45)
        return {v: v, angle: angle}
    }

    static getTurnToObjectAngle(constantCoords, isLastActTurn, default_value, agent) {
        if (constantCoords !== undefined && !isLastActTurn/* если есть шанс, что запутался, то идём перебирать*/) {
            return getTurnAngle(agent.x, agent.y, constantCoords.x, constantCoords.y, agent.angleRad)
        } else {
            return default_value ? default_value : 30
        }
    }

    static getP(fl, labels) {
        const index = CondTreeUtils.getIndex(fl, labels)
        if (index !== -1)
            return labels.all_labels[index]
        throw new Error(`Cannot find index of: ${fl}`)
    }

    static getIndex(fl, labels) {
        return labels.all_labels_name.indexOf(fl)
    }

    static amITheClosest(labels, team_name) {
        if (!labels.b_labels || labels.b_labels.length === 0) {
            return true
        }

        const teammates = CondTreeUtils.getVisibleTeammates(labels, team_name);
        const ball_label = labels.b_labels[0]
        for (let teammate of teammates) {
            console.log(teammate)
            console.log(labels.b_labels)
            const angle = Math.abs(teammate.p[1] - ball_label.p[1])
            const a = Math.abs(teammate.p[0])
            const b = Math.abs(ball_label.p[0])
            if (b <= getThirdSide(a, b, angle)) {
                return false
            }
        }
        return true
    }

    static amINeedToKick(labels, team_name) {
        if (!labels.b_labels || labels.b_labels.length === 0) {
            return false
        }
        const teammates = CondTreeUtils.getVisibleTeammates(labels, team_name);
        const ball_label = labels.b_labels[0]
        let closer_amount = 0
        for (let teammate of teammates) {
            const angle = Math.abs(teammate.p[1] - ball_label.p[1])
            const a = Math.abs(teammate.p[0])
            const b = Math.abs(ball_label.p[0])
            if (b > getThirdSide(a, b, angle)) {
                closer_amount++
            }
        }
        return closer_amount < 3
    }

}

module.exports = CondTreeUtils