const {getEnemyGoal} = require("../utils/constants");

class Manager {

    constructor(labels,agent,position) {
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
        const manager = new Manager(labels,agent,position)

        function execute(dt, title) {
            const action = dt[title]
            if (typeof action.exec == "function") {
                action.exec(manager, dt.state)
                return execute(dt, action.next)
            }
            if (typeof action.condition == "function") {

                const cond = action.condition(manager, dt.state)
                if (cond)
                    return execute(dt, action.trueCond)
                return execute(dt, action.falseCond)
            }
            if (typeof action.command == "function") {
                return action.command(manager, dt.state)
            }
            throw new Error(`Unexpected node in DT: ${title}`)
        }

        //console.log("tuta")
        return execute(dt, "root")
    }

    getVisible(fl) {
        //console.log("getVisible "+fl+"\n"+this.labels.all_labels_name)
        //console.log(this.labels.all_labels_name.indexOf(fl)!==-1)
        return this.labels.all_labels_name.indexOf(fl)!==-1
    }

    getDistance(fl) {
        // TODO create hash map with flags
        //console.log("getDistance "+fl+"\n"+this.labels.constant_labels)
        const index = this.labels.all_labels_name.indexOf(fl)
        if(index!==-1)
            return this.labels.all_labels[index].p[0]
        // let index = this.labels.constant_labels.findIndex(function (el) {
        //     return el.fl === fl
        // });
        // if(index!==-1)
        //     return this.labels.constant_labels[index].distance
        // else
        // console.log(this.labels.constant_labels[index])

    }

    getAngle(fl) {
        // let index = this.labels.constant_labels.findIndex(function (el) {
        //     return el.fl === fl
        // });
        // return this.labels.constant_labels[index].angle

        const index = this.labels.all_labels_name.indexOf(fl)
        if(index!==-1)
            return this.labels.all_labels[index].p[1]
    }

    kickBallVisible(fl){
        const index = this.labels.all_labels_name.indexOf(fl)
        let angle, v
        if (index !== -1) {
            let minus_speed = Math.pow(this.labels.all_labels[index].p[0], 2) / 30
            // уменьшение скорости на minus_speed для того, чтобы не кидать на большие расстояния
            v = Math.max(100 - minus_speed, 10)
            angle = this.labels.all_labels[index].p[1]
        } else {
            //noy used
            console.log("IM NOT SEEING GOAL")
            //angle = this.getTurnAngle(goal.coords, 45)
            v = 30
        }

        return {n: "kick", v: v, a: angle}
    }

    kickBallInVisible(fl){
        let angle = 45, v= 30
        let goal = getEnemyGoal(this.position)
        //angle = this.getTurnAngle(goal.coords, 45)
        return {n: "kick", v: v, a: angle}
    }

    //sometimes call err "Maximum call stack size"
    getTurnAngle(constantCoords, default_value) {
        if (constantCoords !== undefined /*&& !this.isLastActTurn()/* если есть шанс, что запутался, то идём перебирать*/) {
            return this.getTurnAngle(this.agent.x, this.agent.y, constantCoords.x, constantCoords.y, this.agent.angleRad)
        } else {
            return default_value ? default_value : 30
        }
    }

    getBall(fl){
        const index = this.labels.all_labels_name.indexOf(fl)
        if(index!==-1){
            const distance = this.labels.all_labels[index].p[0]
            return distance <= 5
        }else{
            return false;
        }
    }

    goToGates(fl){
        if(fl == "gr"){
            const index_ = this.labels.all_labels_name.indexOf(fl)
        }

    }


}

module.exports = Manager