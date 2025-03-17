const dgram = require('dgram')
module.exports = function(agent, teamName, version, is_goalie){
    const socket = dgram.createSocket({type:'udp4',reuseAddr:true})
    agent.setSocket(socket) //set socket via agent

    socket.on('message', (msg, info) =>{
        agent.msgGot(msg) // Обработка полученного сообщения
    })
    socket.sendMsg = function (msg){// Отправка сообщения серверу
        socket.send(Buffer.from(msg), 6000, 'localhost', (err,bytes) =>{
            if(err) throw err
        })
    }
    // Инициализация игрока на сервере(без параметра goalie)
    const goalie = is_goalie?"(goalie)":""
    socket.sendMsg(`(init ${teamName} (version ${version}) ${goalie})`)
}