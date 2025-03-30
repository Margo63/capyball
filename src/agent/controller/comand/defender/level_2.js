const {getEnemyGoal, getMyGoal, ball} = require("../../utils/constants");
const ctu = require("../../condTree/tree/utils/condTreeUtils");
const DEF_ROTATE_ANGLE = 30
const DEF_BALLSEEK_ANGLE = 30
const DT_DEFENDER = require('../../condTree/tree/defenderCondTree');
const CommandQueue = require("../../commandQueue");

const CTRL_MIDDLE = {
    getTree(controllers, number) {
        let dt = DT_DEFENDER
        let state = {
            commands_queue: new CommandQueue({act: 'tree', to: "refresh"}),
        }
        switch (number) {
            case 4:
                state.init_commands = [{act: "flag", fl: "fc"}, {act: "kick", fl: ball}]
                state.start_flag = "fc"
                return {dt, state}
            case 5:
                state.init_commands = [{act: "flag", fl: "fp?t"}, {act: "kick", fl: ball}]
                state.start_flag = "fp?t"
                return {dt, state}
            case 6:
                state.init_commands = [{act: "flag", fl: "fp?c"}, {act: "kick", fl: ball}]
                state.start_flag = "fp?c"
                return {dt, state}
            case 7:
                state.init_commands = [{act: "flag", fl: "fp?b"}, {act: "kick", fl: ball}]
                state.start_flag = "fp?b"
                return {dt, state}
            default:
                state.init_commands = [{act: "flag", fl: "fp?b"}, {act: "kick", fl: ball}]
                state.start_flag = "fp?t"
                return {dt, state}
        }
    },
    execute(input, controllers) {

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
}
module.exports = CTRL_MIDDLE