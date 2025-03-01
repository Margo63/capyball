const Flags = {
    ftl50: {x: -50, y: -39}, ftl40: {x: -40, y: -39},
    ftl30: {x: -30, y: -39}, ftl20: {x: -20, y: -39},
    ftl10: {x: -10, y: -39}, ft0: {x: 0, y: -39},
    ftr10: {x: 10, y: -39}, ftr20: {x: 20, y: -39},
    ftr30: {x: 30, y: -39}, ftr40: {x: 40, y: -39},
    ftr50: {x: 50, y: -39}, fbl50: {x: -50, y: 39},
    fbl40: {x: -40, y: 39}, fbl30: {x: -30, y: 39},
    fbl20: {x: -20, y: 39}, fbl10: {x: -10, y: 39},
    fb0: {x: 0, y: 39}, fbr10: {x: 10, y: 39},
    fbr20: {x: 20, y: 39}, fbr30: {x: 30, y: 39},
    fbr40: {x: 40, y: 39}, fbr50: {x: 50, y: 39},
    flt30: {x: -57.5, y: -30}, flt20: {x: -57.5, y: -20},
    flt10: {x: -57.5, y: -10}, fl0: {x: -57.5, y: 0},
    flb10: {x: -57.5, y: 10}, flb20: {x: -57.5, y: 20},
    flb30: {x: -57.5, y: 30}, frt30: {x: 57.5, y: -30},
    frt20: {x: 57.5, y: -20}, frt10: {x: 57.5, y: -10},
    fr0: {x: 57.5, y: 0}, frb10: {x: 57.5, y: 10},
    frb20: {x: 57.5, y: 20}, frb30: {x: 57.5, y: 30},
    fglt: {x: -52.5, y: -7.01}, fglb: {x: -52.5, y: 7.01},
    gl: {x: -52.5, y: 0}, gr: {x: 52.5, y: 0}, fc: {x: 0, y: 0},
    fplt: {x: -36, y: -20.15}, fplc: {x: -36, y: 0},
    fplb: {x: -36, y: 20.15}, fgrt: {x: 52.5, y: -7.01},
    fgrb: {x: 52.5, y: 7.01}, fprt: {x: 36, y: -20.15},
    fprc: {x: 36, y: 0}, fprb: {x: 36, y: 20.15},
    flt: {x: -52.5, y: -34}, fct: {x: 0, y: -34},
    frt: {x: 52.5, y: -34}, flb: {x: -52.5, y: 34},
    fcb: {x: 0, y: 34}, frb: {x: 52.5, y: 34},
    // ll: {x: 52.5}, lt: {y: -34},
    // lb: {y: 34}, lr: {x: -52.5},
    distance(p1, p2) {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
    },
}

const predict = (obj_x, oby_y, obj_angle, target_dist, target_angle) => {
    const angle = -obj_angle + target_angle
    const predX = obj_x + target_dist * Math.cos(angle)
    const predY = oby_y + target_dist * Math.sin(angle)
    return {x: predX, y: predY}
}

const toRadians = (grad) => {
    return grad * Math.PI / 180
}

class Controller {
    constructor() {
        this.comands = [{act: "kick", fl: "b", goal: "gr"},{act: "flag", fl: "frb"}, {act: "flag", fl: "gl"},
            {асt: "flag", fl: "fc"}, ]
        this.done_commands = 0
        this.run = false
        this.act = null
        this.speed = 30
        this.turn_angle = 5
    }

