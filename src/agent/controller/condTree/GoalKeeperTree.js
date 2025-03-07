const FL = "flag", KI = "kick"

const DT = {
    state: {
        next: 0,
        sequence: [{act: FL, fl: 'gc'}],
        command: null
    },
    sendCommand: {
        command: (mgr, state) => state.command,
    },
    root: {
        condition: (mgr) => mgr.getBall("b"),
        trueCond: "ballClose",
        falseCond: "ballFar"
    },
    ballClose:{

    },

    ballFar:{
        condition:(mgr)=> mgr.getVisible("gr") && mgr.getDistance("gr")>5,
        trueCond: "goToGates",
        falseCond: "root"
    },
    goToGates:{
        condition:(mgr)=> mgr.getDistance("gr")<5,
        trueCond: "turnToGates",
        falseCond: "gatesFar"
        // exec(mgr, state) {
        //     state.action = {act: FL, fl: 'gc'};
        //     state.command = null
        // },
        // next: "goalVisible"
    },

    turnToGates:{
        exec(mgr, state) {//add rotate from controller
            state.command = {n: "turn", v: "180"}
        },
        next:"sendCommand"
    },

    gatesFar:{
        condition:(mgr)=> mgr.getAngle("gr")>4,
        trueCond: "rotateToGoal",
        falseCond:"runToGoal"
    },
    rotateToGoal: {
        exec(mgr, state) {
            state.command = {n: "turn", v: mgr.getAngle("gr")}
        },
        next: "sendCommand"
    }
    ,
    runToGoal: {
        exec(mgr, state) {
            state.command = {n: "dash", v: 70}
        },
        next: "sendCommand"
    },




}
module.exports = DT