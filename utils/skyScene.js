import { createSprite } from '~/composables/useCanvas'

/**
 * Фон карточки «Проекты»: солнце, планеты и мерцающие звёзды.
 *
 * В отличие от сцен травы и моря эта сцена не владеет холстом. Лента
 * проектов рисуется в тот же контекст поверх неба, и отдельный canvas
 * означал бы второй слой композиции ради почти неподвижного фона.
 *
 * Солнце здесь то же, что на стартовой карточке: белый диск со свечением.
 * Оно стоит ровно в центре холста, и центральный блок ленты приходится
 * прямо на него — блок заливается фоновым цветом, поэтому читается
 * силуэтом на светлом, как затмение.
 *
 * Планеты раскраиваются заново при каждом создании сцены, так что на
 * каждой загрузке страницы небо другое.
 *
 * Всё, что движется, умножается на шаг времени: иначе на экране 120 Гц
 * звёзды мерцают вдвое быстрее, чем на 60 Гц.
 */

const COLOR = '235, 235, 235'
const COLOR_LIGHT = 'rgb(235, 235, 235)'
const COLOR_BACK = 'rgb(15, 15, 15)'

// Звёзды
const STAR_AREA = 2200 // один огонёк на столько пикселей площади
const STAR_LIMIT = 520
const STAR_MIN_ALPHA = .14
const STAR_MAX_ALPHA = .46
const STAR_BIG_CHANCE = .14 // доля огоньков крупнее пикселя
const TWINKLE_SPEED = .012

/**
 * Слои глубины: множитель к сдвигу фона. Солнце дальше всех, поэтому
 * на прокрутку ленты почти не отзывается — этим и читается расстояние.
 */
const STAR_DEPTH = [.18, .38, .7]
const PLANET_DEPTH = [.12, .24]
const SUN_DEPTH = .05

/**
 * Поле звёзд шире холста: при сдвиге оно заворачивается по кругу,
 * а запас уводит шов за край видимой области.
 */
const FIELD_MARGIN = 160

// Солнце — белый диск со свечением, как на стартовой сцене.
//
// Радиус больше стартового: диск стоит ровно по центру, и центральный блок
// ленты приходится прямо на него. При стартовых 70 px от солнца оставались
// бы узкие серпы по краям блока; на крупном диске блок читается
// силуэтом, а солнце — солнцем.
const SUN_RADIUS = 130
const SUN_GLOW = 25

// Планеты
const PLANET_COUNT = 3
const PLANET_RADIUS = [16, 42]
const PLANET_LINES = [2, 5]
/** Планеты держатся от центра дальше, чем столько радиусов солнца */
const PLANET_SUN_CLEAR = 1.7
/** Наименьший просвет между дисками двух планет */
const PLANET_SPACING = 96
/**
 * Наименьший угол между двумя планетами, если смотреть из центра холста.
 *
 * Одного просвета мало: свободное место — это две узкие полосы слева и
 * справа от солнца, и по расстоянию все три планеты спокойно помещаются
 * в одну из них, сбиваясь в кучу у края. Угол разводит их по разным
 * сторонам диска.
 */
const PLANET_ANGLE = Math.PI / 3

/** Какую долю радиуса планете позволено свесить за край холста */
const PLANET_OVERHANG = .5
/** Сколько мест пробуем на каждой ступени требований */
const PLANET_TRIES = 60

/**
 * Насколько слабее становятся требования на последней ступени и сколько
 * этих ступеней. На узком холсте или при неудачно вставших соседях места
 * под полный просвет может не найтись вовсе — тогда он ужимается, но не
 * исчезает: планеты встанут теснее, друг на друга не налезут.
 */
const PLANET_RELAX = .4
const PLANET_RELAX_STEPS = 5

/**
 * Заготовленные стили прозрачности.
 *
 * Мерцание меняет альфу каждый кадр, и строка вида `rgba(…, .317)`
 * собиралась бы заново на каждую звезду в каждом кадре — пять сотен строк
 * на кадр уходили бы в мусор. Глаз разницы между соседними ступенями
 * не видит, поэтому альфа округляется до ближайшей из готовых.
 */
const ALPHA_STEPS = 24
const ALPHA_STYLE = Array.from(
    { length: ALPHA_STEPS + 1 },
    (_, index) => `rgba(${COLOR}, ${(index / ALPHA_STEPS * STAR_MAX_ALPHA).toFixed(3)})`
)

const wrap = (value, limit) => ((value % limit) + limit) % limit

const randomInteger = (min, max) => Math.floor(min + Math.random() * (max + 1 - min))

