const {FLAGS, getEnemyGoal} = require('./utils/constants');
const {DT} = require('./condTree/constCondTree');
const {mgr} = require('./condTree/mgr');
const {toRadians} = require('./utils/mathUtils');
const {getEnemyInfo, getAgentBestCoordinates} = require('./utils/locationUtils');
const CommandQueue = require("./commandQueue");
const {getTurnAngle, isGoal} = require("./utils/actUtils");

class Controller {
    constructor() {
        this.commandsQueue = new CommandQueue(
            {act: "kick", fl: "b", goal: "gr"},
            {act: "flag", fl: "fct"},
            {act: "flag", fl: "gl"},
            {act: "flag", fl: "fglb"},
            {act: "flag", fl: "fct"},
            {act: "flag", fl: "fplc"},
            {act: "flag", fl: "fprt"},
            {act: "flag", fl: "fplc"},
            {act: "flag", fl: "fprb"},
            {act: "flag", fl: "fplc"},
            {act: "flag", fl: "fc"},
            {act: "flag", fl: "frb"},
            {act: "flag", fl: "gr"},
            {act: "flag", fl: "fc"},
            {act: "flag", fl: "frb"},
            {асt: "flag", fl: "fc"})
        this.act = null
        this.last_act = null
        this.speed = 100
        this.angle = {grad: 0.0, rad: 0.0}
        this.my_coord = {x: 0.0, y: 0.0}
        this.run = false
        this.position = null
        this.id = null
        this.DT = DT
        this.debug = false
    }

    reset_act() {
        if (this.act != null) {
            this.last_act = this.act
            this.act = null
        }
    }

    analyze(msg, cmd, p) {
        // console.log("MSG", msg, "CMD", cmd, "P", p, "ARRAY", p[2].cmd)
        switch (cmd) {
            case "see":
                this.evaluateSee(p)

                break;
            case "hear":
                this.evaluateHear(msg, p)
                break;
            case "sense_body":
                this.evaluateSenseBody(p)
                break;
            case "player_param":
                //TODO
                break;
            case "server_param":
                //TODO
                break;
            case "init":
                this.evaluateInit(p)
                break;
            case "player_type":
                //TODO
                break;
            default:
            //console.log("cmd not found")
        }
        let result = this.act
        this.reset_act()
        return result
    }

    evaluateSee(p) {
        if (this.run) {
            let labels = this.getSeeFlagsAndPreprocessingPSee(p)


            let test = mgr.getAction(this.DT,labels)
            console.log(test)

            this.my_coord = getAgentBestCoordinates(labels.constant_labels, true)

            if (labels.p_labels.length !== 0) {
                const enemy = getEnemyInfo(labels.p_labels[0], this.my_coord, true)
            }
            //this.act = {n: "turn", v: 1}
            this.executeAct(labels)
        }
    }

    evaluateHear(msg, p) {
        if(this.debug) console.log(msg, p)
        switch (p[2]) {
            case "play_on":
                this.run = true
                if(this.debug) console.log("PLAY WAS STARTED!")
                break
            default:
                let isGoalMessage = isGoal(p[2], this.position)
                if (isGoalMessage) {
                    if(this.debug) console.log("GOOAL!!!")
                    if (isGoalMessage.win) {
                        let currentCommand = this.commandsQueue.peek()
                        if (currentCommand && currentCommand.act === 'kick') {
                            this.commandsQueue.dequeue()
                        }
                    } else {
                        if(this.debug) console.log("GOAL...SAD...")
                    }
                }
        }
    }

    evaluateSenseBody(p) {
        for (let i = 1; i < p.length; i++) {
            switch (p[i].cmd) {
                case "speed": {

                }
            }
        }
    }

    evaluateInit(p) {
        this.position = p[0]
        this.id = p[1]
        if(this.debug) console.log("INIT INFO", {side: p[0], number: p[1]})
    }

