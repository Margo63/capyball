const {getEnemyGoal, getMyGoal, ball} = require("../../utils/constants");
const ctu = require("../../condTree/tree/utils/condTreeUtils");
const DEF_ROTATE_ANGLE = 30
const DEF_BALLSEEK_ANGLE = 30
const DT_FORWARD = require('../../condTree/tree/forwardCondTree');

const CTRL_MIDDLE = {
    getTree(controllers, number) {
        let dt = DT_FORWARD
        let state
        switch (number) {
            case 8:

                state.init_commands = [{act: "flag", fl: "fp*t"}, {act: "kick", fl: ball}]
                state.start_flag = "fp*t"
                return {dt, state}
            case 9:
                dt.state.init_commands = [{act: "flag", fl: "fp*c"}, {act: "kick", fl: ball}]
                dt.state.start_flag = "fp*c"
                return {dt, state}
            case 10:
                dt.state.init_commands = [{act: "flag", fl: "fp*b"}, {act: "kick", fl: ball}]
                dt.state.start_flag = "fp*b"
                return {dt, state}
            default:
                state.init_commands = [{act: "flag", fl: "fp*c"}, {act: "kick", fl: ball}]
                state.start_flag = "fp*c"
                return {dt, state}
        }

    },
    execute(input, controllers) {


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
}
module.exports = CTRL_MIDDLE