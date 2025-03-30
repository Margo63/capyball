const {getEnemyGoal, getMyGoal, ball} = require("../../utils/constants");
const ctu = require("../../condTree/tree/utils/condTreeUtils");
const DEF_ROTATE_ANGLE = 30
const DEF_BALLSEEK_ANGLE = 30

const DT_GOALKEEPER = require('../../condTree/tree/goalKeeperCondTree');
const CTRL_MIDDLE = {
    getTree(controllers, number) {

        let dt = DT_GOALKEEPER
        let state
        state.start_coords = "-25 -10"
        return {dt, state}
    },
    execute(input, controllers) {
        //console.log("ctrl3")
        //console.log(input)
        //console.log(input)
        const immediate = this.immediateReaction(input)
        if (immediate) return immediate
        // const defend = this.defendGoal(input)
        // if (defend) return defend

        const next = controllers[0] // Следующий уровень
        if (next) { // Вызов следующего уровня
            return command = next.execute(input, controllers.slice(1))
        }
    },
    immediateReaction(input) { // Немедленная реакция
        if (input.canKick) {
            let enemy_goal = getEnemyGoal(input.side)
            if (ctu.getVisible(enemy_goal.name, input.see)) {
                return {n: "kick", v: 100, a: ctu.getAngle(enemy_goal.name, input.see)}; // Бьем по воротам
            }
            let my_goal = getMyGoal(input.side)
            if (ctu.getVisible(my_goal.name, input.see)) {
                return {n: "kick", v: 100, a: -ctu.getAngle(my_goal.name, input.see)}; // Бьем НЕ по воротам
            }
            if (ctu.getVisible("ft0", input.see))
                return {n: "kick", v: 100, a: ctu.getAngle("ft0", input.see)}
            if (ctu.getVisible("fb0", input.see))
                return {n: "kick", v: 100, a: ctu.getAngle("fb0", input.see)}
            if (ctu.getVisible("fg" + input.side + 't', input.see))
                return {n: "kick", v: 100, a: -180}
            if (ctu.getVisible("fg" + input.side + 'b', input.see))
                return {n: "kick", v: 100, a: -180}

            return {n: "kick", v: 100, a: -ctu.getAngle(ball, input.see)}; // Отбиваем мяч
        }
    },
    defendGoal
        (input) {// Защита ворот
        if (input.ball) {
            const close = input.closestToBall()
            if ((close[0] && close[0].dist_to_ball + 1 > input.ball.dist)
                || !close[0]) {
                this.last = "defend"
                if (Math.abs(input.ball.angle) > 5)
                    return {n: 'turn', v: input.ball.angle}
                return {n: "dash", v: 110}
            }
        }
    },
}
module.exports = CTRL_MIDDLE