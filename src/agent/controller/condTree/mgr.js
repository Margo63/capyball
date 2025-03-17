const {getEnemyGoal, getMyGoal, FLAGS} = require("../utils/constants");
const {getTurnAngle, isGoal} = require("../utils/actUtils");
const {distance} = require("../utils/locationUtils");

class Manager {

    constructor(team_name) {
        //console.log("constructor")
        this.labels = null
        this.agent = null
        this.position = null
        this.id = null
        this.team_name = team_name
    }

    getAction(dt, labels, agent, position, id) {
        this.labels = labels
        this.agent = agent
        this.position = position
        this.id = id
        //console.log("getAction\n"+this.labels)
        const manager = this

        function execute(dt, title) {
            let current_title = title

            console.log(current_title, dt.terminate_command )
            while (current_title !== dt.terminate_command) {
                console.log(current_title)
                const action = dt[current_title]
                if (typeof action.exec == "function") {
                    action.exec(manager, dt.state)
                }
                current_title = action.next(manager, dt.state)
            }
            return dt.state.command
        }

        return execute(dt, "root")
    }

    getVisible(fl) {
        return this.getIndex(fl) !== -1
    }

    getDistance(fl) {
        if (this.getVisible(fl)) {
            return this.getP(fl).p[0]
        } else {
            console.log(this.agent)
            return distance(this.agent, FLAGS[fl])
        }
    }

    getAngle(fl) {
        return this.getP(fl).p[1]
    }

    hardGoToObject(fl) {
        let angle
        let v = 100
        if (this.getVisible(fl)) {
            angle = this.getAngle(fl)
        } else {
            if (FLAGS[fl]) {
                angle = getTurnAngle(this.agent.x, this.agent.y, FLAGS[fl].x, FLAGS[fl].y, this.agent.angleRad)
            } else {
                v = 90
                angle = 45
            }
        }
        return {v: v, angle: angle}
    }

    getVisibleTeammatesCount() {
        return this.getVisibleTeammates().length
    }

    getVisibleTeammates() {
        console.log(this.labels.p_labels[0] ? this.labels.p_labels[0].cmd.p : "", this.team_name)
        const teammates = this.labels.p_labels.filter(player => {
            console.log(player.cmd.p[1])
            return player.cmd.p[1] === '"' + this.team_name + '"'; // Проверяем название команды

        });
        console.log(teammates)
        return teammates;
    }

    getVisibleTeammate() {
        const teammates = this.labels.p_labels.filter(player => {
            console.log(player.cmd.p[1])
            return player.cmd.p[1] === '"' + this.team_name + '"'; // Проверяем название команды

        });
        console.log(teammates)
        return teammates.length > 0 ? teammates[0] : null;
    }

    kickBallVisible(fl) {
        const index = this.getIndex(fl)
        let angle, v
        if (this.labels.all_labels[index].p[0] < 20) {
            v = 100
        } else {
            v = 40
            // let minus_speed = this.labels.p_labels
            // // уменьшение скорости на minus_speed для того, чтобы не кидать на большие расстояния
            // v = Math.max(100 - minus_speed, 40)
        }
        angle = this.labels.all_labels[index].p[1]
        return {v: v, angle: angle}
    }

    kickBallInVisible(fl, isLastActTurn) {
        let v = 50
        let goal = getEnemyGoal(this.position)
        let angle = this.getTurnToObjectAngle(goal.coords, isLastActTurn, 45)
        return {v: v, angle: angle}
    }

//sometimes call err "Maximum call stack size"
    getTurnToObjectAngle(constantCoords, isLastActTurn, default_value) {
        if (constantCoords !== undefined && !isLastActTurn/* если есть шанс, что запутался, то идём перебирать*/) {
            return getTurnAngle(this.agent.x, this.agent.y, constantCoords.x, constantCoords.y, this.agent.angleRad)
        } else {
            return default_value ? default_value : 30
        }
    }

    getP(fl) {
        const index = this.getIndex(fl)
        if (index !== -1)
            return this.labels.all_labels[index]
        throw new Error(`Cannot find index of: ${fl}`)
    }

    getIndex(fl) {
        return this.labels.all_labels_name.indexOf(fl)
    }
}

module.exports = Manager