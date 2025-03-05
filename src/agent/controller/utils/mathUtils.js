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
}

module.exports = MathUtils