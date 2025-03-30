const MathUtils = require('./mathUtils')
const Constants = require("./constants");

class LocationUtils {
    static predict(obj_x, obj_y, target_dist, target_angle) {
        const angle = target_angle;
        const predX = obj_x + target_dist * Math.cos(angle);
        const predY = obj_y + target_dist * Math.sin(angle);
        return {x: predX, y: predY};
    }

    static distance(p1, p2) {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
    }

    static isMySide(agent, side, board = 0) {
        if (side === 'l') {
            return agent.x < board
        }
        if (side === 'r') {
            return agent.x > -board
        }
    }

    static isEnemySide(agent, side, board = 0) {
        if (side === 'l') {
            return agent.x > board
        }
        if (side === 'r') {
            return agent.x < -board
        }
    }

    // Функция для минимизации
    static locationError = ([X, Y], objects) => {
        let totalError = 0
        objects.forEach(obj => {
            if (obj.knownX !== undefined && obj.knownY !== undefined) {

                let predictDistance = LocationUtils.distance({x: X, y: Y}, {x: obj.knownX, y: obj.knownY})
                totalError += (predictDistance - obj.distance) ** 2
            }
        })
        return totalError
    }

    static getAgentBestCoordinates(visibleObjects, needLog) {

        // Если объектов нет, возвращаем центр поля
        if (visibleObjects.length === 0) return {x: 0, y: 0}

        const STEP = 0.5 // Шаг перебора
        let minError = Infinity
        let bestX = 0
        let bestY = 0

        for (let X = -57.0; X <= 57.0; X += STEP) {
            let totalError = LocationUtils.locationError([X, bestY], visibleObjects)
            if (totalError < minError) {
                minError = totalError
                bestX = X
            }
        }
        for (let Y = -38.5; Y <= 38.5; Y += STEP) {
            let totalError = LocationUtils.locationError([bestX, Y], visibleObjects)
            if (totalError < minError) {
                minError = totalError
                bestY = Y
            }
        }

        let x = Number(bestX)
        let y = Number(bestY)
        let angleRad = MathUtils.normRad(LocationUtils.evaluatePlayerAngle(x, y, visibleObjects))
        let angleGrad = MathUtils.toGrad(angleRad)
        if (needLog) {
            console.log("MY COORDINATE: ", {
                x, y, angleRad, angleGrad
            })
        }

        return {
            x, y, angleRad, angleGrad
        }
    }

    static getPlayerInfo(enemy_p, agentCoords, needLog) {
        let predictXY = LocationUtils.predict(agentCoords.x, agentCoords.y, enemy_p.p[0], MathUtils.toRadians(enemy_p.p[1]))

        if (needLog) {
            console.log("MY ENEMY", {x: predictXY.x, y: predictXY.y, team: enemy_p.cmd.p[1]})
        }
        return {x: predictXY.x, y: predictXY.y, team: enemy_p.cmd.p[1]}
    }

    static getBallCoord(ball, agentCoords) {
        let predictXY = LocationUtils.predict(agentCoords.x, agentCoords.y, ball.p[0], MathUtils.toRadians(ball.p[1]))

        // if (needLog) {
        //     console.log("MY ENEMY", {x: predictXY.x, y: predictXY.y, team: ball.cmd.p[1]})
        // }
        return {x: predictXY.x, y: predictXY.y}
    }

    /** НЕ ВСЕГДА РАБОТАЕТ ВЕРНО - НАДО ОТЛАЖИВАТЬ
     * Вычисляет угол объекта на основе его координат и видимых объектов.
     * @param {number} x_p - X-координата объекта.
     * @param {number} y_p - Y-координата объекта.
     * @param {Array} visibleObjects - Список видимых объектов.
     * @returns {number} Угол объекта в радианах (относительно оси Y).
     */
    static evaluatePlayerAngle(x_p, y_p, visibleObjects) {
        let sumSin = 0;
        let sumCos = 0;

        // Проходим по каждому видимому объекту
        for (const obj of visibleObjects) {
            const {knownX, knownY, distance, angle} = obj;

            // Вычисляем вектор от объекта к видимому объекту
            const dx = knownX - x_p;
            const dy = knownY - y_p;

            // Вычисляем угол между осью X и вектором (dx, dy)
            const angleToObject = Math.atan2(dy, dx);

            // Вычисляем предполагаемый угол объекта
            const playerAngle = angleToObject - angle;

            // Преобразуем угол в точку на единичной окружности
            sumSin += Math.sin(playerAngle);
            sumCos += Math.cos(playerAngle);
        }

        // Вычисляем средний угол через арктангенс
        return Math.atan2(sumSin, sumCos);
    }

}

module.exports = LocationUtils