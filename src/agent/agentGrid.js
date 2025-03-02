const Msg = require('../serverCommunication/msg')
const readline = require('readline')

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

    setController(controller){
        this.controller = controller
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
        this.act = this.controller.analyze(msg, cmd, p)
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
            //this.socketSend("turn", `${this.speed}`) //every time turn after game start
        }
    }
}

module.exports = Agent