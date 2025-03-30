const {normGrad, toGrad} = require("./mathUtils");
const {borders} = require("./constants");

class ActUtils {

    /**
     * Вычисляет угол поворота для игрока, чтобы он смотрел на объект.
     * @param {number} x_p - X-координата объекта.
     * @param {number} y_p - Y-координата объекта.
     * @param {number} x_o - X-координата цели.
     * @param {number} y_o - Y-координата цели.
     * @param {number} p_angle - Текущий угол направления объекта (в градусах).
     * @returns {number} Угол поворота (в градусах).
     */
    static getTurnAngle(x_p, y_p, x_o, y_o, p_angle) {

        // Вектор от игрока к целевой точке
        const dx = x_o - x_p;
        const dy = y_o - y_p;

        // Угол между осью X и вектором (dx, dy)
        const angleToTarget = Math.atan2(dy, dx);

        // Разница между углом к цели и текущим углом игрока
        let turnAngle = angleToTarget - p_angle;

        return normGrad(toGrad(turnAngle));
    }

    /**
     * Вычисляет координаты для удара на заданном расстоянии от ворот.
     * @param {Object} coord_o - Координаты мяча {x, y}.
     * @param {Object} coord_g - Координаты ворот {x, y}.
     * @param {number} dist - Расстояние, на котором нужно расположить точку удара.
     * @returns {Object} Координаты точки удара {x, y}.
     */
    static getCoordForKick(coord_o, coord_g, dist) {
        // Вектор от ворот к мячу
        const dx = coord_g.x - coord_o.x;
        const dy = coord_g.y - coord_o.y;

        // Длина вектора
        const length = Math.sqrt(dx * dx + dy * dy);

        // Нормализация вектора
        const normalizedDx = dx / length;
        const normalizedDy = dy / length;
        // Умножение на расстояние dist
        let x = coord_g.x + normalizedDx * dist;
        let y = coord_g.y + normalizedDy * dist;

        // Ограничение координат границами поля
        x = Math.max(borders.x_min, Math.min(x, borders.x_max));
        y = Math.max(borders.y_min, Math.min(y, borders.y_max));

        return {x, y};
    }

    static isGoal(message, team) {
        const goalRegex = /^goal_([a-zA-Z])_(\d+)$/;

// Регулярное выражение для извлечения x и y
        const match = message.match(goalRegex);

        if (match) {
            // Если сообщение соответствует шаблону "goal_x_y"
            const reg_team = match[1];
            const reg_score = parseInt(match[2], 10);
            return {win: (team === reg_team), score: reg_score}
        } else {
            return false
        }
    }
}

module.exports = ActUtils