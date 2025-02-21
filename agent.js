const Msg = require('./msg')
const readline = require('readline')

const Flags = {
    ftl50: {x: -50, y: 39}, ftl40: {x: -40, y: 39},
    ftl30: {x: -30, y: 39}, ftl20: {x: -20, y: 39},
    ftl10: {x: -10, y: 39}, ft0: {x: 0, y: 39},
    ftr10: {x: 10, y: 39}, ftr20: {x: 20, y: 39},
    ftr30: {x: 30, y: 39}, ftr40: {x: 40, y: 39},
    ftr50: {x: 50, y: 39}, fbl50: {x: -50, y: -39},
    fbl40: {x: -40, y: -39}, fbl30: {x: -30, y: -39},
    fbl20: {x: -20, y: -39}, fbl10: {x: -10, y: -39},
    fb0: {x: 0, y: -39}, fbr10: {x: 10, y: -39},
    fbr20: {x: 20, y: -39}, fbr30: {x: 30, y: -39},
    fbr40: {x: 40, y: -39}, fbr50: {x: 50, y: -39},
    flt30: {x: -57.5, y: 30}, flt20: {x: -57.5, y: 20},
    flt10: {x: -57.5, y: 10}, fl0: {x: -57.5, y: 0},
    flb10: {x: -57.5, y: -10}, flb20: {x: -57.5, y: -20},
    flb30: {x: -57.5, y: -30}, frt30: {x: 57.5, y: 30},
    frt20: {x: 57.5, y: 20}, frt10: {x: 57.5, y: 10},
    fr0: {x: 57.5, y: 0}, frb10: {x: 57.5, y: -10},
    frb20: {x: 57.5, y: -20}, frb30: {x: 57.5, y: -30},
    fglt: {x: -52.5, y: 7.01}, fglb: {x: -52.5, y: -7.01},
    gl: {x: -52.5, y: 0}, gr: {x: 52.5, y: 0}, fc: {x: 0, y: 0},
    fplt: {x: -36, y: 20.15}, fplc: {x: -36, y: 0},
    fplb: {x: -36, y: -20.15}, fgrt: {x: 52.5, y: 7.01},
    fgrb: {x: 52.5, y: -7.01}, fprt: {x: 36, y: 20.15},
    fprc: {x: 36, y: 0}, fprb: {x: 36, y: -20.15},
    flt: {x: -52.5, y: 34}, fct: {x: 0, y: 34},
    frt: {x: 52.5, y: 34}, flb: {x: -52.5, y: -34},
    fcb: {x: 0, y: -34}, frb: {x: 52.5, y: -34},
    distance(p1, p2) {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
    },
}

class Agent {
    constructor() {
        this.position = "l" // По умолчанию
        this.run = false // ИГра начата
        this.act = null // Действия
        this.rl = readline.createInterface({// Чтение консоли
            input: process.stdin,
            output: process.stdout

        })
        this.speed = 0
        this.rl.on('line', (input) => { //Обработка строки из консоли
                if (this.run) {// Если игра начата

                    // ДВижения вперед, вправо, влево, удар по мячу
                    if ("w" == input) this.act = {n: "dash", v: 100}
                    if ("d" == input) this.act = {n: "turn", v: 20}
                    if ("a" == input) this.act = {n: "turn", v: -20}
                    if ("s" == input) this.act = {n: "kick", v: 100}

                }else{
                    const data = input.split(" ")
                    if(data.length == 3){
                        this.socketSend("move",data[0]+" "+data[1])
                        //this.act = {n: "turn", v: parseInt(data[2])}
                        this.speed = parseInt(data[2])
                    }

                }

            }
        )


    }
    msgGot(msg) { // Получение сообщения
        //console.log("2 msgGot"+msg)
        let data = msg.toString('utf8') // ПРиведение к строке
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
        if(!data) throw new Error("Parse error\n" + msg)
        // Первое (hear) — начало игры
        if(data.cmd == "hear") this.run = true
        if(data.cmd == "init") this.initAgent(data.p)//init
        this.analyzeEnv(data.msg, data.cmd, data.p) // Обработка
    }
    initAgent(p) {
        if(p[0] == "r") this.position = "r" // Правая половина поля
        if(p[1]) this.id = p[1] // id игрока
    }
    analyzeEnv(msg, cmd, p){// Анализ сообщения
        //console.log("4 get message"+cmd)

        switch(cmd){
            case "see":
                if(this.run){
                    //console.log(this.getCoordinatesAgent(p))
                    for(let i = 1; i<p.length;i++){
                        if(p[i].cmd.p[0]==="p")
                            this.getEnemyCoordinates(p, p[i].cmd)

                    }
                }

                break;
            case "hear":

                break;
            case "sense_body":

                break;
            default:
                console.log("cmd not found")
        }



    }
    sendCmd() {
        if (this.run) { // Идра начата
            if (this.act) { // Есть команда от игрока
                if (this.act.n == "kick") // Пнуть мяч
                    this.socketSend(this.act.n, this.act.v + " 0")
                else // ДВижение и поворот
                    this.socketSend(this.act.n, this.act.v)
            }
            this.act = null // reset comand
            this.socketSend("turn",`${this.speed}`) //every time turn after game start
        }
    }

