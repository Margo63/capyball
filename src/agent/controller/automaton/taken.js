const {getBallCoord, getEnemyInfo} = require('../utils/locationUtils');
const {FLAGS} = require('../utils/constants');
Taken = {
    ballPrev: undefined,

    setHear(input) {
        //console.log("taken hear"+input)
        this.hear = input
    },
    setSee(input, team, side) {
        const see = input[0]

        //console.log(see.b_labels)
        this.see = see
        this.pos = {
            x: input[1].x,
            y: input[1].y
        }
        this.time = see.time
        this.team_name = team
        this.side = side
        if (see.b_labels.length > 0) {
            const ball = getBallCoord(see.b_labels[0], input[1])

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
        if (see.p_labels.length > 0) {
            let my_team = []
            let enemy_team = []
            //console.log(see.p_labels)
            see.p_labels.forEach(function (player) {
                const player_pos = getEnemyInfo(player, input[1], false)
                if (player.cmd_merged.includes(team))
                    my_team.push({
                        x: player_pos.x,
                        y: player_pos.y,
                        dist: player.p[0],
                        angle: player.p[1],
                        f: `${player.cmd.p[0]}/${player.cmd.p[1]}/${player.cmd.p[2]}`
                    })
                else
                    enemy_team.push({
                        x: player_pos.x,
                        y: player_pos.y,
                        dist: player.p[0],
                        angle: player.p[1],
                        f: `${player.cmd.p[0]}/${player.cmd.p[1]}/${player.cmd.p[2]}`
                    })
            })
            this.teamOwn = my_team
            this.team = enemy_team
            //console.log(my_team)
            //console.log(enemy_team)
        }

        if (side === "l") {
            this.goalOwn = {
                x: FLAGS["gl"].x,
                y: FLAGS["gl"].y,
                f: "gl",
            }
            const index = see.constant_labels.findIndex(function (label) {
                return label.fl === "gl"
            });
            if (index !== -1) {
                this.goalOwn.dist = see.constant_labels[index].distance
                this.goalOwn.angle = see.constant_labels[index].angle
            }

            this.goal = {
                x: FLAGS["gr"].x,
                y: FLAGS["gr"].y,
                f: "gr",
            }
            const index_enemy = see.constant_labels.findIndex(function (label) {
                return label.fl === "gr"
            });
            if (index_enemy !== -1) {
                this.goal.dist = see.constant_labels[index_enemy].distance
                this.goal.angle = see.constant_labels[index_enemy].angle
            }


        } else {
            this.goalOwn = {
                x: FLAGS["gr"].x,
                y: FLAGS["gr"].y,
                f: "gr",
            }
            const index = see.constant_labels.findIndex(function (label) {
                return label.fl === "gr"
            });
            if (index !== -1) {
                this.goalOwn.dist = see.constant_labels[index].distance
                this.goalOwn.angle = see.constant_labels[index].angle
            }

            this.goal = {
                x: FLAGS["gl"].x,
                y: FLAGS["gl"].y,
                f: "gl",
            }
            const index_enemy = see.constant_labels.findIndex(function (label) {
                return label.fl === "gl"
            });
            if (index_enemy !== -1) {
                this.goal.dist = see.constant_labels[index_enemy].distance
                this.goal.angle = see.constant_labels[index_enemy].angle
            }
        }

        //console.log(this.goal)
        return this
    },

    closestToBall() {
        this.team.forEach((value, index) => {
            this.team[index].dist_to_ball = Math.sqrt(Math.pow(value.x - this.ball.x, 2) + Math.pow(value.y - this.ball.y, 2))
        })
        return this.team.sort((a, b) => {
            a.dist_to_ball - b.dist_to_ball
        })
    },

    isPassing() {
        let all_dist = []
        if (this.team)
            this.team.forEach((value, index) => {
                this.team[index].dist_to_ball = Math.sqrt(Math.pow(value.x - this.ball.x, 2) + Math.pow(value.y - this.ball.y, 2))
                all_dist.push({
                        player: this.team[index],
                        side: "enemy"
                    }
                )
            })
        if (this.teamOwn)
            this.teamOwn.forEach((value, index) => {
                this.teamOwn[index].dist_to_ball = Math.sqrt(Math.pow(value.x - this.ball.x, 2) + Math.pow(value.y - this.ball.y, 2))
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