    analyze(msg, cmd, p) {

        switch (cmd) {
            case "see":
                if (this.run) {
                    let see_flags = []
                    for (let i = 1; i < p.length; i++) {
                        p[i].cmd_merged = p[i].cmd.p.join("")
                        see_flags.push(p[i].cmd.p.join(""))
                        p[i].cmd_type = p[i].cmd.p[0]
                    }
                    const coord = this.getMyCoordinates(p)
                    //console.log("MY COORDINATE: ", coord)
                    for (let i = 1; i < p.length; i++) {
                        if (p[i].cmd.p[0] === "p") {
                            const enemy = this.getEnemyInfo(p[i], coord)
                            //console.log("ENEMY", enemy)
                            break
                        }
                    }
                    //console.log(see_flags)
                    const index = see_flags.indexOf(this.comands[this.done_commands].fl)
                    if (index !== -1 ) {
                        //console.log("see flag")

                        if(this.comands[this.done_commands].act == "flag"){
                            //if distance > 3m go to flag or turn
                            if(p[index].p!==undefined && p[index].p[0] > 3){
                                //console.log(p[index].p[1])
                                //if angle to big or distance then turn
                                if(Math.abs(p[index].p[1]) > 30 /*&& p[index].p[0] > 40*/){
                                    this.act = {n: "turn", v: p[index].p[1]}


                                }else{
                                    this.act = {n: "dash", v: this.speed}

                                }

                            }else{
                                console.log("stop: find flag - " + see_flags[index])
                                this.done_commands++
                                if(this.done_commands >= this.comands.length) this.done_commands = 0
                                this.act = {n: "dash", v: 0}
                            }

                        }else if(this.comands[this.done_commands].act == "kick"){
                            if(p[index].p!==undefined && p[index].p[0] > 1){
                                //console.log(p[index].p[1])

                                if(Math.abs(p[index].p[1]) > 20){
                                    this.act = {n: "turn", v: p[index].p[1]}
                                }else{
                                    this.act = {n: "dash", v: this.speed}
                                }

                            }else{
                                console.log("stop: find flag - " + see_flags[index])
                                this.done_commands++
                                if(this.done_commands >= this.comands.length) this.done_commands = 0
                                this.act = {n: "kick", v: 100}
                            }
                        }


                    } else {
                        //console.log("turn")
                        this.act = {n: "turn", v: 10}
                    }




                }
                break;
            case "hear":
                //console.log(msg, p)
                if(p[2]==='play_on') this.run = true;
                break;
            case "sense_body":
                for (let i = 1; i < p.length; i++) {
                    switch (p[i].cmd) {
                        case "speed": {
                            this.angle = toRadians(parseFloat(p[i].p[1]))
                        }
                    }
                }
                break;
            default:
            //console.log("cmd not found")
        }
        return this.act
    }

    getMyCoordinates(visibleObjects) {
        const objects = visibleObjects.slice(1).map(obj => {
            const coord = Flags[obj.cmd_merged];
            if (coord !== undefined)
                return {
                    knownX: coord.x,
                    knownY: coord.y,
                    distance: obj.p[0],
                    angle: toRadians(parseFloat(obj.p[1]))
                };
            else
                return {
                    knownX: 0,
                    knownY: 0,
                    distance: obj.p[0],
                    angle: toRadians(parseFloat(obj.p[1]))
                };
        });

        // Функция для минимизации
        const error = ([X, Y]) => {
            let totalError = 0
            objects.forEach(obj => {
                let predictXY = predict(X, Y, parseFloat(this.angle), obj.distance, obj.angle)
                if (obj.knownX !== undefined) totalError += (predictXY.x - obj.knownX) ** 2
                if (obj.knownY !== undefined) totalError += (predictXY.y - obj.knownY) ** 2
            })
            return totalError
        }
        // Если объектов нет, возвращаем центр поля
        if (objects.length === 0) return {x: 0, y: 0}

        const STEP = 0.5 // Шаг перебора
        let minError = Infinity
        let bestX = 0
        let bestY = 0

        for (let X = -57.0; X <= 57.0; X += STEP) {
            let totalError = error([X, bestY])
            if (totalError < minError) {
                minError = totalError
                bestX = X
            }
        }
        for (let Y = -38.5; Y <= 38.5; Y += STEP) {
            let totalError = error([bestX, Y])
            if (totalError < minError) {
                minError = totalError
                bestY = Y
            }
        }
        return {
            x: Number(bestX),
            y: Number(bestY)
        }
    }

    getEnemyInfo(enemy_p, coord) {
        let predictXY = predict(coord.x, coord.y, parseFloat(this.angle), enemy_p.p[0], toRadians(enemy_p.p[1]))
        return {x: predictXY.x, y: predictXY.y, team: enemy_p.cmd.p[1]}
    }


}
module.exports = Controller