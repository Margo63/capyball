const Taken = require('../../automaton/taken')
const CTRL_LOW = {
    execute(input, controllers) {
        //console.log("ctrl1")
        //console.log(input)
        const next = controllers[0] //Следующий уровень
        this.taken = Taken.setSee(input, this.team, this.side) //
        //Выделение объектов
        if (this.taken.ball && this.taken.ball.dist < 0.5) // Мяч рядом
            this.taken.canKick = true
        else
            this.taken.canKick = false
        if (next) // Вызов следующего уровня
            return next.execute(this.taken, controllers.slice(1))
    }
}
module.exports = CTRL_LOW