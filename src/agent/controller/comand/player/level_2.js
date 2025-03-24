const {getEnemyGoal, getMyGoal, ball} = require("../../utils/constants");
const ctu = require("../../condTree/tree/utils/condTreeUtils");
const DEF_ROTATE_ANGLE = 30
const DEF_BALLSEEK_ANGLE = 30
const DT_PASSER = require('../../condTree/tree/passerCondTree');
const DT_SCORING = require('../../condTree/tree/forwardCondTree');

const CTRL_MIDDLE = {
    getTree(controllers, number) {
        let dt
        switch (number) {
            case 1:
                dt = DT_PASSER
                dt.state.init_commands = [{act: "flag", fl: "fp?c"}, {act: "kick", fl: ball}]
                dt.state.start_coords = "-25 -10"
                return dt
            case 2:
                dt = DT_PASSER
                dt.state.init_commands = [{act: "flag", fl: "fp?t"}, {act: "kick", fl: ball}]
                dt.state.start_coords = "-25 0"
                return dt
            case 3:
                dt = DT_PASSER
                dt.state.init_commands = [{act: "flag", fl: "fp?b"}, {act: "kick", fl: ball}]
                dt.state.start_coords = "-25 10"
                return dt
            case 4:
                dt = DT_SCORING
                dt.state.init_commands = [{act: "flag", fl: "fp*t"}, {act: "kick", fl: ball}]
                dt.state.start_coords = "25 -10"
                return dt
            case 5:
                dt = DT_SCORING
                dt.state.init_commands = [{act: "flag", fl: "fp*b"}, {act: "kick", fl: ball}]
                dt.state.start_coords = "25 10"
                return dt
            default:
                dt = DT_SCORING
                dt.state.init_commands = [{act: "flag", fl: "fp*b"}, {act: "kick", fl: ball}]
                dt.state.start_coords = "25 10"
                return dt

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