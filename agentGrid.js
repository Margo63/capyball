const Msg = require('./msg')
const readline = require('readline')

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

class Agent {
    constructor() {
        this.position = "l" // По умолчанию
        this.run = false // Игра начата
        this.act = null // Действия
        this.rl = readline.createInterface({// Чтение консоли
            input: process.stdin,
            output: process.stdout

        })
        this.angle = 0.0
        this.speed = 0
        console.log("Write X Y Speed")
        this.rl.on('line', (input) => { //Обработка строки из консоли
                if (this.run) {// Если игра начата

                    // Движения вперед, вправо, влево, удар по мячу
                    if ("w" == input) this.act = {n: "dash", v: 100}
                    if ("d" == input) this.act = {n: "turn", v: 20}
                    if ("a" == input) this.act = {n: "turn", v: -20}
                    if ("s" == input) this.act = {n: "kick", v: 100}
                } else {

                    const data = input.split(" ")
                    if (data.length == 3) {
                        this.socketSend("move", data[0] + " " + data[1])
                        //this.act = {n: "turn", v: parseInt(data[2])}
                        this.speed = parseInt(data[2])
                    }
                }
            }
        )
    }

    msgGot(msg) { // Получение сообщения
        //console.log("2 msgGot"+msg)
        let data = msg.toString('utf8') // Приведение к строке
        this.processMsg(data) // Разбор сообщения
        this.sendCmd() // Отправка команды
    }

    setSocket(socket) { //Настройка сокета
        this.socket = socket
    }

    socketSend(cmd, value) {// Отправка команды
        //console.log("1 send msg: "+`(${cmd} ${value})`)
        this.socket.sendMsg(`(${cmd} ${value})`)
    }

    processMsg(msg) { // Обработка сообщения
        //console.log("3 processMsg:"+msg)
        let data = Msg.parseMsg(msg) // Разбор сообщения
        if (!data) throw new Error("Parse error\n" + msg)
        // Первое (hear) — начало игры
        if (data.cmd == "hear") this.run = true
        if (data.cmd == "init") this.initAgent(data.p)//init
        this.analyzeEnv(data.msg, data.cmd, data.p) // Обработка
    }

    initAgent(p) {
        if (p[0] == "l") this.position = "l" // Правая половина поля
        if (p[1]) this.id = p[1] // id игрока
    }

    analyzeEnv(msg, cmd, p) {// Анализ сообщения
        switch (cmd) {
            case "see":
                if (this.run) {
                    for (let i = 1; i < p.length; i++) {
                        p[i].cmd_merged = p[i].cmd.p.join("")
                        p[i].cmd_type = p[i].cmd.p[0]
                    }
                    const coord = this.getMyCoordinates(p)
                    console.log("MY COORDINATE: ", coord)
                    for (let i = 1; i < p.length; i++) {
                        if (p[i].cmd.p[0] === "p") {
                            const enemy = this.getEnemyInfo(p[i], coord)
                            console.log("ENEMY", enemy)
                            break
                        }
                    }
                }
                break;
            case "hear":
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
    }

    sendCmd() {
        if (this.run) { // Игра начата
            if (this.act) { // Есть команда от игрока
                if (this.act.n == "kick") // Пнуть мяч
                    this.socketSend(this.act.n, this.act.v + " 0")
                else // Движение и поворот
                    this.socketSend(this.act.n, this.act.v)
            }
            this.act = null // reset comand
            this.socketSend("turn", `${this.speed}`) //every time turn after game start
        }
    }

    getMyCoordinates(visibleObjects) {
        const objects = visibleObjects.slice(1).map(obj => {
            const coord = Flags[obj.cmd_merged];
            return {
                knownX: coord?.x,
                knownY: coord?.y,
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

module.exports = Agent