const Msg = require('./msg')
const readline = require('readline')

class Agent {
    constructor() {
        this.position = "l" // По умолчанию
        this.run = false // ИГра начата
        this.act = null // Действия
        this.rl = readline.createInterface({// Чтение консоли
            input: process.stdin,
            output: process.stdout

        })
        this.rl.on('line', (input) => { //Обработка строки из консоли
                if (this.run) {// Если игра начата
                    // ДВижения вперед, вправо, влево, удар по мячу
                    if ("w" == input) this.act = {n: "dash", v: 100}
                    if ("d" == input) this.act = {n: "turn", v: 20}
                    if ("a" == input) this.act = {n: "turn", v: -20}
                    if ("s" == input) this.act = {n: "kick", v: 100}
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
        //console.log("4 get message"+msg)

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
        }
    }
}

module.exports = Agent //hero export
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       