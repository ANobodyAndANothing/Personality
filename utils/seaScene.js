import { fitCanvas, createSprite } from '~/composables/useCanvas'
import { SKILL_SLIDES, SKILL_SLIDES_COUNT } from '~/data/skills'
import { ROCK_SEAWEEDS, ROCK_SEAWEEDS_INSIDE } from '~/data/seaScene'

/**
 * Подводная сцена карточки «Навыки»: волны, блики, рыбы, скала
 * и блоки с названиями технологий.
 *
 * Сцена — обычный модуль без Vue: получает холст, размеры и обратный вызов
 * на смену слайда, а дальше живёт сама. Компоненту остаётся отдать ей
 * события ввода и раз в кадр попросить нарисоваться.
 *
 * Всё, что не меняет форму, отрисовано заранее в холсты в памяти: солнце
 * с его свечением, силуэты четырёх слоёв волн, контур скалы и рыбы каждого
 * размера. В кадре от них остаётся по одному drawImage, поэтому размытие
 * тени и длинные цепочки кривых не попадают на горячий путь — именно они
 * и съедали кадр на слабом железе.
 */

const COLOR_DARK = 'rgb(15, 15, 15)'
const COLOR_LIGHT = 'rgb(235, 235, 235)'
const FONT_FAMILY = '"Open Sans", system-ui, sans-serif'

/** Холст уже этого считаем узким: меняется раскладка и количество мелочей */
const NARROW_SCENE = 560

/** Авторские координаты блоков рассчитаны на карточку такой ширины */
const DESIGN_WIDTH = 700

/** Пикселей за кадр при переезде между слайдами */
const SCROLL_SPEED = 8

/** Чем больше число, тем слабее сцена реагирует на курсор */
const PARALLAX_DAMPING = 15

// Волны
const WAVE_LENGTH = 150
const WAVE_MAX_HEIGHT = 4
const WAVE_LAYER_OFFSET = 10
const WAVE_GLOW = 10
/** Стартовый сдвиг каждого слоя: слои не должны совпадать фазами */
const WAVE_LAYER_START = [0, 51, 154, 0]

// Блики на поверхности воды
const BLICK_LIMIT = 20

// Блоки с названиями навыков
const BLOCK_HIGHLIGHT_STEP = 5
const BLOCK_TONE_DARK = 15
const BLOCK_TONE_LIGHT = 235

// Солнце
const SUN_RADIUS = 100
const SUN_GLOW = 50
/** Отступ центра от правого верхнего угла, в радиусах */
const SUN_INSET = 1.45

// Рыбы
const FISH_HALF_WIDTH = 78
const FISH_HALF_HEIGHT = 24

// Скала
const ROCK_WIDTH = 124
const ROCK_HEIGHT = 742
const ROCK_PAD = 4

// Подсказка о прокрутке
const HINT_MAX = 10
const HINT_PAUSE_MS = 2000

const randomInteger = (min, max) => Math.floor(min + Math.random() * (max + 1 - min))

// Рыба:  { speed, size, forward, x, y } — forward означает «плывёт вправо».
// Блик:  { x, y, delay, progress } — delay считает кадры до появления.

/**
 * @param size    объект вида { width, height } в CSS-пикселях
 * @param options onSlideChange — вызывается при смене слайда;
 *                touch — подсказка рисуется свайпом, а не колесом мыши
 * @returns объект со свойствами:
 *   draw(step)         — нарисовать кадр; step — доля кадра при 60 Гц
 *   setPointer(x, y)   — положение курсора в координатах холста
 *   scroll(down)       — прокрутка на слайд вниз (true) или вверх (false)
 *   goToSlide(slide)   — мгновенный переход, без проезда
 *   hitTest(x, y)      — навык под точкой холста либо null
 *   ...либо null, если холст не дал контекст.
 */
