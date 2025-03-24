const CommandQueue = require("../../../commandQueue");
const {handleReachedFlag} = require("../utils/condTreeUtils");
const DT = {
    terminate_command: "root",
    state: {
        command: null, // команда
        commands_queue: new CommandQueue()
    },
    root: {
        processCmd(mgr, state, cmd) {
        },
    }
}
module.exports = DT