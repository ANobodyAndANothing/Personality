/** Опорная частота: шаг анимации считается в долях кадра при 60 Гц */
const BASE_FRAME_MS = 1000 / 60

/** Дольше этого считать паузу не имеет смысла — вкладка была свёрнута */
const MAX_DELTA_MS = 64

/**
 * Цикл requestAnimationFrame, привязанный к жизни компонента и к условию.
 * Повторно не запускается, останавливается сразу по смене условия
 * и отменяет запланированный кадр при размонтировании.
 *
 * В `frame` приходит шаг времени в долях кадра при 60 Гц: единица — обычный
 * кадр, двойка — вдвое более долгий. Если двигать сцену на этот множитель,
 * скорость перестаёт зависеть от частоты экрана: на 120 Гц анимация больше
 * не летит вдвое быстрее, а при просадке не превращается в слоумо.
 *
 * @param frame   что рисовать раз в кадр, получает шаг времени
 * @param enabled функция-условие: пока возвращает true, цикл крутится
 * @param options fps — верхний предел частоты: число либо функция, 0 — без предела
 */
export function useAnimationFrame(frame, enabled, { fps = 0 } = {}) {
    let frameId = 0
    let lastTime = 0

    const frameLimit = typeof fps === 'function' ? fps : () => fps

    const loop = (time) => {
        frameId = requestAnimationFrame(loop)

        const limit = frameLimit()
        const minInterval = limit ? 1000 / limit : 0

        // Лишние кадры пропускаем, не сбрасывая отсчёт: иначе при пределе в 30
        // кадров браузер всё равно считал бы каждый кадр экрана.
        // Запас в миллисекунду страхует от дробления интервалов.
        // Первый кадр рисуем всегда: без него отсчёт не с чего начать,
        // и цикл будет пропускать кадры до бесконечности.
        if (lastTime && minInterval && time - lastTime < minInterval - 1) return

        const elapsed = lastTime ? time - lastTime : BASE_FRAME_MS
        lastTime = time
        frame(Math.min(elapsed, MAX_DELTA_MS) / BASE_FRAME_MS)
    }

    function start() {
        // Второй цикл на тот же кадр удваивает скорость анимации
        if (frameId || !import.meta.client) return

        lastTime = 0
        frameId = requestAnimationFrame(loop)
    }

    function stop() {
        if (!frameId) return

        cancelAnimationFrame(frameId)
        frameId = 0
    }

    watch(computed(enabled), isEnabled => (isEnabled ? start() : stop()))

    // Срабатывает и на размонтирование, и на ручную остановку области видимости
    onScopeDispose(stop)

    return { start, stop }
}
