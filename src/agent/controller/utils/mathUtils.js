class MathUtils {
// Метод для перевода градусов в радианы
    static toRadians(grad) {
        return grad * Math.PI / 180;
    }

// Метод для перевода радиан в градусы
    static toGrad(rad) {
        return (rad * 180) / Math.PI;
    }

    static normGrad(grad) {
        return MathUtils.normAngle(grad, 360)
    }

    static normRad(rad) {
        return MathUtils.normAngle(rad, Math.PI * 2)
    }

    static normAngle(angle, maxAngle) {
        while (angle >= maxAngle / 2) {
            angle -= maxAngle
        }
        while (angle < -maxAngle / 2) {
            angle += maxAngle
        }
        return angle
    }

    static distance(a, b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
    }

    /**
     * Вычисляет третью сторону треугольника по двум сторонам и углу между ними
     * @param {number} a - Длина первой стороны
     * @param {number} b - Длина второй стороны
     * @param {number} angle - Угол между сторонами a и b (в градусах)
     * @returns {number} Длина третьей стороны
     */
    sta

    static getThirdSide(a, b, angle) {
        let angleInRadians = MathUtils.toRadians(angle)
        return Math.sqrt(
            Math.pow(a, 2) +
            Math.pow(b, 2) -
            2 * a * b * Math.cos(angleInRadians)
        );
    }
}

module.exports = MathUtils