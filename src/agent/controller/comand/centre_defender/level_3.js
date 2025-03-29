const {distance} = require("../../utils/locationUtils");
const {FLAGS, getEnemyGoal} = require("../../utils/constants");
const {getTurnAngle} = require("../../utils/actUtils");
const CTRL_HIGH = {
    execute(input) {
        let dt = input.dt

        function executeTree(dt, title) {
            let current_title = title

            while (current_title !== dt.terminate_command) {
                //console.log(current_title)
                const action = dt[current_title]
                if (typeof action.exec == "function") {
                    action.exec(input, dt.state)
                }
                current_title = action.next(input, dt.state)
            }
            return dt.state.command
        }

        return executeTree(dt, "root")
    },
}
module.exports = CTRL_HIGH