    getSeeFlagsAndPreprocessingPSee(p, needLog) {

        let all_labels_name = [] // все метки (названия)
        let constant_labels = []  // только метки с объектами, которые есть в константах (их координаты, расстояние до них, угол до них)
        let p_labels = [] // только метки с игроками (вся информация)
        let g_labels = [] // только метки с воротами (вся информация)
        let b_labels = [] // только метки с мячом (вся информация)

        for (let i = 1; i < p.length; i++) {
            p[i].cmd_merged = p[i].cmd.p.join("")
            p[i].cmd_type = p[i].cmd.p[0]
            all_labels_name.push(p[i].cmd_merged)
            switch (p[i].cmd_type) {
                case 'p':
                    p_labels.push(p[i])
                    break
                case 'b':
                    b_labels.push(p[i])
                    break
                case 'g':
                    g_labels.push(p[i])
                    break
            }

            let constantCoords = FLAGS[p[i].cmd_merged]
            if (constantCoords !== undefined) {
                constant_labels.push({
                    fl: p[i].cmd_merged,
                    knownX: constantCoords.x,
                    knownY: constantCoords.y,
                    distance: p[i].p[0],
                    angle: toRadians(parseFloat(p[i].p[1]))
                })
            }
        }
        if (needLog) {
            if(this.debug)  console.log("-------------START----------------", all_labels_name,
                constant_labels,
                p_labels,
                g_labels,
                b_labels, "-------------END----------------")
        }

        return {
            all_labels_name,
            all_labels: p.slice(1),
            constant_labels,
            p_labels,
            g_labels,
            b_labels,
            time: p[0]
        }
    }

    executeAct(labels) {

        if (this.commandsQueue.isEmpty()) {
            if(this.debug)  console.log("NO COMMAND ")
            this.reset_act()
            return  // TODO тут можно бежать к центру поля, например
        }
        let currentCommand = this.commandsQueue.peek()
        if(this.debug) console.log("CURRENT COMMAND ", currentCommand)
        switch (currentCommand.act) {
            case "cmd":
                this.act = currentCommand.cmd
                this.commandsQueue.dequeue()
                break
            default: {
                const index = labels.all_labels_name.indexOf(currentCommand.fl)
                if (index !== -1) {
                    //console.log("CURRENT all_labels ", labels.all_labels[index])
                    switch (currentCommand.act) {
                        case "flag":
                            if (this.goToObject(labels.all_labels[index].p[0], labels.all_labels[index].p[1],
                                3, 10, false, currentCommand)) {
                                this.commandsQueue.dequeue()
                                this.executeAct(labels)
                                return
                            }
                            break
                        case "kick":
                            if (this.goToObject(labels.all_labels[index].p[0], labels.all_labels[index].p[1],
                                1, 10, false, currentCommand)) {
                                this.kickBall(labels, labels.all_labels[index],)
                            }
                            break
                        default:
                            this.reset_act()
                            return
                    }
                } else {
                    let constantCoords = FLAGS[currentCommand.fl]
                    this.act = {n: "turn", v: this.getTurnAngle(constantCoords)}
                    if(this.debug)   console.log("THIS ACT", this.act)
                }
            }
        }
    }

    getTurnAngle(constantCoords, default_value) {
        if (constantCoords !== undefined && !this.isLastActTurn()/* если есть шанс, что запутался, то идём перебирать*/) {
            return getTurnAngle(this.my_coord.x, this.my_coord.y, constantCoords.x, constantCoords.y, this.my_coord.angleRad)
        } else {
            return default_value ? default_value : 30
        }
    }

    goToObject(dist_o, angle_o, goal_dist, goal_angle, needLog, currentCommand) {
        if (dist_o > goal_dist) {
            if (Math.abs(angle_o) > goal_angle) {
                this.act = {n: "turn", v: angle_o}
                if(this.debug) console.log("IM TURN TO", angle_o)
            } else {
                this.act = {n: "dash", v: this.speed}
                if(this.debug)console.log("IM DACH WITH SPEED", this.speed)
            }
            return false // ещё идём
        } else {
            if (needLog) {
                if(this.debug)  console.log("STOP! FIND FLAG", currentCommand.fl)
            }
            return true // пришли
        }
    }

    kickBall(labels, ballInfo) {
        let goal = getEnemyGoal(this.position)
        const index = labels.all_labels_name.indexOf(goal.fl)
        let angle, v
        if (index !== -1) {
            if(this.debug)   console.log("IM SEEING GOAL")
            let minus_speed = Math.pow(labels.all_labels[index].p[0], 2) / 30
            // уменьшение скорости на minus_speed для того, чтобы не кидать на большие расстояния
            v = Math.max(100 - minus_speed, 10)
            angle = labels.all_labels[index].p[1]
        } else {
            if(this.debug) console.log("IM NOT SEEING GOAL")
            angle = this.getTurnAngle(goal.coords, 45)
            v = 30
            if(this.debug)  console.log("ANGLEE", angle)
        }

        this.act = {n: "kick", v: v, a: angle}
        this.commandsQueue.enqueueFront({act: 'cmd', cmd: {n: "turn", v: angle}})
    }

    isLastActTurn() {
        return this.last_act != null && this.last_act.n === 'turn'
    }
}

module
    .exports = Controller