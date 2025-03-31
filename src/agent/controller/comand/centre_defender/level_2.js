const {getEnemyGoal, getMyGoal, ball} = require("../../utils/constants");
const ctu = require("../../condTree/tree/utils/condTreeUtils");
const DT_CENTER_DEFENDER = require('../../condTree/tree/centerDefenderCondTree');
const DT_SCORING = require('../../condTree/tree/forwardCondTree');
const CommandQueue = require("../../commandQueue");
const isMySide = require('../../utils/locationUtils')
const CTRL_MIDDLE = {
    getTree(controllers, number) {
        let dt = DT_CENTER_DEFENDER
        let state = {
            commands_queue: new CommandQueue({act: 'tree', to: "refresh"}),
        }
        switch (number) {
            case 1:
                state.init_commands = [{act: "flag", fl: "fct"}, {act: "kick", fl: ball}]
                state.start_flag = "fct"
                return {dt, state}
            case 2:
                state.init_commands = [{act: "flag", fl: "fc"}, {act: "kick", fl: ball}]
                state.start_flag = "fc"
                return {dt, state}
            case 3:
                state.init_commands = [{act: "flag", fl: "fcb"}, {act: "kick", fl: ball}]
                state.start_flag = "fcb"
                return {dt, state}
            default:
                state.init_commands = [{act: "flag", fl: "fc"}, {act: "kick", fl: ball}]
                state.start_flag = "fc"
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
                return {n: "kick", v: 100, a: 180 - ctu.getAngle(my_goal.name, input.see)}; // Бьем НЕ по воротам
            }

            if (ctu.getVisible("ft0", input.see)) {
                if (isMySide(input.agent, input.side)) {
                    let a
                    if (input.side == "l") {
                        a = 45
                    } else {
                        a = -45
                    }
                    return {n: "kick", v: 100, a: ctu.getAngle("ft0", input.see) + a}

                }

                let a
                if (input.side == "l") {
                    a = 1
                } else {
                    a = -1
                }
                return {n: "kick", v: 10, a: 180 + a * ctu.getAngle("ft0", input.see)}
            }

            if (ctu.getVisible("fb0", input.see)) {
                if (isMySide(input.agent, input.side)) {

                    let a
                    if(input.side == "l"){
                        a = -45
                    }else{
                        a = 45
                    }
                    return {n: "kick", v: 100, a: ctu.getAngle("fb0", input.see)+a}
                }

                let a
                if (input.side == "l") {
                    a = -1
                } else {
                    a = 1
                }
                return {n: "kick", v: 10, a: 180 + a * ctu.getAngle("fb0", input.see)}

            }

            if (ctu.getVisible("fg" + input.side + 't', input.see))
                return {n: "kick", v: 100, a: -180}
            if (ctu.getVisible("fg" + input.side + 'b', input.see))
                return {n: "kick", v: 100, a: -180}

            return {n: "kick", v: 100, a: -ctu.getAngle(ball, input.see)}; // Отбиваем мяч
        }
    },
}
module.exports = CTRL_MIDDLE