const randomBetween = (min, max) => min + Math.random() * (max - min)

const distance = (ax, ay, bx, by) => Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2)

/** Разница двух направлений, приведённая к 0..π */
const angleBetween = (first, second) => {
    const diff = Math.abs(first - second) % (Math.PI * 2)

    return diff > Math.PI ? Math.PI * 2 - diff : diff
}

/**
 * Солнце рисуется один раз в холст в памяти: размытие тени — самая дорогая
 * операция сцены, а меняется в нём только положение. Запас по краям спрайта
 * нужен под само свечение, иначе оно обрежется границей холста.
 */
const createSun = (ratio) => {
    const pad = SUN_GLOW * 2
    const size = (SUN_RADIUS + pad) * 2
    const sprite = createSprite(size, size, ratio)
    const { context } = sprite

    context.beginPath()
    context.arc(size / 2, size / 2, SUN_RADIUS, 0, Math.PI * 2)
    context.fillStyle = COLOR_LIGHT
    context.shadowColor = COLOR_LIGHT
    context.shadowBlur = SUN_GLOW
    context.fill()

    return sprite
}

/**
 * Планета: белый диск с кривыми тёмными полосами.
 *
 * Полосы рисуются с запасом за края диска и обрезаются по нему, иначе концы
 * кривой упирались бы в окружность и читались бы как срез, а не как полоса,
 * уходящая за горизонт.
 */
const createPlanet = (radius, ratio) => {
    const sprite = createSprite(radius * 2, radius * 2, ratio)
    const { context } = sprite

    context.beginPath()
    context.arc(radius, radius, radius, 0, Math.PI * 2)
    context.fillStyle = COLOR_LIGHT
    context.fill()
    context.clip()

    const lines = randomInteger(PLANET_LINES[0], PLANET_LINES[1])

    context.strokeStyle = COLOR_BACK
    context.lineCap = 'round'

    for (let index = 0; index < lines; index += 1) {
        // Полосы раскладываем по высоте равномерно и слегка расталкиваем:
        // при чистом рандоме они сбиваются в пучок и диск выглядит полосатым
        // с одного края и пустым с другого
        const base = radius * 2 * (index + 1) / (lines + 1)
        const y = base + randomBetween(-radius * .14, radius * .14)

        context.lineWidth = randomBetween(1.5, 4)
        context.beginPath()
        context.moveTo(-2, y)
        context.quadraticCurveTo(
            radius,
            y + randomBetween(-radius * .45, radius * .45),
            radius * 2 + 2,
            y + randomBetween(-radius * .2, radius * .2)
        )
        context.stroke()
    }

    return sprite
}

/**
 * @param context контекст холста карточки; сцена рисует в него первой
 * @param size    объект вида { width, height } в CSS-пикселях
 * @param ratio   плотность пикселей, с которой настроен контекст
 * @returns объект с методом draw(step, shiftX, shiftY)
 */
