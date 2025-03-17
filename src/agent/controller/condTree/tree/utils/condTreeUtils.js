const {getEnemyGoal} = require("../../../utils/constants");
const CommandQueue = require("../../../commandQueue");

class CondTreeUtils {

    static FL = "flag" // {act: FL, fl: "frb"}
    static KI = "kick" // {act: "kick", fl: "b", goal: "gl"}
    static CMD = "cmd" // {act: 'cmd', cmd: {n: "turn", v: angle}}
    static TR = "tree" // {act: 'tree', to: "refresh"}
    static GT = "gate" // {act: "gate"}
    static PR = "protect" // {act: "protect", fl: "b"}
    static TM = "teammate" // {act: "teammate"}
    static root_exec(mgr, state, default_action) {
        if (state.commands_queue.isEmpty()) {
            console.log("Query is empty")
            // как только придёт новая цель - он переключится на неё.
            // А пока пусть выполняет дефолтную роль
            state.action = default_action
            return
        }
        state.action = state.commands_queue.peek();
        state.prev_command = state.command
        if (state.action.act === CondTreeUtils.CMD) {
            state.commands_queue.dequeue();
            state.command = state.action.cmd
        } else {
            state.command = null
        }
    }

    static handleReachedFlag(state, flag) {
        let queue = state.commands_queue
        if (!queue.isEmpty() && queue.peek().act === "flag" && queue.peek().fl === flag) {
            queue.dequeue()
        }
    }

    static refresh_queue = (state, init_commands) => {
        state.commands_queue.clear()
        state.commands_queue.enqueue(...init_commands)
    }
    static is_last_turn = (state) => this.is_last_command(state, "turn")

    static is_last_command = (state, command) => state.prev_command && state.prev_command.n === command
}

module.exports = CondTreeUtils