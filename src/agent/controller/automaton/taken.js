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
        if(see.b_labels.length>0){
            const ball = getBallCoord(see.b_labels[0], input[1])

            if(this.ballPrev === undefined)
                this.ballPrev = {
                    x:ball.x,
                    y:ball.y,
                    f:"b",
                    dist: see.b_labels[0].p[0],
                    angle: see.b_labels[0].p[1]
                }
            else{
                this.ballPrev = this.ball
            }

            this.ball = {
                x:ball.x,
                y:ball.y,
                f:"b",
                dist: see.b_labels[0].p[0],
                angle: see.b_labels[0].p[1]
            }
        }
        if(see.p_labels.length>0){
            let my_team = []
            let enemy_team = []
            //console.log(see.p_labels)
            see.p_labels.forEach(function (player){
                const player_pos = getEnemyInfo(player, input[1], false)
                if(player.cmd_merged.includes(team))
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
            this.teamOwn = enemy_team
            this.team = my_team
            //console.log(my_team)
            //console.log(enemy_team)
        }

        if(side === "l"){
            this.goal = {
                x: FLAGS["gr"].x,
                y: FLAGS["gr"].y,
                f:"gr",
            }
            const index = see.constant_labels.findIndex(function(label) {
                return label.fl === "gr"
            });
            if(index !==-1){
                this.goal.dist = see.constant_labels[index].distance
                this.goal.angle = see.constant_labels[index].angle
            }
        }else{
            this.goal = {
                x: FLAGS["gl"].x,
                y: FLAGS["gl"].y,
                f:"gl",
            }
            const index = see.constant_labels.findIndex(function(label) {
                return label.fl === "gl"
            });
            if(index !==-1){
                this.goal.dist = see.constant_labels[index].distance
                this.goal.angle = see.constant_labels[index].angle
            }
        }

        //console.log(this.goal)
        return this
    }
}

module.exports = Taken