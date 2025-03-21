const CTRL_MIDDLE = {
    action: "run",
    turnData: "ft0",
    execute(input, controllers) {
        //console.log("ctrl2")
        const next = controllers[0] // Следующий уровень
        switch (this.action) {
            case "run":
                input.cmd = this.run(input)
                break
            case "rotate":
                input.cmd = this.rotate(input)
                break
        }
        input.action = this.action
        if (next) { // Вызов следующего уровня
            const command = next.execute(input, controllers.slice(1))
            if (command) return command
            if (input.newAction) this.action = input.newAction
            return input.cmd
        }
    },

    run(input){
        if(!input.ball){
            this.action = "rotate"
            return {n:"turn", v:45}
        }

        if(input.ball.dist > 0.5){
            return {n: "dash", v:100}
        }

    },
    rotate(input){
        if(!input.ball){
            return {n:"turn", v:45}
        }

        this.action = "run"
        return {n:"dash",v:100}
    },

    actionReturn(input) { //Возврат к своим воротам
        if (!input.goalOwn) return {n: "turn", v: 60}
        if (Math.abs(input.goalOwn.angle) > 10)
            return {n: "turn", v: input.goalOwn.angle}
        if (input.goalOwn.dist > 3)
            return {n: "dash", v: input.goalOwn.dist * 2 + 30}
        this.action = "rotateCenter"
        return {n: "turn", v: 180}
    },
    rotateCenter(input) { // Повернуться к центру
        const index = input.see.constant_labels.findIndex(function(label) {
            return label.fl == "fc"
        });

        if (index===-1) return {n: "turn", v: 60}
        this.action = "seekBall"
        return {n: "turn", v: input.see.constant_labels[index].angle}
    }
    ,
    seekBall(input) {// Осмотр поля
        const index = input.see.constant_labels.findIndex(function(label) {
            return label.fl == "b"
        });

        if (index!==-1) {
            const angle = input.see.constant_labels[index].angle
            if (Math.abs(angle) > 10)
                return {n: "turn", v: angle}
            if (this.turnData == "ft0") this.turnData = "fb0"
            else if (this.turnData == "fb0") {
                this.turnData = "ft0"
                this.action = "rotateCenter"
                return this.rotateCenter(input)
            }

        }
        if (this.turnData == "ft0")
            return {n: "turn", v: this.side == "l" ? -30 : 30}
        if (this.turnData == "fb0")
            return {n: "turn", v: this.side == "l" ? 30 : -30}

        throw `Unexpected state ${JSON.stringify(this)},${JSON.stringify(input)}`
    },
}
module.exports = CTRL_MIDDLE