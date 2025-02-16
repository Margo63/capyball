const dgram = require('dgram')
module.exports = function(agent, teamName, version){
    //console.log(agent+teamName+version)
    //create socket
    const socket = dgram.createSocket({type:'udp4',reuseAddr:true})
    agent.setSocket(socket) //set socket via agent

    socket.on('message', (msg, info) =>{
        agent.msgGot(msg) // Обработка полученного сообщения
    })
    socket.sendMsg = function (msg){// Отправка сообщения серверу
        console.log(msg)
        socket.send(Buffer.from(msg), 6000, 'localhost', (err,bytes) =>{
            if(err) throw err
            //else console.log("ok")
        })
    }
    // ИНициализация игрока на сервере(без параметра goalie)
    socket.sendMsg(`(init ${teamName} (version ${version}))`)
}