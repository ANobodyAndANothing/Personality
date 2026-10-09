// Выше двух точек на пиксель разница на глаз не видна, а работы на кадр
// становится вчетверо больше. Узкий экран получает ещё меньше: холст там
// занимает всю высоту, пикселей выходит больше, а запас по мощности меньше.
const MAX_PIXEL_RATIO = 2
const MAX_PIXEL_RATIO_NARROW = 1.5
const NARROW_WIDTH = 560

export function pixelRatio() {
    const limit = window.innerWidth <= NARROW_WIDTH ? MAX_PIXEL_RATIO_NARROW : MAX_PIXEL_RATIO
    return Math.min(window.devicePixelRatio || 1, limit)
}

/**
 * Готовит canvas к рисованию в CSS-пикселях с учётом плотности экрана:
 * без этого на HiDPI картинка выглядит мыльной.
 *
 * @param size    объект вида { width, height } в CSS-пикселях
 * @param options opaque — холст без альфа-канала: браузер не смешивает его
 *                со страницей на каждый кадр, но фон придётся заливать самому
 * @returns { context, ratio } или null, если холст не дал контекст
 */
export function fitCanvas(canvas, size, { opaque = false } = {}) {
    const context = canvas.getContext('2d', { alpha: !opaque })
    if (!context) return null

    const ratio = pixelRatio()

    canvas.width = Math.round(size.width * ratio)
    canvas.height = Math.round(size.height * ratio)
    canvas.style.width = `${size.width}px`
    canvas.style.height = `${size.height}px`

    // Дальше весь код рисования работает в CSS-пикселях и о плотности не знает
    context.setTransform(ratio, 0, 0, ratio, 0, 0)

    return { context, ratio }
}

/**
 * Холст в памяти для заранее отрисованных кусков сцены.
 *
 * Всё, что не меняет форму от кадра к кадру — свечение, силуэт волны,
 * контур скалы — рисуется сюда один раз, а в кадре остаётся одно drawImage.
 * Это снимает с горячего пути самые дорогие операции: размытие тени
 * и длинные цепочки кривых.
 *
 * @returns { canvas, context, width, height } — размеры в CSS-пикселях
 */
export function createSprite(width, height, ratio) {
    const canvas = document.createElement('canvas')

    canvas.width = Math.max(1, Math.ceil(width * ratio))
    canvas.height = Math.max(1, Math.ceil(height * ratio))

    const context = canvas.getContext('2d')
    context.setTransform(ratio, 0, 0, ratio, 0, 0)

    return { canvas, context, width, height }
}
