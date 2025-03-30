const {getBallCoord, getPlayerInfo, isMySide, isEnemySide} = require('../utils/locationUtils');
const {distance} = require('../utils/mathUtils');
const {getFlagInfo, getReverseSide, FLAGS} = require('../utils/constants');
const {amITheClosest, amINeedToKick} = require("../condTree/tree/utils/condTreeUtils")
Taken = {
    ballPrev: undefined,

    setHear(input) {
        this.hear = input
    },
    setSee(input) {
        const see = input.labels
        this.see = see
        this.agent = input.agent
        this.dt = input.dt
        this.state = input.state
        this.start_coords = input.start_coords
        this.isMySide = isMySide(this.agent, this.side, 5)
        this.isEnemySide = isEnemySide(this.agent, this.side, 5)
        this.pos = {
            x: input.agent.x,
            y: input.agent.y
        }
        this.time = see.time
        this.team_name = input.team
        this.side = input.side
        this.amIClosestToBall = amITheClosest(input.labels, input.team)
        this.amINeedToKickBall = amINeedToKick(input.labels, input.team)
        if (see.b_labels.length > 0) {
            const ball = getBallCoord(see.b_labels[0], input.agent)

            if (this.ballPrev === undefined)
                this.ballPrev = {
                    x: ball.x,
                    y: ball.y,
                    f: "b",
                    dist: see.b_labels[0].p[0],
                    angle: see.b_labels[0].p[1]
                }
            else {
                this.ballPrev = this.ball
            }

            this.ball = {
                x: ball.x,
                y: ball.y,
                f: "b",
                dist: see.b_labels[0].p[0],
                angle: see.b_labels[0].p[1]
            }
        } else {
            this.ball = undefined
        }
        let my_team = []
        let enemy_team = []
        if (see.p_labels.length > 0) {
            see.p_labels.forEach(function (player) {
                const player_pos = getPlayerInfo(player, input.agent, false)
                const player_info = {
                    x: player_pos.x,
                    y: player_pos.y,
                    dist: player.p[0],
                    angle: player.p[1],
                    f: `${player.cmd.p[0]}/${player.cmd.p[1]}/${player.cmd.p[2]}`
                }
                if (player.cmd_merged.includes(this.team_name))
                    my_team.push(player_info)
                else
                    enemy_team.push(player_info)
            })
        }
        this.teamOwn = my_team
        this.team = enemy_team
        this.goalOwn = getFlagInfo('g' + this.side, see.constant_labels)
        this.goal = getFlagInfo('g' + getReverseSide(this.side), see.constant_labels)
        return this
    },

    closestToBall() {
        this.team.forEach((value, index) => {
            this.team[index].dist_to_ball = distance(value, this.ball)
        })
        return this.team.sort((a, b) => {
            a.dist_to_ball - b.dist_to_ball
        })
    },

    isPassing() {
        let all_dist = []
        if (this.team)
            this.team.forEach((value, index) => {
                this.team[index].dist_to_ball = distance(value, this.ball)
                all_dist.push({
                        player: this.team[index],
                        side: "enemy"
                    }
                )
            })
        if (this.teamOwn)
            this.teamOwn.forEach((value, index) => {
                this.teamOwn[index].dist_to_ball = distance(value, this.ball)
                all_dist.push({
                        player: this.teamOwn[index],
                        side: "my"
                    }
                )
            })

        return all_dist.sort((a, b) => {
            a.player.dist_to_ball - b.player.dist_to_ball
        })

    }
}

module.exports = Taken