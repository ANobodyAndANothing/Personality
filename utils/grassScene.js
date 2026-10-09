import { fitCanvas } from '~/composables/useCanvas'

/**
 * Стартовая сцена: поле травы и заходящее солнце.
 *
 * Сцена владеет своим состоянием и ничего не знает ни о Vue, ни о документе:
 * компонент отдаёт ей холст с размерами и раз в кадр просит нарисовать себя.
 *
 * Всё, что движется, умножается на шаг времени: иначе на экране 120 Гц трава
 * качается, а солнце садится вдвое быстрее, чем на 60 Гц, а при просадке
 * кадров сцена уходит в слоумо.
 */

const COLOR = 'rgb(235, 235, 235)'

// Солнце садится по дуге и у горизонта притормаживает.
//
// Останавливает его не SUN_END_ANGLE, а затухание скорости: от
// SUN_SLOWDOWN_FROM солнце проходит ещё около .18 рад и встаёт, не доехав
// до предела, — тот работает страховкой. Поэтому точку остановки двигают
// обе границы сразу: от одного SUN_END_ANGLE не изменится ничего.
const SUN_START_ANGLE = 2.6
const SUN_END_ANGLE = 4.84
const SUN_SLOWDOWN_FROM = 4.64
const SUN_START_SPEED = 0.0015
const SUN_SLOWDOWN_RATE = 0.00002

// Солнце идёт вдвое быстрее травы. Множитель стоит на шаге времени, а не
// на стартовой скорости: торможение начинается с фиксированного угла, и
// разогнанное солнце проскочило бы по дуге дальше — изменился бы путь,
// а не темп.
const SUN_SPEED_SCALE = 2
const SUN_RADIUS = 70
const SUN_ORBIT_X = 400
const SUN_ORBIT_Y = 300

// Травинка
const BLADE_WIDTH = 8
const BLADE_MAX_HEIGHT = 180
const BLADE_HEIGHT_SPREAD = 20
const BLADE_SWAY_MAX = 10
const BLADE_SWAY_SPEED = 0.025

// Травинка: { x, height, sway, swayForward }, где swayForward — клонится ли вправо.
// sway — вещественный: округление развело бы 108 травинок всего по десяти
// стартовым фазам, и они качались бы заметными группами в унисон.

/**
 * @param size объект вида { width, height } в CSS-пикселях
 * @returns объект с методом draw(step) или null, если холст не дал контекст
 */
export function createGrassScene(canvas, size) {
    const fitted = fitCanvas(canvas, size)
    if (!fitted) return null

    const { context } = fitted

    // Ноль переезжает в левый нижний угол: трава растёт вверх, а не вниз
    context.translate(0, size.height)
    context.scale(1, -1)
    context.fillStyle = COLOR
    context.shadowColor = COLOR

    const bladeCount = Math.round(size.width / BLADE_WIDTH) + 20
    const blades = Array.from({ length: bladeCount }, (_, index) => ({
        x: index * (BLADE_WIDTH - 1) + Math.floor(Math.random() * 5) + BLADE_WIDTH - 20,
        height: Math.random() * BLADE_HEIGHT_SPREAD + BLADE_MAX_HEIGHT - BLADE_HEIGHT_SPREAD,
        sway: (Math.random() * 2 - 1) * BLADE_SWAY_MAX,
        swayForward: Math.random() < .5,
    }))

    let sunAngle = SUN_START_ANGLE
    let sunSpeed = SUN_START_SPEED

    function drawSun(step) {
        const sunStep = step * SUN_SPEED_SCALE

        // Ниже нуля скорость опускать нельзя: шаг зависит от длины кадра и
        // нацело в неё не укладывается, так что последний перелетел бы через
        // ноль в минус — и солнце, доехав, поползло бы назад по дуге.
        if (sunAngle > SUN_SLOWDOWN_FROM) sunSpeed = Math.max(0, sunSpeed - SUN_SLOWDOWN_RATE * sunStep)
        if (sunAngle < SUN_END_ANGLE) sunAngle += Math.PI * sunSpeed * sunStep

        context.beginPath()
        context.arc(
            size.width / 1.3 + SUN_ORBIT_X * Math.cos(-sunAngle),
            size.height / 12 + SUN_ORBIT_Y * Math.sin(-sunAngle),
            SUN_RADIUS, 0, Math.PI * 2,
        )
        context.shadowBlur = 15
        context.fill()
    }

    function drawBlade(blade, step) {
        blade.sway += (blade.swayForward ? BLADE_SWAY_SPEED : -BLADE_SWAY_SPEED) * step

        // Дойдя до предела наклона, травинка клонится в другую сторону.
        // Предел проверяем после шага и подрезаем по нему: шаг зависит от
        // длины кадра, и на длинном кадре травинка перескочила бы предел
        // и застряла бы за ним, качаясь вокруг чужой точки.
        if (blade.sway > BLADE_SWAY_MAX) {
            blade.sway = BLADE_SWAY_MAX
            blade.swayForward = false
        } else if (blade.sway < -BLADE_SWAY_MAX) {
            blade.sway = -BLADE_SWAY_MAX
            blade.swayForward = true
        }

        const { x, height, sway } = blade

        context.beginPath()
        // moveTo здесь не обязателен — первая кривая и так открыла бы подпуть
        // в своей первой контрольной точке, — но без него строка читается
        // как опечатка
        context.moveTo(x, 0)
        context.bezierCurveTo(
            x, 0,
            x + 3, height / 1.2,
            x + 6 - BLADE_WIDTH - sway * 5, height + (sway > 0 ? -sway : sway) * 2,
        )
        context.bezierCurveTo(
            x + 9 - sway * 2, height / 1.2 + sway / 3,
            x + 12, height / 2 + sway,
            x + 12, 0,
        )
        context.closePath()
        context.shadowBlur = 5
        context.fill()
    }

    return {
        /** @param step доля кадра при 60 Гц: 1 — обычный кадр, 2 — вдвое более долгий */
        draw(step = 1) {
            context.clearRect(0, 0, size.width, size.height)
            for (const blade of blades) drawBlade(blade, step)
            drawSun(step)
        },
    }
}
