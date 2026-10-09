<template>
    <div id="app">
        <modules-headerPage v-if="showHeader" />

        <slot />

        <!-- Точку показывает CSS по классу .has-custom-cursor, который ставит скрипт:
             v-if по media-запросу разошёлся бы с разметкой, отданной сервером -->
        <div id="custom-cursor" ref="cursor" aria-hidden="true"></div>
    </div>
</template>

<script setup>
const route = useRoute()
const showHeader = computed(() => route.meta.header === true)

// На тач-экранах курсора нет — рисовать точку незачем
const hasFinePointer = useMediaQuery('(hover: hover) and (pointer: fine)')

const cursor = useTemplateRef('cursor')

let frameId = 0
let pointerX = 0
let pointerY = 0

/**
 * Своя точка вместо курсора. Координаты кладутся в CSS-переменные и обновляются
 * раз в кадр: запись left/top на каждое движение мыши заставляла бы браузер
 * пересчитывать раскладку сотни раз в секунду.
 */
function render() {
    frameId = 0
    cursor.value?.style.setProperty('--cursor-x', `${pointerX}px`)
    cursor.value?.style.setProperty('--cursor-y', `${pointerY}px`)
}

function onPointerMove(event) {
    pointerX = event.clientX
    pointerY = event.clientY
    if (!frameId) frameId = requestAnimationFrame(render)
}

onMounted(() => {
    if (!hasFinePointer.value) return

    // Класс ставит скрипт: не загрузился — остаётся системный курсор
    document.documentElement.classList.add('has-custom-cursor')
    document.addEventListener('pointermove', onPointerMove, { passive: true })
})

onBeforeUnmount(() => {
    document.removeEventListener('pointermove', onPointerMove)
    document.documentElement.classList.remove('has-custom-cursor')
    if (frameId) cancelAnimationFrame(frameId)
})
</script>
