<template>
    <div class="card card-skills" :data-position="positionOf('cardSkills')">
        <div class="card__content card-skills__content">
            <blockquote
                class="card-skills__content-quote text-shadow"
                :class="{ 'card-skills__content-quote--hidden': activeSlide !== 0 }"
            >
                <p>
                    Аналогично тому, как написание картины является искусством для души,
                    так и написание программы является искусством для разума.
                </p>
                <cite class="card-skills__content-quote-author">- Volnik -</cite>
            </blockquote>
        </div>

        <div class="card__background card-skills__background">
            <canvas
                ref="canvas"
                class="card-skills__background-sea"
                aria-hidden="true"
                @pointerdown="onPointerDown"
                @pointermove="onPointerMove"
                @pointerup="onPointerUp"
                @pointercancel="onPointerCancel"
                @pointerleave="onPointerLeave"
                @wheel.passive="scene?.scroll($event.deltaY > 0)"
            ></canvas>
        </div>

        <!-- Содержимое холста недоступно ни с клавиатуры, ни скринридеру,
             поэтому тот же список навыков живёт рядом и всплывает при фокусе -->
        <nav class="card-skills__fallback" aria-label="Список навыков">
            <ul>
                <li v-for="{ skill } in ALL_SKILLS" :key="skill.name">
                    <button type="button" @click="activeSkill = skill">{{ skill.name }}</button>
                </li>
            </ul>
        </nav>

        <modals-modalSkill :skill="activeSkill" @close="activeSkill = null" />

        <modules-controller card="cardSkills" :hide="Boolean(activeSkill)" :controllers="{ right: 'cardMenu' }" />
    </div>
</template>

<script setup>
import { createSeaScene } from '~/utils/seaScene'
import { ALL_SKILLS } from '~/data/skills'

/** Палец сдвинулся дальше — это свайп, а не касание блока */
const TAP_SLOP = 12
/** Дольше — значит не тап, а удержание */
const TAP_TIME_MS = 400
/** Путь, с которого свайп считается пролистыванием слайда */
const SWIPE_DISTANCE = 48

/**
 * Сцена на слабом железе упирается не в ядра, а в площадь заливки,
 * поэтому на узком экране хватит тридцати кадров: шаг анимации считается
 * по времени, так что скорость от этого не меняется, а работы вдвое меньше.
 */
const NARROW_FPS = 30

const { positionOf, isOnScreen } = useCards()
const hasFinePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
const isNarrow = useMediaQuery('(max-width: 560px)')

const activeSkill = ref(null)
const activeSlide = ref(0)

const canvas = useTemplateRef('canvas')
const scene = shallowRef(null)

useAnimationFrame(
    step => scene.value?.draw(step),
    () => Boolean(scene.value) && isOnScreen('cardSkills'),
    { fps: () => (isNarrow.value ? NARROW_FPS : 0) },
)

// ── Ввод ─────────────────────────────────────────────────────
let gesture = null

function onPointerDown(event) {
    canvas.value?.setPointerCapture?.(event.pointerId)

    gesture = {
        id: event.pointerId,
        startX: event.offsetX,
        startY: event.offsetY,
        startedAt: event.timeStamp,
        swiped: false,
    }
}

function onPointerMove(event) {
    // Параллакс ведём только мышью: от касания сцена дёргалась бы рывками
    if (event.pointerType === 'mouse') scene.value?.setPointer(event.offsetX, event.offsetY)

    if (!gesture || gesture.id !== event.pointerId || gesture.swiped) return

    const shiftY = event.offsetY - gesture.startY
    if (Math.abs(shiftY) < SWIPE_DISTANCE) return

    // Палец вверх — уходим глубже, как при прокрутке вниз
    scene.value?.scroll(shiftY < 0)
    gesture.swiped = true
}

function onPointerUp(event) {
    if (!gesture || gesture.id !== event.pointerId) return

    const moved = Math.hypot(event.offsetX - gesture.startX, event.offsetY - gesture.startY)
    const quick = event.timeStamp - gesture.startedAt < TAP_TIME_MS

    if (!gesture.swiped && moved < TAP_SLOP && quick) {
        const skill = scene.value?.hitTest(event.offsetX, event.offsetY)
        if (skill) activeSkill.value = skill
    }

    gesture = null
}

function onPointerCancel() {
    gesture = null
}

function onPointerLeave() {
    gesture = null
    // Курсор ушёл с холста — сцена возвращается в центральное положение
    if (hasFinePointer.value) scene.value?.setPointer(-9999, -9999)
}

// ── Сцена ────────────────────────────────────────────────────
let builtWidth = 0
let builtHeight = 0
let observer
let resizeTimer

function buildScene() {
    const element = canvas.value
    const card = element?.closest('.card')
    if (!element || !card) return

    const width = card.clientWidth
    const height = card.clientHeight
    if (!width || !height || (width === builtWidth && height === builtHeight)) return

    builtWidth = width
    builtHeight = height

    scene.value = createSeaScene(
        element,
        { width, height },
        {
            touch: !hasFinePointer.value,
            onSlideChange: slide => { activeSlide.value = slide },
        },
    )
    // Пересобранная сцена возвращается на тот слайд, где был посетитель
    scene.value?.goToSlide(activeSlide.value)
}

onMounted(async () => {
    await nextTick()
    buildScene()

    const card = canvas.value?.closest('.card')
    if (!card) return

    // Размеры холста заданы в пикселях, поэтому при изменении окна сцену нужно
    // собрать заново. На телефоне адресная строка дёргает высоту на каждой
    // прокрутке, а пересборка перерисовывает все спрайты — поэтому с задержкой.
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
