const {getEnemyGoal, getMyGoal, ball} = require("../../utils/constants");
const ctu = require("../../condTree/tree/utils/condTreeUtils");
const DT_FORWARD = require('../../condTree/tree/forwardCondTree');
const CommandQueue = require("../../commandQueue");

const CTRL_MIDDLE = {
    getTree(controllers, number) {
        let dt = DT_FORWARD
        let state = {
            commands_queue: new CommandQueue({act: 'tree', to: "refresh"}),
        }
        switch (number) {
            case 8:
                state.init_commands = [{act: "flag", fl: "fp*t"}, {act: "kick", fl: ball}]
                state.start_flag = "fp*t"
                return {dt, state}
            case 9:
                state.init_commands = [{act: "flag", fl: "fp*c"}, {act: "kick", fl: ball}]
                state.start_flag = "fp*c"
                return {dt, state}
            case 10:
                state.init_commands = [{act: "flag", fl: "fp*b"}, {act: "kick", fl: ball}]
                state.start_flag = "fp*b"
                return {dt, state}
            default:
                state.init_commands = [{act: "flag", fl: "fp*c"}, {act: "kick", fl: ball}]
                state.start_flag = "fp*c"
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
            const enemy_goal = getEnemyGoal(input.side)
            //console.log(enemy_goal.fl+input.side)
            if (ctu.getVisible(enemy_goal.fl, input.see)) {
                //console.log("see goal: "+ctu.getAngle(enemy_goal.fl, input.see))
                return {n: "kick", v: 100, a: ctu.getAngle(enemy_goal.fl, input.see)}; // Бьем по воротам
            }

            if (ctu.getVisible("ft0", input.see)){
                //console.log("see ft0 " +ctu.getAngle("ft0", input.see))
                let a
                if(input.side == "l"){
                    a = 1
                }else{
                    a = -1
                }
                return {n: "kick", v: 10, a: 180+ a*ctu.getAngle("ft0", input.see)}
            }

            if (ctu.getVisible("fb0", input.see)){
                //console.log("see fb0 "+ctu.getAngle("fb0", input.see))
                let a
                if(input.side == "l"){
                    a = -1
                }else{
                    a = 1
                }
                return {n: "kick", v: 10, a: 180+ a*ctu.getAngle("fb0", input.see)}
            }
            let my_goal = getMyGoal(input.side)
            if (ctu.getVisible(my_goal.name, input.see)) {
                //console.log("not fgoal")
                return {n: "kick", v: 10, a: 180-ctu.getAngle(my_goal.name, input.see)}; // Бьем НЕ по воротам
            }


            if (ctu.getVisible("fg" + input.side + 't', input.see)){
                //console.log("see my goal "+"fg" + input.side + 't')
                return {n: "kick", v: 100, a: -180}
            }

            if (ctu.getVisible("fg" + input.side + 'b', input.see)){
                //console.log("see my goal "+"fg" + input.side + 'b')
                return {n: "kick", v: 100, a: -180}
            }

            //console.log("nothing see")
            return {n: "kick", v: 10, a: 90}; // Отбиваем мяч
        }
    },
}
module.exports = CTRL_MIDDLE