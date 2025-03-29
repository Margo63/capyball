const Taken = require('../../automaton/taken')
const CTRL_LOW = {
    getTree(controllers, number) {
        const next = controllers[0]// Следующий уровень
        if (next) { // Вызов следующего уровня
            return next.getTree(controllers.slice(1), number)
        }
    },
    execute(input, controllers) {
        //console.log("ctrl1")
        //console.log(input)
        const next = controllers[0] //Следующий уровень
        this.taken = Taken.setSee(input) //
        //Выделение объектов
        if (this.taken.ball && this.taken.ball.dist < 1) // Мяч рядом
            this.taken.canKick = true
        else
            this.taken.canKick = false
        if (next) // Вызов следующего уровня
            return next.execute(this.taken, controllers.slice(1))
    }
}
module.exports = CTRL_LOW