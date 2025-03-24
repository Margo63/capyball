const CTRL = {
    getTree(controllers, number) {
        const next = controllers[0]// Следующий уровень
        if (next) { // Вызов следующего уровня
            return next.getTree( controllers.slice(1), number)
        }
    },
    execute(input, controllers) {
        const next = controllers[0]// Следующий уровень
        let result = undefined
        //console.log(input)
        //TODO Выполнение вычислений (result)
        if (next) { // Вызов следующего уровня
            const upper = next.execute(input, controllers.slice(1))
            // TODO Обработка ответа upper (обновление result)
            if (upper !== undefined) {
                result = upper
            } else {
                console.log("empty upper")
            }
        } else {
            console.log("empty")
            result = {n: 'turn', v: 0}
        }
        return result
    }
}
module.exports = CTRL
