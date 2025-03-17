const TA = {
    current: "start", // Текущее состояние автомата
    state: { // Описание состояния
        variables: {dist: null}, // Переменные
        timers: {t: 0}, // Таймеры
        next: true, // Нужен переход на следующее состояние
        synch: undefined, // Текущее Действие
        local: {seeGoal: false}, // Внутренние переменные Для методов
    },
    nodes: { /* УЗЛЫ автомата, в каждом узле: имя и узлы, на которые есть переходы */
        start: {n: "start", e: ["close", "far"]},
        close: {n: "close", e: ["kick"]},
        kick: {n: "kick", e: ["start"]},
        far: {n: "far", e: ["start"]},
    },
    edges:
        {/* Ребра автомата
            (имя каждого ребра указывает
            узел—источник И узел—приемник)
            */
            start_close:
                [{guard: [{s: "lt", l: {v: "dist"}, r: 2}]}],
            /* Список guard описывает перечень условий, проверяемых
            * Для перехода по ребру. Знак lt — меньше, lte — меньше
            * либо равно. B качестве параметров принимаются числа или
            * значения переменных "v" или таймеров "t" */
            start_far:
                [{
                    guard: [{s: "lte", l: 2, r: {v: "dist"},}],

                }],

            /* Событие синхронизации synch вызывает на выполнение
            * соответствующую функцию */
            close_kick:
                [{synch: "kick!"}],
            kick_start:
                [{
                    //synch: "goBack!",
                    assign: [{n: "t", v: 0, type: "timer"}]
                }],
            /* Список assign перечисляет присваивания для переменных
            * "variable" и таймеров "timer" */
            far_start:
                [{
                    guard: [{s: "lt", l: 5, r: {t: "t"}}],
                    synch: "runToBall!",
                    assign: [{n: "t", v: 0, type: "timer"}]
                }, {
                    guard: [{s: "lte", l: {t: "t"}, r: 5}],
                    synch: "ok!"
                }],
            // near_start:
            //     [{
            //         synch: "empty!",
            //         assign: [{n: "t", v: 0, type: "timer"}]
            //     }],
            // near_intercept:
            //     [{synch: "canIntercept?"}],
            // /* Событие синхронизации synch может вызывать
            // * соответствующую function для проверки возможности перехода
            // * по ребру (заканчивается на знак "?") */
            // intercept_start: [{
            //     synch: "runToBall!",
            //     assign: [{n: "t", v: 0, type: "timer"}]
            // }]
        },
    actions:
        {
            init(taken, state) { // ИНициализация игрока
                state.local.goalie = true
                state.local.catch = 0
            },
            beforeAction(taken, state) {
// Действие перед каждым вычислением
                //console.log(taken.goalOwn)
                if (taken.ball) state.variables.dist = taken.ball.dist
                else state.variables.dist = 100
                //else if (taken.goal && taken.goal.dist) state.variables.dist = taken.goal.dist
                // else {
                //     console.log()
                //     return this.goBack(taken, state)
                // }

            },
            kick(taken, state) { // ПИнаем мяч
                //console.log(taken.ball)
                state.next = true
                if (!taken.ball) return {n: "turn", v: 45}
                let dist = taken.ball.dist
                if (dist > 0.5) return {n:"dash", v:20}

                let v=20, angle = 45
                if(taken.goal.dist){
                    if (taken.goal.dist < 30) {
                        v = 100
                    } else {
                        let minus_speed = taken.see.p_labels
                        // уменьшение скорости на minus_speed для того, чтобы не кидать на большие расстояния
                        v = Math.max(100 - minus_speed, 20)
                    }
                    angle = taken.goal.angle
                    console.log(v)
                    return {n: "kick", v: 100, a: angle}

                }else{
                    return {n: "kick", v: 20, a: 45}
                }

                // state.next = true
                // if (!taken.ball) return //{n: "turn", v: 45}
                // let dist = taken.ball.dist
                // // if (dist > 0.5) return //{n:"dash", v:20}
                // let goal = taken.goal
                // let player = taken.teamOwn ? taken.teamOwn[0] : null
                // let target
                // if (goal.dist && player)
                //     target = goal.dist < player.dist ? goal : player
                // else if (goal.dist) target = goal
                // else if (player) target = player
                //
                // if (target) return {n: "kick", v: `${target.dist * 2 + 40} ${target.angle}`}


                return {n: "kick", v: "10 45"}
            },

            lookAround: function (taken, state) { // Осматриваемся
                state.next = false
                state.synch = "lookAround!"
                //return {n: "turn", v: 90}
                if (!state.local.look)
                    state.local.look = "left"
                switch (state.local.look) {
                    case "left":
                        state.local.look = "center";
                        return {n: "turn", v: -60}
                    case "center":
                        state.local.look = "right";
                        return {n: "turn", v: 60}
                    case "right":
                        state.local.look = "back";
                        return {n: "turn", v: 60}
                    case "back":
                        state.local.look = "left"
                        state.next = true
                        state.synch = undefined
                        return {n: "turn", v: -60}
                    default:
                        state.next = true
                }
            },
            canIntercept(taken, state) { //МОжем Добежать первыми
                let ball = taken.ball
                let ballPrev = taken.ballPrev
                state.next = true
                if (!ball) return false
                if (!ballPrev) return true
                if (ball.dist <= ballPrev.dist + 0.5) return true
                return false
            },
            runToBall(taken, state) { // Бежим к мячу
                //console.log("run to ball")
                state.next = false
                let ball = taken.ball
                //console.log(ball)
                if (!ball) return {n: "turn", v: 45}
                if (ball.dist <= 0.5) {
                    state.next = true
                    return
                }
                if (Math.abs(ball.angle) > 10)
                    return {n: "turn", v: ball.angle}
                if (ball.dist < 0.5) {
                    state.next = true
                    return
                }
                return {n: "dash", v: 110}
            },
            ok(taken, state) { // HquPo Делать не надо
                state.next = true;
                //console.log("ok")
                return {n: "turn", v: 0}
            },

            empty(taken, state) {
                state.next = true
            } //ПУстое действие
        }
}
module.exports = TA