export function createSkyScene(context, size, ratio) {
    const field = {
        width: size.width + FIELD_MARGIN * 2,
        height: size.height + FIELD_MARGIN * 2
    }

    const center = { x: size.width / 2, y: size.height / 2 }
    const count = Math.min(STAR_LIMIT, Math.round(field.width * field.height / STAR_AREA))

    // Звезда: { x, y, radius, alpha, phase, speed, depth }, где alpha —
    // её собственный потолок яркости, а phase разводит мерцание по времени:
    // с общей фазой всё небо моргало бы в такт.
    const stars = Array.from({ length: count }, () => ({
        x: Math.random() * field.width,
        y: Math.random() * field.height,
        radius: Math.random() < STAR_BIG_CHANCE ? 1.6 : 1,
        alpha: STAR_MIN_ALPHA + Math.random() * (STAR_MAX_ALPHA - STAR_MIN_ALPHA),
        phase: Math.random() * Math.PI * 2,
        speed: TWINKLE_SPEED * (.5 + Math.random()),
        depth: STAR_DEPTH[randomInteger(0, STAR_DEPTH.length - 1)]
    }))

    /**
     * Планеты расставляются по видимой части холста, а не по всему полю:
     * их всегда ровно PLANET_COUNT и все они попадают в кадр. За край
     * свеситься можно — не больше чем на PLANET_OVERHANG радиуса, — тогда
     * планета читается как уходящая за рамку, а при прокрутке выезжает целиком.
     *
     * Координаты здесь холстовые, FIELD_MARGIN прибавляется уже при отрисовке:
     * так условия расстановки читаются в тех же числах, что и размер карточки.
     */
    const planets = []

    for (let index = 0; index < PLANET_COUNT; index += 1) {
        const radius = randomBetween(PLANET_RADIUS[0], PLANET_RADIUS[1])
        const slack = radius * PLANET_OVERHANG

        // Место подбирается перебором по ступеням: сначала с полным
        // просветом и полным углом, и только если за PLANET_TRIES попыток
        // такого места не нашлось — требования ослабляются на ступень.
        // Из совсем безнадёжных берётся лучшее найденное, чтобы перебор
        // не ушёл в бесконечный цикл
        let best = null
        let found = null

        for (let level = 0; level <= PLANET_RELAX_STEPS && !found; level += 1) {
            const ease = 1 - (1 - PLANET_RELAX) * (level / PLANET_RELAX_STEPS)
            const spacing = PLANET_SPACING * ease
            const minAngle = PLANET_ANGLE * ease

            for (let attempt = 0; attempt < PLANET_TRIES; attempt += 1) {
                const x = randomBetween(-slack, size.width + slack)
                const y = randomBetween(-slack, size.height + slack)
                const direction = Math.atan2(y - center.y, x - center.x)

                // Запас до солнца и до каждой расставленной планеты.
                // Угловую тесноту переводим в пиксели по тому же просвету,
                // иначе две величины не сравнить одним числом
                let clearance = distance(x, y, center.x, center.y) - (SUN_RADIUS * PLANET_SUN_CLEAR + radius)

                for (const placed of planets) {
                    const gap = distance(x, y, placed.x, placed.y) - (placed.radius + radius + spacing)
                    const spread = (angleBetween(direction, placed.direction) - minAngle) / minAngle * spacing

                    clearance = Math.min(clearance, gap, spread)
                }

                if (!best || clearance > best.clearance) best = { x, y, direction, clearance }
                if (clearance > 0) {
                    found = { x, y, direction }

                    break
                }
            }
        }

        const place = found || best

        planets.push({
            x: place.x,
            y: place.y,
            direction: place.direction,
            radius,
            sprite: createPlanet(radius, ratio),
            depth: PLANET_DEPTH[randomInteger(0, PLANET_DEPTH.length - 1)]
        })
    }

    const sun = createSun(ratio)

    const drawSun = (shiftX, shiftY) => {
        const x = center.x + shiftX * SUN_DEPTH
        const y = center.y + shiftY * SUN_DEPTH

        context.drawImage(sun.canvas, x - sun.width / 2, y - sun.height / 2, sun.width, sun.height)
    }

    const drawPlanets = (shiftX, shiftY) => {
        for (const planet of planets) {
            const x = wrap(planet.x + FIELD_MARGIN + shiftX * planet.depth, field.width) - FIELD_MARGIN
            const y = wrap(planet.y + FIELD_MARGIN + shiftY * planet.depth, field.height) - FIELD_MARGIN
            const { sprite } = planet

            context.drawImage(sprite.canvas, x - sprite.width / 2, y - sprite.height / 2, sprite.width, sprite.height)
        }
    }

    const drawStars = (step, shiftX, shiftY) => {
        for (const star of stars) {
            star.phase += star.speed * step

            // Синус гуляет от -1 до 1, но звезда не должна гаснуть насовсем:
            // пропадающие точки читаются как брак отрисовки, а не как мерцание
            const level = star.alpha * (.55 + .45 * Math.sin(star.phase))
            const style = ALPHA_STYLE[Math.round(level / STAR_MAX_ALPHA * ALPHA_STEPS)]

            if (!style) continue

            const x = wrap(star.x + shiftX * star.depth, field.width) - FIELD_MARGIN
            const y = wrap(star.y + shiftY * star.depth, field.height) - FIELD_MARGIN

            context.fillStyle = style

            // Пиксельная звезда — это fillRect: дуга на тот же результат
            // тратит построение пути и сглаживание краёв
            if (star.radius <= 1) {
                context.fillRect(x, y, 1, 1)

                continue
            }

            context.beginPath()
            context.arc(x, y, star.radius, 0, Math.PI * 2)
            context.fill()
        }
    }

    return {
        /**
         * @param step   доля кадра при 60 Гц: 1 — обычный кадр, 2 — вдвое более долгий
         * @param shiftX сдвиг фона по горизонтали: прокрутка ленты и параллакс
         * @param shiftY сдвиг по вертикали
         */
        draw(step = 1, shiftX = 0, shiftY = 0) {
            drawStars(step, shiftX, shiftY)
            drawPlanets(shiftX, shiftY)
            drawSun(shiftX, shiftY)
        }
    }
}
