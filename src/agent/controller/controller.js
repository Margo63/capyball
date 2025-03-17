const {FLAGS, getEnemyGoal} = require('./utils/constants');

const Manager = require('./condTree/mgr');
const {toRadians} = require('./utils/mathUtils');
const {getEnemyInfo, getAgentBestCoordinates} = require('./utils/locationUtils');
const CommandQueue = require("./commandQueue");
const {getTurnAngle, isGoal} = require("./utils/actUtils");

class Controller {
    constructor(DT, teamName) {
        this.act = null
        this.last_act = null
        this.speed = 100
        this.angle = {grad: 0.0, rad: 0.0}
        this.my_coord = {x: 0.0, y: 0.0}
        this.run = false
        this.position = null
        this.team_name = teamName
        this.id = null
        this.DT = DT
        this.debug = false
        this.mgr = new Manager(this.team_name)
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


            this.my_coord = getAgentBestCoordinates(labels.constant_labels, false)

            if (labels.p_labels.length !== 0) {
                const enemy = getEnemyInfo(labels.p_labels[0], this.my_coord, false)
            }
            //this.act = {n: "turn", v: 1}
            this.executeAct(labels)
        }
    }

    evaluateHear(msg, p) {
        let processDTCmd = (cmd) => this.DT.root.processCmd(this.mgr, this.DT.state, cmd)
        if (this.debug) console.log(msg, p)
        console.log("IM HERERE", msg, p)
        switch (p[2]) {
            case "play_on":
                if (!this.run) {
                    this.run = true
                    processDTCmd(p[2])
                    if (this.debug) console.log("PLAY WAS STARTED!")
                }
                break
            default:
                let isGoalMessage = isGoal(p[2], this.position)
                if (isGoalMessage) {
                    this.run = false
                    if (isGoalMessage.win) {
                        if (this.debug) console.log("GOOAL!!!")
                        processDTCmd("win_goal")
                    } else if (this.debug) {
                        console.log("GOAL...SAD...")
                    }
                } else {
                    processDTCmd(p[2])
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
        if (this.debug) console.log("INIT INFO", {side: p[0], number: p[1]})
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
            if (this.debug) console.log("-------------START----------------", all_labels_name,
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
        this.act = this.mgr.getAction(this.DT, labels, this.my_coord, this.position, this.id)
    }
}

module.exports = Controller