export function createSeaScene(canvas, size, options = {}) {
    // Холст лежит на чёрной подложке карточки, так что альфа-канал ему не нужен:
    // без него браузер не смешивает каждый кадр со страницей
    const fitted = fitCanvas(canvas, size, { opaque: true })
    if (!fitted) return null

    const { context, ratio } = fitted
    const { width, height } = size

    const narrow = width < NARROW_SCENE
    const scale = Math.min(1, width / DESIGN_WIDTH)

    const blockFontSize = Math.max(15, Math.round(24 * scale))
    const blockHeight = Math.max(22, Math.round(30 * scale))
    const blockRadius = Math.max(7, Math.round(10 * scale))

    const blickCount = narrow ? 10 : 20
    const fishPerSlide = narrow ? 3 : 5

    const sunRadius = Math.round(SUN_RADIUS * scale)
    const sunGlow = SUN_GLOW * scale
    const sunX = width - sunRadius * SUN_INSET
    const sunY = sunRadius * SUN_INSET

    context.fillStyle = COLOR_DARK
    context.strokeStyle = COLOR_LIGHT
    context.lineWidth = 1
    context.font = `${blockFontSize}px ${FONT_FAMILY}`
    context.textAlign = 'center'

    const waveTopOffset = height / 2

    // ── Состояние ────────────────────────────────────────────
    // Далеко за пределами холста: пока мышь не двигалась, подсветка не ловится
    let pointerX = -9999
    let pointerY = -9999
    let parallaxX = 0
    let parallaxY = 0

    let activeSlide = 0
    let previousSlide = 0
    let scrollOffsetY = 0
    /** -1 — едем к следующему слайду, 1 — к предыдущему, 0 — стоим */
    let scrollDirection = 0

    // 'grow' | 'shrink' | 'pause'
    let hintPhase = 'grow'
    let hintValue = 1

    const waveDrift = [...WAVE_LAYER_START]
    const blicks = new Map()
    const fishes = new Map()
    /** Яркость подсветки блока: это состояние наведения, а не часть данных о навыке */
    const blockHighlight = new Map()

    // Копии, а не сами данные: водоросли качаются, меняя свои поля,
    // а исходный объект один на всё приложение
    const cloneGroups = groups =>
        groups.map(group => ({ ...group, seaweeds: group.seaweeds.map(weed => ({ ...weed })) }))

    const seaweedsOutside = cloneGroups(ROCK_SEAWEEDS)
    const seaweedsInside = cloneGroups(ROCK_SEAWEEDS_INSIDE)

    /** Слайд виден, если он активен или если мы как раз с него уезжаем */
    const isVisible = slide =>
        slide === activeSlide || (scrollDirection !== 0 && slide === previousSlide)

    // ── Раскладка блоков ─────────────────────────────────────
    /**
     * Координаты и подпись каждого блока. На широком холсте берутся авторские
     * значения (отрицательные отсчитываются от правого и нижнего края),
     * на узком блоки раскладываются колонкой с чередующимся отступом:
     * исходные координаты рассчитаны на пропорции карточки и за край не влезают.
     */
    const layout = new Map()

    for (let slide = 1; slide < SKILL_SLIDES_COUNT; slide++) {
        const list = SKILL_SLIDES[slide]
        const gap = height / (list.length + 1)

        list.forEach((skill, index) => {
            const label = narrow ? (skill.short ?? skill.name) : skill.name

            const place = narrow
                ? {
                    x: index % 2 ? width * .5 : width * .12,
                    y: gap * (index + 1) - blockHeight / 2,
                }
                : {
                    x: skill.position.x < 0 ? width + skill.position.x : skill.position.x,
                    y: skill.position.y < 0 ? height + skill.position.y : skill.position.y,
                }

            layout.set(skill, {
                ...place,
                label,
                width: context.measureText(label).width + blockRadius,
            })
        })
    }

    // ── Заранее отрисованные куски ───────────────────────────
    function buildSun() {
        const pad = sunGlow + 4
        const sprite = createSprite((sunRadius + pad) * 2, (sunRadius + pad) * 2, ratio)
        const center = sunRadius + pad

        sprite.context.fillStyle = COLOR_LIGHT
        sprite.context.strokeStyle = COLOR_LIGHT
        sprite.context.lineWidth = 1
        sprite.context.shadowColor = COLOR_LIGHT
        sprite.context.shadowBlur = sunGlow

        sprite.context.beginPath()
        sprite.context.arc(center, center, sunRadius, 0, Math.PI * 2, true)
        sprite.context.closePath()
        sprite.context.stroke()
        sprite.context.fill()

        return { sprite, offset: center }
    }

    /**
     * Полоса с волнистым краем на всю ширину холста плюс запас по периоду.
     * Слой смещается только по горизонтали, поэтому в кадре достаточно
     * сдвинуть эту полосу и залить прямоугольником воду под ней.
     */
    function buildWave(layer) {
        const amplitude = WAVE_MAX_HEIGHT + 6 * layer
        const period = WAVE_LENGTH * 2
        const stripWidth = width + period * 2
        const baseline = WAVE_GLOW + amplitude
        const stripHeight = baseline + amplitude + WAVE_GLOW + 2

        const sprite = createSprite(stripWidth, stripHeight, ratio)
        const { context: sc } = sprite

        sc.fillStyle = COLOR_DARK
        sc.strokeStyle = COLOR_LIGHT
        sc.lineWidth = 1
        sc.shadowColor = COLOR_LIGHT
        sc.shadowBlur = WAVE_GLOW

        sc.beginPath()
        sc.moveTo(0, baseline)

        for (let x = 0; x < stripWidth; x += WAVE_LENGTH) {
            // Гребни и впадины чередуются, дальние слои волнуются сильнее
            const crest = (x / WAVE_LENGTH) % 2 ? amplitude : -amplitude

            sc.bezierCurveTo(
                x, baseline,
                x + WAVE_LENGTH / 2, baseline + crest,
                x + WAVE_LENGTH, baseline,
            )
        }

        sc.lineTo(stripWidth, stripHeight)
        sc.lineTo(0, stripHeight)
        sc.closePath()
        sc.stroke()
        sc.fill()

        return { sprite, baseline, period, height: stripHeight }
    }

    function buildRock() {
        const sprite = createSprite(ROCK_WIDTH, ROCK_HEIGHT, ratio)
        const { context: sc } = sprite
        const ox = ROCK_PAD
        const oy = ROCK_PAD

        sc.fillStyle = COLOR_DARK
        sc.strokeStyle = COLOR_LIGHT
        sc.lineWidth = 1

        const crack = points => {
            sc.beginPath()
            sc.moveTo(ox + points[0][0], oy + points[0][1])
            for (let index = 1; index < points.length; index++) {
                sc.lineTo(ox + points[index][0], oy + points[index][1])
            }
            sc.stroke()
        }

        // Контур скалы
        sc.beginPath()
        sc.moveTo(ox + 43, oy + 11)
        sc.bezierCurveTo(ox + 36, oy + 3, ox + 19, oy, ox + 1, oy)
        sc.lineTo(ox + 1, oy + 733)
        sc.bezierCurveTo(ox + 37, oy + 715, ox + 46, oy + 669, ox + 46, oy + 648)
        sc.bezierCurveTo(ox + 80, oy + 589, ox + 85, oy + 481, ox + 82, oy + 430)
        sc.bezierCurveTo(ox + 95, oy + 399, ox + 103, oy + 359, ox + 108, oy + 322)
        sc.bezierCurveTo(ox + 112, oy + 287, ox + 114, oy + 254, ox + 114, oy + 233)
        sc.bezierCurveTo(ox + 103, oy + 235, ox + 84, oy + 221, ox + 88, oy + 152)
        sc.bezierCurveTo(ox + 91, oy + 83, ox + 77, oy + 65, ox + 70, oy + 65)
        sc.bezierCurveTo(ox + 67, oy + 66, ox + 63, oy + 65, ox + 59, oy + 63)
        sc.bezierCurveTo(ox + 53, oy + 59, ox + 48, oy + 50, ox + 49, oy + 31)
        sc.bezierCurveTo(ox + 49, oy + 22, ox + 47, oy + 15, ox + 43, oy + 11)
        sc.closePath()
        sc.fill()
        sc.stroke()

        // Трещины в верхней части
        crack([[20, 40], [25, 65], [40, 75]])
        crack([[45, 110], [55, 115], [60, 135]])
        crack([[25, 150], [40, 170], [30, 195]])

        // Нижняя часть: на верхних слайдах она всё равно далеко за кадром
        crack([[65, 230], [75, 250], [90, 255]])
        crack([[30, 310], [50, 360], [70, 370]])

        // Цветок на уступе
        sc.beginPath()
        sc.moveTo(ox + 50, oy + 360)
        sc.bezierCurveTo(ox + 60, oy + 340, ox + 40, oy + 340, ox + 50, oy + 360)
        sc.bezierCurveTo(ox + 50, oy + 340, ox + 75, oy + 345, ox + 50, oy + 360)
        sc.bezierCurveTo(ox + 60, oy + 345, ox + 80, oy + 355, ox + 50, oy + 360)
        sc.bezierCurveTo(ox + 70, oy + 370, ox + 80, oy + 350, ox + 50, oy + 360)
        sc.stroke()

        sc.beginPath()
        sc.moveTo(ox + 82, oy + 430)
        sc.bezierCurveTo(ox + 80, oy + 435, ox + 70, oy + 445, ox + 70, oy + 450)
        sc.stroke()

        crack([[0, 470], [30, 500], [50, 500]])
        crack([[60, 560], [50, 580]])

        return sprite
    }

    /** Рыбы различаются только размером и направлением — силуэтов выходит немного */
    const fishSprites = new Map()

    function fishSprite(fishSize, forward) {
        const key = `${fishSize}|${forward ? 1 : 0}`
        const cached = fishSprites.get(key)
        if (cached) return cached

        const sprite = createSprite(FISH_HALF_WIDTH * 2, FISH_HALF_HEIGHT * 2, ratio)
        const { context: sc } = sprite
        const x = FISH_HALF_WIDTH
        const y = FISH_HALF_HEIGHT
        const s = fishSize
        // Направление задаёт знак всех смещений — рыба рисуется зеркально
        const way = forward ? -1 : 1

        sc.fillStyle = COLOR_DARK
        sc.strokeStyle = COLOR_LIGHT
        sc.lineWidth = 1

        sc.beginPath()

        // Туловище
        sc.moveTo(x + way * s, y)
        sc.bezierCurveTo(
            x + way * (5 + s), y - 15 + s,
            x + way * (35 - s), y - 15 + s,
            x + way * (50 - s), y,
        )
        sc.bezierCurveTo(
            x + way * (35 - s), y + 15 - s,
            x + way * 5, y + 15 - s,
            x + way * s, y,
        )
        sc.fill()

        // Хвост
        sc.moveTo(x + way * (50 - s), y)
        sc.bezierCurveTo(
            x + way * (65 - s), y - 15 + s,
            x + way * (70 - s), y - 15 + s,
            x + way * (60 - s), y,
        )
        sc.bezierCurveTo(
            x + way * (70 - s), y + 15 - s,
            x + way * (65 - s), y + 15 - s,
            x + way * (50 - s), y,
        )
        sc.fill()

        // Глаз: чем крупнее рыба, тем меньше зрачок относительно тела
        const eyeX = x + way * (13 + s / 4)
        const eyeY = y - 3 + s / 4
        sc.moveTo(eyeX + 3, eyeY)
        sc.arc(eyeX, eyeY, 3 - s / 10, 0, Math.PI * 2, true)

        // Жабры
        sc.moveTo(x + way * 22, y - 6 + s / 3)
        sc.bezierCurveTo(
            x + way * 25, y - 2,
            x + way * 25, y + 2,
            x + way * 22, y + 6 - s / 3,
        )

        // Верхний плавник
        sc.moveTo(x + way * 18, y - 12 + s)
        sc.bezierCurveTo(
            x + way * 24, y - 20 + s,
            x + way * 24, y - 20 + s,
            x + way * 25, y - 12 + s,
        )

        // Нижний плавник
        sc.moveTo(x + way * 28, y + 10 - s / 1.5)
        sc.bezierCurveTo(
            x + way * 36, y + 18 - s / 1.5,
            x + way * 36, y + 18 - s / 1.5,
            x + way * 35, y + 8 - s / 1.5,
        )

        sc.stroke()

        fishSprites.set(key, sprite)
        return sprite
    }

    const sun = buildSun()
    const waves = [1, 2, 3, 4].map(buildWave)
    const rock = buildRock()

    // ── Рыбы ─────────────────────────────────────────────────
    function spawnFish(slide, initial) {
        const forward = Math.random() < .5

        return {
            speed: randomInteger(50, 200),
            size: randomInteger(0, 8),
            forward,
            // При первом появлении рыбы рассыпаны по всей ширине,
            // дальше заплывают из-за края
            x: initial ? randomInteger(0, width) : (forward ? -100 : width),
            y: height * slide + randomInteger(50, height - 50),
        }
    }

    for (let slide = 1; slide < SKILL_SLIDES_COUNT; slide++) {
        fishes.set(slide, Array.from({ length: fishPerSlide }, () => spawnFish(slide, true)))
    }

    function drawFish(school, slide, index, step) {
        const fish = school[index]

        // Уплывшую за край рыбу заменяем новой у противоположного края
        if (fish.forward ? fish.x > width + 50 : fish.x < -50) {
            school[index] = spawnFish(slide, false)
            return
        }

        const y = scrollOffsetY + fish.y - parallaxY / 2
        const x = fish.x - parallaxX / 2

        fish.x += (fish.forward ? fish.speed / 100 : -fish.speed / 100) * step

        const sprite = fishSprite(fish.size, fish.forward)
        context.drawImage(
            sprite.canvas,
            x - FISH_HALF_WIDTH, y - FISH_HALF_HEIGHT,
            sprite.width, sprite.height,
        )
    }

    // ── Блики ────────────────────────────────────────────────
    function spawnBlick(slide, from) {
        return {
            x: randomInteger(0, width),
            y: slide === 0 ? randomInteger(from, height) : randomInteger(from, from + height),
            delay: randomInteger(0, 40),
            progress: 0,
        }
    }

    /** Все блики слайда — один контур и одна обводка вместо двадцати */
    function drawBlicks(slide, step) {
        // На заставке блики держатся у горизонта, на слайдах — по всей глубине
        const from = slide === 0 ? (height / 4.8) * 3 : height * slide

        let list = blicks.get(slide)
        if (!list) {
            list = Array.from({ length: blickCount }, () => spawnBlick(slide, from))
            blicks.set(slide, list)
        }

        context.beginPath()

        for (let index = 0; index < list.length; index++) {
            const blick = list[index]

            if (blick.delay > 0) {
                blick.delay -= step
                continue
            }

            blick.progress += .6 * step
            if (blick.progress > BLICK_LIMIT * 2) {
                list[index] = spawnBlick(slide, from)
                continue
            }

            const y = blick.y - parallaxY + scrollOffsetY
            const x = blick.x - parallaxX
            // Блик сначала вытягивается вправо, потом подтягивает за собой левый край
            const tail = blick.progress >= BLICK_LIMIT ? blick.progress - BLICK_LIMIT : 0
            const head = Math.min(blick.progress, BLICK_LIMIT)

            context.moveTo(x + tail, y)
            context.lineTo(x + head, y)
        }

        context.stroke()
    }

    // ── Небо и вода ──────────────────────────────────────────
    function drawSun() {
        const x = sunX - parallaxX / 7
        const y = sunY - parallaxY / 7

        context.drawImage(
            sun.sprite.canvas,
            x - sun.offset, y - sun.offset,
            sun.sprite.width, sun.sprite.height,
        )
    }

    function drawWaves(step) {
        for (let index = 0; index < waves.length; index++) {
            const layer = index + 1
            const wave = waves[index]

            // Смещение заворачивается по периоду рисунка, поэтому подмены не видно
            waveDrift[index] = (waveDrift[index] + (.15 + .1 * layer) * step) % wave.period

            const layerParallaxX = -parallaxX * (layer / 3)
            const layerParallaxY = -parallaxY * (layer / 3)
            const lineY = waveTopOffset + WAVE_LAYER_OFFSET * layer + layerParallaxY + scrollOffsetY

            const stripY = lineY - wave.baseline
            context.drawImage(
                wave.sprite.canvas,
                -wave.period + waveDrift[index] + layerParallaxX, stripY,
                wave.sprite.width, wave.sprite.height,
            )

            // Толща воды под полосой: заливка дешевле, чем замыкать контур кривыми
            const bodyY = stripY + wave.height
            if (bodyY < height) context.fillRect(0, bodyY, width, height - bodyY + 10)
        }
    }

    /** Подсказка о прокрутке: колесо мыши либо свайп пальцем */
    function drawHint(step) {
        switch (hintPhase) {
            case 'grow':
                hintValue += .5 * step
                if (hintValue >= HINT_MAX) hintPhase = 'shrink'
                break

            case 'shrink':
                hintValue -= .2 * step
                if (hintValue <= 0) {
                    hintPhase = 'pause'
                    setTimeout(() => { hintPhase = 'grow' }, HINT_PAUSE_MS)
                }
                break
        }

        const centerX = width / 2
        const bottom = height + scrollOffsetY

        if (options.touch) {
            // Два шеврона, съезжающих вниз
            const top = bottom - 56 + hintValue

            for (const offset of [0, 10]) {
                context.beginPath()
                context.moveTo(centerX - 9, top + offset)
                context.lineTo(centerX, top + offset + 8)
                context.lineTo(centerX + 9, top + offset)
                context.stroke()
            }

            return
        }

        // Корпус
        context.beginPath()
        context.arc(centerX, bottom - 45, 10, 0, Math.PI, true)
        context.arc(centerX, bottom - 30, 10, Math.PI, 0, true)
        context.closePath()
        context.stroke()
        context.fill()

        // Точка, съезжающая вниз
        context.beginPath()
        context.arc(centerX, bottom - 45 + hintValue, 1, 0, Math.PI, true)
        context.arc(centerX, bottom - 40 + hintValue, 1, Math.PI, 0, true)
        context.closePath()
        context.stroke()
    }

    // ── Блоки навыков ────────────────────────────────────────
    /** Прямоугольник блока на экране с учётом слайда и параллакса */
    function blockRect(skill, slide) {
        const place = layout.get(skill)

        return {
            x: place.x - parallaxX / 4,
            y: place.y - parallaxY / 4 + height * slide + scrollOffsetY,
            width: place.width,
            label: place.label,
        }
    }

    function drawBlock(skill, slide, step) {
        const rect = blockRect(skill, slide)

        // Под курсором блок наливается светом, вне — гаснет обратно
        const hovered =
            rect.x - blockRadius < pointerX && pointerX < rect.x + rect.width + blockRadius &&
            rect.y - blockRadius < pointerY && pointerY < rect.y + blockHeight + blockRadius

        const current = blockHighlight.get(skill.name) ?? BLOCK_TONE_DARK
        const tone = hovered
            ? Math.min(BLOCK_TONE_LIGHT, current + BLOCK_HIGHLIGHT_STEP * step)
            : Math.max(BLOCK_TONE_DARK, current - BLOCK_HIGHLIGHT_STEP * step)
        blockHighlight.set(skill.name, tone)

        const fill = Math.round(tone)
        context.fillStyle = `rgb(${fill}, ${fill}, ${fill})`

        // Скруглённый прямоугольник вокруг подписи
        context.beginPath()
        context.arc(rect.x, rect.y, blockRadius, Math.PI, -Math.PI / 2, false)
        context.lineTo(rect.x, rect.y - blockRadius)
        context.arc(rect.x + rect.width, rect.y, blockRadius, -Math.PI / 2, 0, false)
        context.lineTo(rect.x + rect.width + blockRadius, rect.y + blockHeight)
        context.arc(rect.x + rect.width, rect.y + blockHeight, blockRadius, 0, Math.PI / 2, false)
        context.lineTo(rect.x + rect.width, rect.y + blockHeight + blockRadius)
        context.arc(rect.x, rect.y + blockHeight, blockRadius, Math.PI / 2, Math.PI, false)
        context.lineTo(rect.x - blockRadius, rect.y)
        context.closePath()
        context.fill()
        context.stroke()

        // Подпись всегда контрастна подложке
        const textTone = BLOCK_TONE_LIGHT - fill
        context.fillStyle = `rgb(${textTone}, ${textTone}, ${textTone})`
        context.fillText(rect.label, rect.x + rect.width / 2, rect.y + blockHeight / 2 + blockRadius)

        context.fillStyle = COLOR_DARK
    }

    // ── Скала ────────────────────────────────────────────────
    /** Стебли одной группы собираются в общий контур: обводка одна на всех */
    function addSeaweed(baseX, baseY, group, step) {
        if (!isVisible(group.slide)) return

        let x = baseX + group.position.x
        const y = baseY + group.position.y

        group.seaweeds.forEach((weed, index) => {
            // Стебли растут веером: каждый следующий чуть правее предыдущего
            x += index / 2

            // Дойдя до предела, стебель начинает клониться в другую сторону
            if (weed.deviation <= -weed.deviationMax || weed.deviation >= weed.deviationMax) {
                weed.deviationDirection = !weed.deviationDirection
            }
            weed.deviation += (weed.deviationDirection ? .02 : -.02) * step

            if (weed.rotate <= -weed.rotateMax || weed.rotate >= weed.rotateMax) {
                weed.rotateDirection = !weed.rotateDirection
            }
            weed.rotate += (weed.rotateDirection ? .02 : -.02) * step

            const { deviation, rotate } = weed
            const stem = weed.height / 6

            context.moveTo(x, y)
            context.bezierCurveTo(
                x + rotate / 6, y - stem,
                x + deviation + rotate / 5, y - stem * 2,
                x + rotate / 4, y - stem * 3,
            )
            context.bezierCurveTo(
                x - deviation + rotate / 3, y - stem * 4,
                x - deviation + rotate / 2, y - stem * 5,
                x + rotate, y - stem * 6,
            )
        })
    }

    function drawRock(step) {
        const baseX = -10 + (-parallaxX / 8)
        const baseY = height - 50 + scrollOffsetY + (height / 4) * 3 + (-parallaxY / 8)

        // Водоросли снаружи уходят под камень, внутренние лежат поверх
        context.beginPath()
        for (const group of seaweedsOutside) addSeaweed(baseX, baseY, group, step)
        context.stroke()

        context.drawImage(rock.canvas, baseX - ROCK_PAD, baseY - ROCK_PAD, rock.width, rock.height)

        context.beginPath()
        for (const group of seaweedsInside) addSeaweed(baseX, baseY, group, step)
        context.stroke()
    }

    // ── Кадр ─────────────────────────────────────────────────
    function advanceScroll(step) {
        if (scrollDirection === 0) return

        scrollOffsetY += (scrollDirection > 0 ? SCROLL_SPEED : -SCROLL_SPEED) * step

        const target = -activeSlide * height
        const arrived = scrollDirection > 0 ? scrollOffsetY >= target : scrollOffsetY <= target

        if (!arrived) return

        // Ставим точно в цель: иначе за много переездов накапливается сдвиг
        scrollOffsetY = target
        scrollDirection = 0
        previousSlide = activeSlide
    }

    return {
        draw(step = 1) {
            // Холст без альфа-канала нечем «очистить» в цвет фона — заливаем сами
            context.fillStyle = COLOR_DARK
            context.fillRect(0, 0, width, height)

            parallaxX = pointerX < 0 ? 0 : (pointerX - width / 2) / PARALLAX_DAMPING
            parallaxY = pointerX < 0 ? 0 : (pointerY - height / 2) / PARALLAX_DAMPING

            advanceScroll(step)

            if (isVisible(0)) {
                drawSun()
                drawWaves(step)
                drawBlicks(0, step)
                drawHint(step)
            }

            for (let slide = 1; slide < SKILL_SLIDES_COUNT; slide++) {
                if (!isVisible(slide)) continue

                const school = fishes.get(slide)
                if (school) {
                    for (let index = 0; index < school.length; index++) {
                        drawFish(school, slide, index, step)
                    }
                }

                drawBlicks(slide, step)
                for (const skill of SKILL_SLIDES[slide]) drawBlock(skill, slide, step)
            }

            drawRock(step)
        },

        setPointer(x, y) {
            pointerX = x
            pointerY = y
        },

        scroll(down) {
            // Пока идёт переезд, новую прокрутку не принимаем
            if (scrollDirection !== 0) return

            const next = down ? activeSlide + 1 : activeSlide - 1
            if (next < 0 || next >= SKILL_SLIDES_COUNT) return

            previousSlide = activeSlide
            activeSlide = next
            scrollDirection = down ? -1 : 1
            options.onSlideChange?.(activeSlide)
        },

        goToSlide(slide) {
            if (slide === activeSlide || slide < 0 || slide >= SKILL_SLIDES_COUNT) return

            previousSlide = activeSlide
            activeSlide = slide
            scrollOffsetY = -slide * height
            scrollDirection = 0
            options.onSlideChange?.(activeSlide)
        },

        hitTest(x, y) {
            for (const skill of SKILL_SLIDES[activeSlide]) {
                const rect = blockRect(skill, activeSlide)

                if (
                    rect.x - blockRadius < x && x < rect.x + rect.width + blockRadius &&
                    rect.y - blockRadius < y && y < rect.y + blockHeight + blockRadius
                ) return skill
            }

            return null
        },
    }
}
