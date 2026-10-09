<template>
    <div class="card card-start" :data-position="positionOf('cardStart')">
        <div class="card__content card-start__content" :style="sceneTiming">
            <!--
                Ник разложен по буквам: из них собирается и выделение заглавных,
                и анимация — заголовок раздвигается именно от них. Скринридеру
                буквы по отдельности не нужны, ему достаётся строка целиком.
            -->
            <h1 class="text-shadow">
                <span class="visually-hidden">{{ NICKNAME }}</span>
                <span class="card-start__letters" aria-hidden="true"><span
                    v-for="(letter, index) in LETTERS"
                    :key="index"
                    :class="{ 'is-capital': letter.isCapital }"
                    :style="{ '--delay': `${letter.delay}ms` }"
                >{{ letter.char }}</span></span>
            </h1>

            <h2 class="card-start__slogan" :style="{ '--delay': `${sloganDelay}ms` }">
                <span class="card-start__slogan-text text-shadow">{{ SLOGAN }}</span>
                <!-- Копии нужны только глазу: строку целиком читалка берёт из первой -->
                <span class="card-start__slogan-ghost" aria-hidden="true">{{ SLOGAN }}</span>
                <span class="card-start__slogan-ghost is-b" aria-hidden="true">{{ SLOGAN }}</span>
            </h2>

            <button
                type="button"
                :style="{ '--reveal-delay': `${revealDelay}ms` }"
                @click="goTo('cardMenu')"
            >Показать больше</button>
        </div>

        <!--
            Что показать, решает CSS, а не v-if: при рендере на сервере ширина
            окна неизвестна, и любая ветка разошлась бы с гидрацией. Холст
            на узких экранах не запускается, а трава лежит фоном в media-запросе
            и на широких экранах не скачивается.
        -->
        <div class="card__background card-start__background" aria-hidden="true">
            <canvas ref="canvas"></canvas>
        </div>

        <div class="card-start__background--mobile" aria-hidden="true"></div>
    </div>
</template>

<script setup>
import { createGrassScene } from '~/utils/grassScene'

const { goTo, positionOf, isOnScreen } = useCards()
const isDesktop = useIsDesktop()
const prefersReducedMotion = usePrefersReducedMotion()

// ── Заголовок ────────────────────────────────────────────────
const NICKNAME = 'ANobodyAndANothing'
const SLOGAN = 'Являясь кем-то, можно забыть, как просто стать никем'

/*
 * Сцена идёт фазами, и каждая следующая стартует, когда предыдущая догорела:
 *
 *   трава и солнце → заглавные «ANAAN» → ник раздвигается → слоган → кнопка
 *
 * Поэтому все задержки считаются здесь, одна от другой, а не расставлены
 * руками: от смены ника или любой длительности разъехалась бы вся цепочка.
 * Длительности уезжают в CSS переменными — чтобы правиться тоже только тут.
 */
const SCENE_LEAD_MS = 200       // фора сцене: трава и солнце появляются первыми
const PHASE_GAP_MS = 100        // пауза между фазами, чтобы они не слипались
const CAPITAL_STEP_MS = 90      // заглавные проявляются одна за другой
const CAPITAL_DURATION_MS = 420
const EXPAND_SPAN_MS = 740      // окно, за которое раскрывается одна волна групп
const LETTER_DURATION_MS = 460
const SLOGAN_DURATION_MS = 760

/**
 * Регистр проверяем вычислением, а не списком букв: ник может смениться,
 * и заглавные в нём встанут на другие места. Array.from считает по символам,
 * а не по UTF-16-единицам.
 */
const CHARS = Array.from(NICKNAME, char => ({ char, isCapital: char !== char.toLowerCase() }))

const capitalCount = CHARS.filter(({ isCapital }) => isCapital).length
const capitalsEnd = SCENE_LEAD_MS + (capitalCount - 1) * CAPITAL_STEP_MS + CAPITAL_DURATION_MS
const expandStart = capitalsEnd + PHASE_GAP_MS

/** Группы строчных между заглавными: для «ANobodyAndANothing» это obody, nd, othing */
const RUNS = (() => {
    const runs = []

    for (let index = 0; index < CHARS.length;) {
        if (CHARS[index].isCapital) { index++; continue }

        let end = index
        while (end < CHARS.length && !CHARS[end].isCapital) end++
        runs.push({ start: index, length: end - index })
        index = end
    }

    return runs
})()

