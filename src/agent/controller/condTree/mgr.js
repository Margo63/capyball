const {getEnemyGoal, getMyGoal, FLAGS} = require("../utils/constants");
const {getTurnAngle, isGoal} = require("../utils/actUtils");
const {distance} = require("../utils/locationUtils");

class Manager {

    constructor(labels, agent, position) {
        //console.log("constructor")
        this.labels = labels
        this.agent = agent
        this.position = position
    }

    getAction(dt, labels, agent, position) {
        this.labels = labels
        this.agent = agent
        this.position = position
        //console.log("getAction\n"+this.labels)
        const manager = this

        function execute(dt, title) {
            let current_title = title

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

    kickBallVisible(fl) {
        const index = this.getIndex(fl)
        let angle, v
        if (this.labels.all_labels[index].p[0] < 30) {
            v = 100
        } else {
            let minus_speed = this.labels.all_labels[index].p[0]
            // уменьшение скорости на minus_speed для того, чтобы не кидать на большие расстояния
            v = Math.max(100 - minus_speed, 20)
        }
        angle = this.labels.all_labels[index].p[1]
        return {v: v, angle: angle}
    }

    kickBallInVisible(fl, isLastActTurn) {
        let v = 30
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

    isNearGates() {
        let myGoal = getMyGoal(this.position)
        let isVisible = this.getVisible(myGoal.name)
        console.log(isVisible, myGoal, getMyGoal(this.position))
        return true
    }

    goToGates(fl) {
        if (fl === "gr") {
            const index_ = this.getIndex(fl)
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