    getCoordinatesAgent(p){


        let list_x =[]
        let list_y =[]
        let list_distance =[]
        let list_angle =[]
        let list_duplicate = []
        for (let i = 1; i< p.length; i++) {
            const flag = p[i].cmd.p.join("")
            if (Flags[flag] === undefined) {
                console.log(flag)
                continue
            }
            if(list_x.indexOf(Flags[flag].x) === -1 && list_y.indexOf(Flags[flag].y) === -1){
                list_x.push(Flags[flag].x)
                list_y.push(Flags[flag].y)
                list_distance.push(p[i].p[0])
                list_angle.push(p[i].p[1])
            } else {
                //console.log("duplicate")
              list_duplicate.push({x:Flags[flag].x , y:Flags[flag].y, distance: p[i].p[0]})
            }

            if(list_x.length === 3) break;
        }
        if(list_x.length!==3){
            if(list_x.length!==0 ){
                const rad = list_angle[0] * (Math.PI/180)
                return {x:list_x[0] - list_distance[0]*Math.cos(rad),
                        y:list_y[0] - list_distance[0]*Math.sin(rad)}
            }else{
                return {x:-1,y:-1}
            }

            // if(list_x.length === 2){
            //     return {x: (list_x[1]**2-list_x[0]**2+list_distance[0]**2-list_distance[1]**2)/(2*(list_x[1]-list_x[0])),
            //         y:(list_y[1]**2-list_y[0]**2+list_distance[0]**2-list_distance[1]**2)/(2*(list_y[1]-list_y[0]))}
            // }
            // console.log("not three")
            // return {x: 0, y: 0};
        }else{
            const a1 = (list_y[0] - list_y[1])/(list_x[1]-list_x[0])
            const a2 = (list_y[0] - list_y[2])/(list_x[2]-list_x[0])

            const b1 = (list_y[1]**2 - list_y[0]**2 + list_x[1]**2 - list_x[0]**2 + list_distance[0]**2 - list_distance[1]**2)/(2*(list_x[1]-list_x[0]))
            const b2 = (list_y[2]**2 - list_y[0]**2 + list_x[2]**2 - list_x[0]**2 + list_distance[0]**2 - list_distance[2]**2)/(2*(list_x[2]-list_x[0]))

            //console.log(`a1=${a1} a2=${a2} b1=${b1} b2=${b2}`)
            const x = a1*((b1-b2)/(a2-a1))+b1
            const y = (b1-b2)/(a2-a1)

            if(isNaN(x) || Math.abs(x) === Infinity || isNaN(y) || Math.abs(x) === Infinity){
                console.log(`list_x = ${list_x} a1 = ${a1} a2 = ${a2} b1 = ${b1} b2 = ${b2}`)
            }
            return {x: x, y: y}
        }



        // let A = []
        // let b = []
        // const x1 = Flags[p[1].cmd.p.join("")].x
        // const y1 = Flags[p[1].cmd.p.join("")].y
        // const d1 = p[1].p[0]
        //
        // for (let i = 2; i< p.length; i++){
        //     const flag = p[i].cmd.p.join("")
        //     if (Flags[flag]===undefined){
        //         console.log(flag)
        //         continue
        //     }
        //     const xi = Flags[flag].x
        //     const yi = Flags[flag].y
        //     const di = p[1].p[0]
        //     A.push([2*(xi-x1),2*(yi-y1)])
        //     b.push(d1**2 - di**2 + xi**2 - x1**2 + yi**2 - y1**2)
        //     //console.log(`${p[i].p}: ${p[i].cmd.p.join("")}`)
        // }
        // console.log([A,b])

    }

    getEnemyCoordinates(p,enemy_p){
        console.log(enemy_p)
        return {x:0,y:0}
    }




}

module.exports = Agent //hero export
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       