/**
 * Группы раскрываются двумя волнами. Первой идёт самая короткая — она
 * дописывает «And» между заглавными, — и только потом длинные. Все разом
 * выглядело дёргано: двухбуквенная группа тянулась вразвалку на фоне
 * шестибуквенной, и рывок был виден именно на ней.
 *
 * Шаг внутри группы считается от её длины, а не задан одним числом: так
 * группы одной волны раскрываются за одно и то же время. Короткая идёт
 * реже, длинная частит, но заканчивают они вместе.
 */
const shortestRun = Math.min(...RUNS.map(({ length }) => length))

const expandDelays = (() => {
    const delays = new Map()

    RUNS.forEach(({ start, length }) => {
        const waveStart = expandStart
            + (length === shortestRun ? 0 : EXPAND_SPAN_MS + PHASE_GAP_MS)

        // Последняя буква группы стартует так, чтобы догореть ровно к концу окна
        const step = length > 1 ? (EXPAND_SPAN_MS - LETTER_DURATION_MS) / (length - 1) : 0

        for (let offset = 0; offset < length; offset++) {
            delays.set(start + offset, Math.round(waveStart + offset * step))
        }
    })

    return delays
})()

/**
 * Разметка и задержки одинаковы на сервере и в браузере, поэтому сцена
 * целиком лежит в CSS: без JS ник всё равно соберётся.
 */
const LETTERS = (() => {
    let capitals = 0   // сколько заглавных уже проявилось к этому моменту

    return CHARS.map(({ char, isCapital }, index) => ({
        char,
        isCapital,
        delay: isCapital
            ? SCENE_LEAD_MS + capitals++ * CAPITAL_STEP_MS
            : expandDelays.get(index),
    }))
})()

const expandEnd = Math.max(...LETTERS.map(letter => letter.delay)) + LETTER_DURATION_MS

const sceneTiming = {
    '--capital-duration': `${CAPITAL_DURATION_MS}ms`,
    '--letter-duration': `${LETTER_DURATION_MS}ms`,
    '--slogan-duration': `${SLOGAN_DURATION_MS}ms`,
}

const sloganDelay = computed(() => (prefersReducedMotion.value ? 0 : expandEnd + PHASE_GAP_MS))

/** Кнопка появляется ровно тогда, когда сцена дособралась */
const revealDelay = computed(() =>
    prefersReducedMotion.value ? 0 : sloganDelay.value + SLOGAN_DURATION_MS + PHASE_GAP_MS,
)

// ── Поле травы на canvas ─────────────────────────────────────
const canvas = useTemplateRef('canvas')
const scene = shallowRef(null)

useAnimationFrame(
    step => scene.value?.draw(step),
    () => Boolean(scene.value) && isOnScreen('cardStart'),
)

// Размеры холста заданы в пикселях, поэтому сцену нужно собирать заново
// на каждое изменение размера карточки. Запоминаем, на чём она собрана,
// чтобы не пересобирать её впустую.
let builtWidth = 0
let builtHeight = 0
let observer
let resizeTimer

function buildScene() {
    const element = canvas.value
    const card = element?.closest('.card')
    if (!element || !card) return

    // Узкие экраны довольствуются фоновой картинкой: тяжёлая сцена там не видна.
    // Сцену при этом снимаем: окно могли сузить уже после того, как она собралась.
    if (!isDesktop.value) {
        scene.value = null
        builtWidth = 0
        builtHeight = 0
        return
    }

    const width = card.clientWidth
    const height = card.clientHeight
    if (!width || !height || (width === builtWidth && height === builtHeight)) return

    builtWidth = width
    builtHeight = height

    scene.value = createGrassScene(element, { width, height })
}

onMounted(async () => {
    await nextTick()
    buildScene()

    const card = canvas.value?.closest('.card')
    if (!card) return

    // С задержкой: на телефоне адресная строка дёргает высоту на каждой
    // прокрутке, а пересборка заново раскладывает всё поле травы
    observer = new ResizeObserver(() => {
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(buildScene, 200)
    })
    observer.observe(card)
})

onBeforeUnmount(() => {
    clearTimeout(resizeTimer)
    observer?.disconnect()
})
</script>
