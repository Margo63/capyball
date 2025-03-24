const CTRL_HIGH = {
    execute(input) {
        //console.log("ctrl3")
        //console.log(input)
        const immediate = this.immediateReaction(input)
        if (immediate) return immediate
        const passing = this.passing(input)
        if (passing) return passing
        if (this.last === "passing")
            input.newAction = "return"
        this.last = "previous"
    },
    immediateReaction(input) { // Немедленная реакция
        if (input.canKick) {
            this.last = "kick"
            if (input.goal){
                console.log(input.goal.angle)
                return {n: "kick", v: `110 ${input.goal.angle}`}
            }

            return {n: "kick", v: `10 45`}
        }
    },
    passing(input) {
        if (input.ball && input.teamOwn) {

            const players = input.isPassing()
            if (players && players[0].side === "my" && players[0].player.dist_to_ball < input.ball.dist) {
                this.last = "passing"
                if (Math.abs(input.ball.angle) > 5)
                    return {n: 'turn', v: input.ball.angle}
                return {n: "dash", v: 110}

            }
        }
    },
}
module.exports = CTRL_HIGH