<template>
    <div class="card card-projects" :data-position="positionOf('cardProjects')">
        <modules-controller
            card="cardProjects"
            :hide="controllerHide"
            :controllers="{
                left: 'cardMenu',
            }"
        />
        
        <canvas
            class="card-projects__canvas"
            ref="canvas"
            id="canvas-projects"

            @pointerdown="handlePointerDown"
            @pointermove="handlePointerMove"
            @pointerup="handlePointerUp"
            @pointercancel="handlePointerUp"
            @pointerleave="handlePointerLeave"
            @wheel.prevent="handleWheel"
        ></canvas>
    </div>
</template>

<script setup>
import { createSprite } from '~/composables/useCanvas'
import { createSkyScene } from '~/utils/skyScene'

const { positionOf, isOnScreen } = useCards()

// Карточка считается на экране и во время проезда, поэтому анимация
// не замирает на переходе и не крутится за краем экрана
const onScreen = computed(() => isOnScreen('cardProjects'))



// Вид записи. У места работы есть срок, и он показан пилюлями над блоком
// и под ним; у личного проекта срока нет, и пилюли ему не рисуются.
const KIND_JOB = 'job'
const KIND_PROJECT = 'project'

// данные проектов (порядок = хронология слева направо)
const projectsData = [
    {
        kind: KIND_JOB,
        title: 'Кайли',

        project: {
            name: 'qayli',
            link: 'https://qayli.com/',
            description: 'Портал для поиска новостроек и ипотечных предложений'
        },

        company: {
            name: 'x.seven',
            link: 'https://xseven.io/'
        },

        job: {
            name: 'Frontend-разработчик',
            link: 'https://vologda.hh.ru/resume/c1497482ff0b662b500039ed1f4a6e78766c69'
        },

        experience: {
            from: '2021-08',
            before: '2023-04'
        },

        duties: {
            1: 'Декомпозиция задач и оценка сроков',
            2: 'Адаптивная верстка (html, css, scss) страниц портала по макетам из Figma',
            3: 'Написание, исправление и поддержка компонентов Vue.js',
            4: 'Перенос страниц портала со стека php/html+css на стек php/nuxt.js',
            5: 'Работа с REST-API для реализации логики на стороне клиента',
            6: 'Оптимизация запросов к API',
            7: 'Исправление багов',
            8: 'Добавление нового функционала',
        },

        achievements: {
            1: 'Совместно с backend программистом полностью перевели портал со стека php/html+css на стек php/nuxt.js с реализацией рендеринга страниц на сервере (SSR)',
            2: 'На 30% сократил количество запросов к API',
            3: 'Занял 2 место в компании по соревнованию быстрой печати среди программистов',
        },

        tags: 'JavaScript, Vue2, Nuxt2, Git, WebPack, Editor.js, Node.js'
    },

    {
        kind: KIND_JOB,
        title: 'Сервизория',

        company: {
            name: 'servizoria',
            link: 'https://servizoria.ru/',
            description: 'Экосистема маркетинговых исследований и продуктов для бизнеса'
        },

        job: {
            name: 'Frontend-разработчик',
            link: 'https://vologda.hh.ru/resume/c1497482ff0b662b500039ed1f4a6e78766c69'
        },

        experience: {
            from: '2023-04',
            before: '2024-07'
        },

        duties: {
            1: 'Декомпозиция задач и оценка сроков',
            2: 'Адаптивная верстка (html, css, scss) страниц портала по макетам из Figma',
            3: 'Добавление нового функционала',
            4: 'Написание кода на jQuery и поддержка/обновление legacy кода',
            5: 'Перенос проекта на Nuxt 3',
        },

        tags: 'JavaScript, jQuery, Nuxt3, SCSS, Figma, Git'
    },

    {
        kind: KIND_JOB,
        title: 'Нанософт',

        project: {
            name: 'nanosoft',
            link: 'https://nanosoft.team/',
            description: 'Сайт компании: дизайн и разработка целиком, от макета до сервера'
        },

        company: {
            name: 'nanocad',
            link: 'https://www.nanocad.ru/'
        },

        job: {
            name: 'Программист 1С / Интегратор',
            link: 'https://vologda.hh.ru/resume/c1497482ff0b662b500039ed1f4a6e78766c69'
        },

        experience: {
            from: '2024-11',
            before: '2026-10'
        },

        duties: {
            1: 'Настройка и создание интеграций с внешними сервисами',
            2: 'Доработка и создание печатных форм, внешних обработок и функционала по требованиям',
            3: 'Работа с клиентами: помощь и формирование задач',
            4: 'Разработка и поддержка сайта компании как дизайнер и fullstack-разработчик',
        },

        achievements: {
            1: 'Прошёл официальное обучение Anthropic по Claude Code: не формат «сделай мне задачу», а тонкая настройка и понимание процессов под капотом — два сертификата',
        },

        tags: '1С, JavaScript, HTML, CSS, Figma, Claude Code'
    },

    {
        kind: KIND_PROJECT,
        title: 'Магазин',

        project: {
            name: 'market',
            link: 'https://anobodyandanothing.com/market/',
            description: 'Небольшой магазин по продаже интересных вещей с услугой индивидуального (кастомного) оформления'
        },

        tags: 'JavaScript, Nuxt3, SCSS, Canvas'
    },

    {
        kind: KIND_PROJECT,
        title: 'Голосовой чат',

        project: {
            name: 'vox',
            link: '/projects',
            description: 'Голосовая связь для своей компании на домашнем сервере: шумоподавление нейросетью, комнаты, показ экрана'
        },

        tags: 'JavaScript, Nuxt3, Electron, LiveKit, WebRTC, WebAssembly'
    }
]



// метрики отрисовки
const COLOR_LINE = 'rgb(235, 235, 235)'
const COLOR_BACK = 'rgb(15, 15, 15)'
const FONT_FAMILY = "'Montserrat', sans-serif"

// пилюля с датой
const PILL_HEIGHT = 22
const PILL_RADIUS = 6
const PILL_PADDING = 10
const PILL_FONT = `500 10px ${FONT_FAMILY}`
/** Просвет между пилюлей и блоком: линий между ними больше нет, держит только он */
const PILL_GAP = 14

// блок проекта: логотип слева от названия
const BLOCK_RADIUS = 10
const BLOCK_PADDING_X = 18
const BLOCK_PADDING_Y = 14
const BLOCK_ICON = 40
const BLOCK_ICON_GAP = 12
const BLOCK_FONT_SIZE = 22
const BLOCK_FONT = `400 ${BLOCK_FONT_SIZE}px ${FONT_FAMILY}`

// расстояния по оси
const BLOCK_GAP = 72 // наименьший просвет между соседними блоками

/** Накопленная прокрутка колеса, после которой лента шагает на блок */
const WHEEL_STEP = 80

// панель подробностей
const PANEL_RADIUS = 10
const PANEL_PADDING_X = 16
const PANEL_PADDING_Y = 14
const PANEL_MARGIN = 16
const PANEL_MAX_WIDTH = 520
const PANEL_GAP = 24 // просвет между панелью и группой
const CONTROLLER_SAFE = 52 // полоса у левого края под кнопку контроллера
const PANEL_FONT = `300 13px ${FONT_FAMILY}`
const PANEL_FONT_BOLD = `500 13px ${FONT_FAMILY}`
const PANEL_FONT_SIZE = 13
const PANEL_LINE_HEIGHT = 18
const PANEL_SCROLLBAR = 3
const PANEL_OVERSCROLL = 56 // насколько текст можно утянуть за границу
const PANEL_SCROLL_EASE = 0.2
const PANEL_SCROLL_RETURN = 0.14 // скорость возврата резинки

// свечение элементов
const GLOW_BASE = 6
const GLOW_HIGHLIGHT = 14

// Выворачивание блока под курсором — то же, что у блоков навыков в море:
// подложка наливается светом, а всё на ней темнеет ровно настолько же
const BLOCK_TONE_DARK = 15
const BLOCK_TONE_LIGHT = 235
const BLOCK_TONE_STEP = 10 // насколько тон меняется за кадр при 60 Гц

// «плавание» блоков и параллакс от курсора
const FLOAT_X = 3
const FLOAT_Y = 4
const FLOAT_SPEED = 0.00035
const PARALLAX_DEPTH = 26 // больше значение — слабее смещение
const PARALLAX_EASE = 0.07

/** Насколько фон отзывается на прокрутку ленты: небо дальше блоков и отстаёт */
const SKY_SCROLL_DEPTH = 0.25

// сдвиг соседних блоков вниз, когда один из них раскрыт
const NEIGHBOR_DROP = 40

// раскрытое состояние: блок уезжает вниз, панель выходит сверху
const OPEN_MARGIN = 12 // просвет под нижней пилюлей сдвинутого соседа
const PANEL_DURATION = 420
const PANEL_DELAY = 140



// канвас
const canvas = ref(null)
let context = null
let canvasWidth = 0
let canvasHeight = 0

// фон: солнце и звёзды
let sky = null
let pixelRatio = 1

// геометрия ленты, пересчитывается на resize и после загрузки шрифтов
const layout = {
    blockWidths: [],
    blockHeight: 0,
    maxBlockWidth: 0,
    blockCenter: [],
    pitch: 0
}

// логотипы проектов и их тёмные копии для вывернутого блока
const logos = {}
const logosDark = {}

// текущий тон подложки каждого блока, по индексу
const blockTone = []

// анимируемые значения
let offsetX = 0
let offsetXTarget = 0
let velocityX = 0
let rowY = 0

// блок, стоящий по центру холста
let focusIndex = 0
// накопитель колеса: один шаг ленты стоит WHEEL_STEP прокрутки
let wheelAmount = 0

// «плавание» и параллакс
let elapsed = 0
let parallaxX = 0
let parallaxY = 0

// насколько лента находится в раскрытом состоянии (0..1) и вокруг какого блока
let openAmount = 0
let openIndex = -1

// панель подробностей
const activeIndex = ref(-1)
let pendingIndex = -1
let panelValue = 0 // 0..1 линейный прогресс твина
let panelDirection = 0 // 1 раскрываем, -1 закрываем
let panelDelay = 0
let panelDoc = null
let panelContentHeight = 0 // высота текста после раскладки, панель по ней ужимается
let panelScroll = 0 // отрисовываемое значение, догоняет цель
let panelScrollTarget = 0 // цель, может уходить за границы — это и есть резинка
let panelScrollMax = 0
let panelRect = { x: 0, y: 0, width: 0, height: 0 }

// указатель
let pointerX = -1
let pointerY = -1
let pointerDown = false
let pointerMoved = false
let pointerStartX = 0
let pointerStartY = 0
let pointerLastX = 0
let pointerLastY = 0
let dragTarget = null // 'timeline' | 'panel'

// зоны попадания, пересобираются каждый тик
let hitBlocks = []
let hitLinks = []

// служебное
let lastTime = 0
let animationId = null
const controllerHide = ref(false)



// вспомогательные функции
const lerp = (from, to, weight) => from + (to - from) * weight

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

// короткое «раздутие» поперёк движения: 0 → 5% → 0
const bulge = (t) => 1 + Math.sin(clamp(t, 0, 1) * Math.PI) * 0.05

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const plural = (count, forms) => {
    const tail = count % 10
    const hundred = count % 100

    if (tail === 1 && hundred !== 11) return forms[0]
    if (tail >= 2 && tail <= 4 && (hundred < 10 || hundred >= 20)) return forms[1]

    return forms[2]
}

const MONTHS = [
    'ЯНВАРЬ', 'ФЕВРАЛЬ', 'МАРТ', 'АПРЕЛЬ', 'МАЙ', 'ИЮНЬ',
    'ИЮЛЬ', 'АВГУСТ', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'ДЕКАБРЬ'
]

// подпись на пилюле даты
const formatDate = (date) => {
    if (date === 'actual') return 'ПО НАСТОЯЩЕЕ ВРЕМЯ'

    const [year, month] = date.split('-').map(Number)

    return `${MONTHS[month - 1]} ${year}`
}

// количество месяцев между двумя точками
const monthsBetween = (from, before) => {
    const [fromYear, fromMonth] = from.split('-').map(Number)
    let beforeYear
    let beforeMonth

    if (before === 'actual') {
        const now = new Date()

        beforeYear = now.getFullYear()
        beforeMonth = now.getMonth() + 1
    } else {
        const parts = before.split('-').map(Number)

        beforeYear = parts[0]
        beforeMonth = parts[1]
    }

    return Math.max(0, (beforeYear - fromYear) * 12 + (beforeMonth - fromMonth))
}

// стаж прописью: «1 год 8 месяцев»
const getExperience = (experience) => {
    const total = monthsBetween(experience.from, experience.before)
    const years = Math.floor(total / 12)
    const months = total % 12
    const parts = []

    if (years) parts.push(`${years} ${plural(years, ['год', 'года', 'лет'])}`)
    if (months) parts.push(`${months} ${plural(months, ['месяц', 'месяца', 'месяцев'])}`)

    return parts.length ? parts.join(' ') : 'меньше месяца'
}

const getName = (project) => project.project ? project.project.name : project.company.name
const getTitle = (project) => project.title || getName(project)
const hasDates = (project) => project.kind === KIND_JOB && project.experience

// путь скруглённого прямоугольника
const roundRectPath = (x, y, width, height, radius) => {
    const limit = Math.min(radius, width / 2, height / 2)

    context.beginPath()
    context.moveTo(x + limit, y)
    context.arcTo(x + width, y, x + width, y + height, limit)
    context.arcTo(x + width, y + height, x, y + height, limit)
    context.arcTo(x, y + height, x, y, limit)
    context.arcTo(x, y, x + width, y, limit)
    context.closePath()
}

// попадание точки в прямоугольник
const isInside = (x, y, rect) => {
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height
}



// расчёт геометрии ленты
const measureLayout = () => {
    context.font = BLOCK_FONT

    layout.blockWidths = projectsData.map((project) => {
        return BLOCK_PADDING_X * 2 + BLOCK_ICON + BLOCK_ICON_GAP + context.measureText(getTitle(project)).width
    })

    layout.blockHeight = BLOCK_PADDING_Y * 2 + Math.max(BLOCK_ICON, BLOCK_FONT_SIZE)
    layout.maxBlockWidth = Math.max(...layout.blockWidths)

    // Шаг карусели: половина холста. Тогда у центрального блока соседи стоят
    // центрами ровно на краях, то есть наполовину за границей карточки.
    // На узком холсте половины не хватает — блоки налезли бы друг на друга,
    // поэтому шаг не опускается ниже самого широкого блока с просветом.
    layout.pitch = Math.max(canvasWidth / 2, layout.maxBlockWidth + BLOCK_GAP)
    layout.blockCenter = projectsData.map((project, index) => index * layout.pitch)
}

// сдвиг ленты, при котором блок стоит ровно по центру холста
const centerOffset = (index) => canvasWidth / 2 - layout.blockCenter[index]

// границы прокрутки ленты: дальше крайних блоков лента не уезжает
const scrollBounds = () => ({
    min: centerOffset(projectsData.length - 1),
    max: centerOffset(0)
})

/**
 * Довести ленту до ближайшего блока. Раскладка держится на том, что один
 * блок стоит по центру, а соседи наполовину за краем, — свободная остановка
 * между ними эту картину ломает.
 */
const settleFocus = () => {
    // Бросок пальцем уводит на соседний блок, даже если доехать не успели
    const flick = clamp(Math.round(-velocityX / 18), -1, 1)
    const raw = (canvasWidth / 2 - offsetX) / layout.pitch

    focusIndex = clamp(Math.round(raw) + flick, 0, projectsData.length - 1)
    velocityX = 0
}

// собственное «дыхание» элемента: у каждого свои фаза и частота, поэтому лента не пульсирует разом
const floatOffset = (seed) => ({
    x: Math.sin(elapsed * FLOAT_SPEED * (1 + (seed % 3) * 0.17) + seed) * FLOAT_X,
    y: Math.cos(elapsed * FLOAT_SPEED * (1 + (seed % 5) * 0.11) + seed * 1.7) * FLOAT_Y
})

// соседние блоки уходят вниз, чтобы не спорить с раскрытой панелью
const neighborDrop = (index) => {
    if (openAmount < 0.001 || index === openIndex) return 0

    return NEIGHBOR_DROP * openAmount
}

/**
 * Высота линии блоков. В покое она посередине холста, а в раскрытом
 * состоянии опускается, освобождая верх под панель. Ниже середины
 * линия не поднимается: на низком холсте подъём выглядел бы прыжком.
 */
const rowTarget = () => {
    const middle = canvasHeight / 2

    if (activeIndex.value < 0) return middle

    // Запас снизу считаем по сдвинутому соседу, а не по самому блоку:
    // соседи уходят вниз от этой же линии и иначе вываливались бы за край
    const bottom = canvasHeight
        - (layout.blockHeight / 2 + PILL_GAP + PILL_HEIGHT + OPEN_MARGIN + NEIGHBOR_DROP)

    return Math.max(middle, bottom)
}

// все опорные точки блока с учётом плавания, параллакса и сдвига соседей
const groupAnchors = (index) => {
    const center = layout.blockCenter[index] + offsetX + parallaxX
    const middle = rowY + parallaxY + neighborDrop(index)
    const width = layout.blockWidths[index]
    const height = layout.blockHeight

    const startFloat = floatOffset(index * 3 + 1)
    const blockFloat = floatOffset(index * 3 + 2)
    const endFloat = floatOffset(index * 3 + 3)

    return {
        start: {
            x: center + startFloat.x,
            y: middle + startFloat.y - height / 2 - PILL_GAP - PILL_HEIGHT / 2
        },
        block: {
            x: center + blockFloat.x - width / 2,
            y: middle + blockFloat.y - height / 2,
            width,
            height
        },
        end: {
            x: center + endFloat.x,
            y: middle + endFloat.y + height / 2 + PILL_GAP + PILL_HEIGHT / 2
        }
    }
}

// прямоугольник блока проекта в координатах канваса
const blockRect = (index) => groupAnchors(index).block

/**
 * Верхняя кромка группы: у места работы это пилюля «дата от», у проекта —
 * сам блок. От неё отмеряется панель, иначе стрелка и нижний край панели
 * прошли бы сквозь пилюлю.
 */
const groupTopEdge = (index, blockY) => {
    return blockY - (hasDates(projectsData[index]) ? PILL_GAP + PILL_HEIGHT : 0)
}

// прямоугольник блока в устоявшемся положении — по нему считается геометрия панели,
// иначе её размеры зависели бы от текущего кадра анимации ленты
const settledBlockRect = (index) => {
    const width = layout.blockWidths[index]

    return {
        x: layout.blockCenter[index] + offsetTarget() - width / 2,
        y: rowTarget() - layout.blockHeight / 2,
        width,
        height: layout.blockHeight
    }
}

// целевая прокрутка ленты: по центру стоит раскрытый блок либо выбранный
const offsetTarget = () => {
    if (activeIndex.value >= 0) return centerOffset(activeIndex.value)

    // Пока ленту тянут, она идёт за пальцем — доводка ждёт отпускания
    if (pointerDown && dragTarget === 'timeline') {
        const bounds = scrollBounds()

        return clamp(offsetXTarget, bounds.min, bounds.max)
    }

    return centerOffset(focusIndex)
}

// финальное положение панели в раскрытом состоянии
const panelTarget = () => {
    const index = activeIndex.value < 0 ? 0 : activeIndex.value
    const block = settledBlockRect(index)

    const topEdge = groupTopEdge(index, block.y)

    // всё, что осталось над группой за вычетом места под стрелку
    const available = Math.max(0, topEdge - PANEL_GAP - PANEL_MARGIN)

    // если текст короче доступного места — панель ужимается под него
    const height = panelContentHeight
        ? Math.min(available, panelContentHeight + PANEL_PADDING_Y * 2)
        : available

    const width = Math.min(PANEL_MAX_WIDTH, canvasWidth - CONTROLLER_SAFE - PANEL_MARGIN)

    // панель держится над блоком, но не заезжает ни за край, ни за кнопку контроллера
    const x = clamp(
        block.x + block.width / 2 - width / 2,
        CONTROLLER_SAFE,
        Math.max(CONTROLLER_SAFE, canvasWidth - PANEL_MARGIN - width)
    )

    return { x, y: topEdge - PANEL_GAP - height, width, height }
}



// сборка содержимого панели
const buildPanelBlocks = (project) => {
    const blocks = []

    if (project.kind === KIND_JOB) {
        blocks.push({
            runs: [
                { text: 'Работал ' },
                { text: project.job.name, link: project.job.link, underline: true },
                { text: ' в течении ' },
                { text: getExperience(project.experience), underline: true }
            ]
        })

        if (project.project) {
            blocks.push({
                marginTop: 6,
                runs: [
                    { text: 'Проект ' },
                    { text: project.project.name, link: project.project.link, underline: true },
                    { text: ' компании ' },
                    { text: project.company.name, link: project.company.link, underline: true }
                ]
            })
        } else {
            blocks.push({
                marginTop: 6,
                runs: [
                    { text: 'Компания ' },
                    { text: project.company.name, link: project.company.link, underline: true }
                ]
            })
        }
    } else {
        // У личного проекта нет ни должности, ни срока — только он сам
        blocks.push({
            runs: [
                { text: 'Личный проект ' },
                { text: project.project.name, link: project.project.link, underline: true }
            ]
        })
    }

    const description = project.project ? project.project.description : project.company.description
    if (description) blocks.push({ marginTop: 6, runs: [{ text: description }] })

    if (project.duties) {
        const caption = project.kind === KIND_JOB ? 'Обязанности на рабочем месте:' : 'Что внутри:'

        blocks.push({ marginTop: 16, runs: [{ text: caption, font: PANEL_FONT_BOLD }] })

        for (const key in project.duties) {
            blocks.push({ marginTop: 6, hanging: 16, runs: [{ text: `${key}. ${project.duties[key]}` }] })
        }
    }

    if (project.achievements) {
        blocks.push({ marginTop: 16, runs: [{ text: 'Достижения за время работы:', font: PANEL_FONT_BOLD }] })

        for (const key in project.achievements) {
            blocks.push({ marginTop: 6, hanging: 16, runs: [{ text: `${key}. ${project.achievements[key]}` }] })
        }
    }

    if (project.tags) {
        blocks.push({ marginTop: 16, runs: [{ text: project.tags, color: 'rgba(235, 235, 235, .55)' }] })
    }

    return blocks
}

// раскладка текста панели по строкам с переносом по словам
const layoutPanelBlocks = (blocks, maxWidth) => {
    const lines = []
    let top = 0

    for (const block of blocks) {
        top += block.marginTop || 0

        const hanging = block.hanging || 0
        let parts = []
        let cursor = 0

        const pushLine = () => {
            lines.push({ top, parts })
            parts = []
            top += PANEL_LINE_HEIGHT
            cursor = hanging
        }

        for (const run of block.runs) {
            const font = run.font || PANEL_FONT

            context.font = font

            // делим на слова, сохраняя пробелы отдельными кусками
            const words = run.text.split(/(\s+)/).filter((word) => word.length)

            for (const word of words) {
                const isSpace = /^\s+$/.test(word)
                const width = context.measureText(word).width

                if (isSpace && !parts.length) continue

                if (cursor + width > maxWidth && parts.length) {
                    pushLine()
                    context.font = font

                    if (isSpace) continue
                }

                parts.push({
                    text: word,
                    x: cursor,
                    width,
                    font,
                    color: run.color,
                    link: run.link,
                    underline: run.underline
                })

                cursor += width
            }
        }

        if (parts.length) pushLine()
    }

    return { lines, height: top }
}

// пересборка панели под текущую ширину
const rebuildPanel = () => {
    if (activeIndex.value < 0) {
        panelDoc = null
        panelContentHeight = 0

        return
    }

    // первый проход считаем на всю доступную высоту: от неё ширина не зависит
    panelContentHeight = 0

    const maxWidth = panelTarget().width - PANEL_PADDING_X * 2 - PANEL_SCROLLBAR - 6

    panelDoc = layoutPanelBlocks(buildPanelBlocks(projectsData[activeIndex.value]), maxWidth)
    panelContentHeight = panelDoc.height

    panelScrollMax = Math.max(0, panelDoc.height - (panelTarget().height - PANEL_PADDING_Y * 2))
    panelScrollTarget = clamp(panelScrollTarget, 0, panelScrollMax)
    panelScroll = clamp(panelScroll, 0, panelScrollMax)
}

// сдвиг прокрутки панели с сопротивлением за границами — эффект резинки
const addPanelScroll = (delta) => {
    const overshoot = panelScrollTarget < 0
        ? -panelScrollTarget
        : Math.max(0, panelScrollTarget - panelScrollMax)

    // чем дальше утянули, тем меньше отрабатывает каждый следующий пиксель
    const resistance = 1 - Math.min(1, overshoot / PANEL_OVERSCROLL) * 0.85

    panelScrollTarget = clamp(
        panelScrollTarget + delta * resistance,
        -PANEL_OVERSCROLL,
        panelScrollMax + PANEL_OVERSCROLL
    )
}



// отрисовка пилюли с датой, центр задаётся точкой из groupAnchors
const printPill = (text, point) => {
    context.font = PILL_FONT
    context.letterSpacing = '1px'

    const width = context.measureText(text).width + PILL_PADDING * 2
    const x = point.x - width / 2
    const y = point.y - PILL_HEIGHT / 2

    // тело со свечением
    context.shadowColor = COLOR_LINE
    context.shadowBlur = GLOW_BASE
    roundRectPath(x, y, width, PILL_HEIGHT, PILL_RADIUS)
    context.fillStyle = COLOR_BACK
    context.fill()
    context.strokeStyle = COLOR_LINE
    context.lineWidth = 1
    context.stroke()
    context.shadowBlur = 0

    // подпись
    context.fillStyle = COLOR_LINE
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(text, point.x, point.y + 1)

    context.letterSpacing = '0px'
}

// отрисовка блока проекта: логотип слева, название справа от него
const printBlock = (index, rect, hovered, step) => {
    // Под курсором блок выворачивается, вне — возвращается к чёрному.
    // Раскрытый блок к этому отношения не имеет: он остаётся таким же
    // тёмным, как остальные, и отмечен только свечением
    const current = blockTone[index] ?? BLOCK_TONE_DARK
    const tone = hovered
        ? Math.min(BLOCK_TONE_LIGHT, current + BLOCK_TONE_STEP * step)
        : Math.max(BLOCK_TONE_DARK, current - BLOCK_TONE_STEP * step)

    blockTone[index] = tone

    const fill = Math.round(tone)
    // Доля выворота, 0..1 — по ней гаснет светлый логотип и проявляется тёмный
    const inverted = (fill - BLOCK_TONE_DARK) / (BLOCK_TONE_LIGHT - BLOCK_TONE_DARK)
    // Всё на подложке ровно настолько же темнеет: тон в сумме всегда постоянен
    const contrast = BLOCK_TONE_LIGHT + BLOCK_TONE_DARK - fill

    // тело со свечением
    context.shadowColor = COLOR_LINE
    context.shadowBlur = hovered || index === activeIndex.value ? GLOW_HIGHLIGHT : GLOW_BASE
    roundRectPath(rect.x, rect.y, rect.width, rect.height, BLOCK_RADIUS)
    context.fillStyle = `rgb(${fill}, ${fill}, ${fill})`
    context.fill()
    // Обводка выворачивается вместе с телом. В покое она белая, как у пилюль,
    // а вывернутый блок получает тёмный контур — иначе на солнце, которое
    // стоит ровно под центральным блоком, белое по белому теряет форму
    context.strokeStyle = `rgb(${contrast}, ${contrast}, ${contrast})`
    context.lineWidth = 1
    context.stroke()
    context.shadowBlur = 0

    // логотип
    const logo = logos[index]
    const dark = logosDark[index]
    const iconX = rect.x + BLOCK_PADDING_X

    if (logo && logo.complete && logo.naturalWidth) {
        const scale = Math.min(BLOCK_ICON / logo.naturalWidth, BLOCK_ICON / logo.naturalHeight)
        const width = logo.naturalWidth * scale
        const height = logo.naturalHeight * scale
        const x = iconX + (BLOCK_ICON - width) / 2
        const y = rect.y + (rect.height - height) / 2

        if (inverted < 1) {
            context.globalAlpha = 1 - inverted
            context.drawImage(logo, x, y, width, height)
        }

        if (dark && inverted > 0) {
            context.globalAlpha = inverted
            context.drawImage(dark.canvas, x, y, dark.width, dark.height)
        }

        context.globalAlpha = 1
    } else {
        // заглушка пока логотип не загружен
        roundRectPath(iconX, rect.y + (rect.height - BLOCK_ICON) / 2, BLOCK_ICON, BLOCK_ICON, 8)
        context.strokeStyle = `rgba(${contrast}, ${contrast}, ${contrast}, .4)`
        context.stroke()
    }

    // название
    context.font = BLOCK_FONT
    context.fillStyle = `rgb(${contrast}, ${contrast}, ${contrast})`
    context.textAlign = 'left'
    context.textBaseline = 'middle'
    context.fillText(
        getTitle(projectsData[index]),
        iconX + BLOCK_ICON + BLOCK_ICON_GAP,
        rect.y + rect.height / 2 + 1
    )
}

/**
 * Пунктир между соседними блоками.
 *
 * Линия идёт через центр холста, где стоит солнце, а белый штрих на белом
 * диске пропадает. Поэтому она рисуется дважды: сначала тёмная подложка
 * потолще, потом светлый штрих поверх. На фоне виден верхний, на солнце —
 * подложка, и пунктир читается на всём пути.
 */
const printLink = (from, to) => {
    if (to.x <= from.x) return

    context.setLineDash([2, 6])

    context.beginPath()
    context.moveTo(from.x, from.y)
    context.lineTo(to.x, to.y)

    context.strokeStyle = COLOR_BACK
    context.lineWidth = 3.5
    context.stroke()

    context.strokeStyle = 'rgba(235, 235, 235, .55)'
    context.lineWidth = 1
    context.stroke()

    context.setLineDash([])
}

// попадает ли блок на холст
const isVisible = (index) => {
    const center = layout.blockCenter[index] + offsetX
    const half = layout.blockWidths[index] / 2

    return center - half < canvasWidth + layout.pitch && center + half > -layout.pitch
}

// отрисовка всей ленты
const printTimeline = (step) => {
    hitBlocks = []

    // Связи идут первыми: блоки заливаются фоном и перекрывают концы пунктира.
    // Когда сосед сдвинут вниз, линия становится диагональной — так и задумано
    for (let index = 0; index < projectsData.length - 1; index += 1) {
        if (!isVisible(index) && !isVisible(index + 1)) continue

        const from = groupAnchors(index).block
        const to = groupAnchors(index + 1).block

        printLink(
            { x: from.x + from.width, y: from.y + from.height / 2 },
            { x: to.x, y: to.y + to.height / 2 }
        )
    }

    projectsData.forEach((project, index) => {
        if (!isVisible(index)) return

        const anchors = groupAnchors(index)
        const block = anchors.block

        if (hasDates(project)) {
            printPill(formatDate(project.experience.from), anchors.start)
            printPill(formatDate(project.experience.before), anchors.end)
        }

        printBlock(index, block, !pointerDown && isInside(pointerX, pointerY, block), step)
        hitBlocks.push({ index, ...block })
    })
}

// отрисовка панели подробностей
const printPanel = () => {
    hitLinks = []

    if (activeIndex.value < 0 || panelValue <= 0) return

    const progress = easeOutCubic(panelValue)
    const swell = bulge(panelValue)
    const block = blockRect(activeIndex.value)
    const target = panelTarget()

    // Панель «выплёвывается» из блока вверх: нижний край отрывается от его
    // верхушки и уезжает к финальному положению, а высота растёт следом.
    // Считаем от нижнего края, а не от верхнего: именно он привязан к блоку,
    // и при росте высоты вверх панель иначе дёргалась бы на старте.
    const width = target.width * swell
    const height = target.height * progress
    const bottom = lerp(
        groupTopEdge(activeIndex.value, block.y) - PANEL_GAP,
        target.y + target.height,
        progress
    )

    panelRect = {
        x: target.x - (width - target.width) / 2,
        y: bottom - height,
        width,
        height
    }

    // тело панели
    context.shadowColor = COLOR_LINE
    context.shadowBlur = 8
    roundRectPath(panelRect.x, panelRect.y, panelRect.width, panelRect.height, PANEL_RADIUS)
    context.fillStyle = COLOR_BACK
    context.fill()
    context.strokeStyle = COLOR_LINE
    context.lineWidth = 1
    context.stroke()
    context.shadowBlur = 0

    if (!panelDoc) return

    // текст с обрезкой по телу панели
    context.save()
    roundRectPath(panelRect.x, panelRect.y, panelRect.width, panelRect.height, PANEL_RADIUS)
    context.clip()

    context.globalAlpha = clamp((panelValue - 0.35) / 0.5, 0, 1)
    context.textAlign = 'left'
    context.textBaseline = 'top'

    const textX = panelRect.x + PANEL_PADDING_X
    const textY = panelRect.y + PANEL_PADDING_Y - panelScroll

    for (const line of panelDoc.lines) {
        const lineY = textY + line.top

        if (lineY + PANEL_LINE_HEIGHT < panelRect.y || lineY > panelRect.y + panelRect.height) continue

        for (const part of line.parts) {
            const partX = textX + part.x
            const partRect = { x: partX, y: lineY, width: part.width, height: PANEL_LINE_HEIGHT }
            const hovered = part.link && !pointerDown && isInside(pointerX, pointerY, partRect)

            context.font = part.font
            context.fillStyle = hovered ? 'rgb(255, 255, 255)' : (part.color || COLOR_LINE)
            context.fillText(part.text, partX, lineY)

            if (part.underline) context.fillRect(partX, lineY + PANEL_FONT_SIZE + 3, part.width, hovered ? 1.5 : 1)
            if (part.link && panelValue > 0.9) hitLinks.push({ link: part.link, ...partRect })
        }
    }

    context.restore()

    printPanelScrollbar()
}

// скроллбар внутри панели
const printPanelScrollbar = () => {
    if (panelScrollMax <= 0 || panelValue < 0.9) return

    const trackX = panelRect.x + panelRect.width - PANEL_PADDING_X / 2 - PANEL_SCROLLBAR
    const trackY = panelRect.y + PANEL_PADDING_Y
    const trackHeight = panelRect.height - PANEL_PADDING_Y * 2
    const thumbHeight = clamp(trackHeight * (trackHeight / panelDoc.height), 24, trackHeight)
    // за резинкой ползунок не убегает, он просто стоит в крайнем положении
    const thumbY = trackY + (trackHeight - thumbHeight) * (clamp(panelScroll, 0, panelScrollMax) / panelScrollMax)

    roundRectPath(trackX, trackY, PANEL_SCROLLBAR, trackHeight, PANEL_SCROLLBAR / 2)
    context.fillStyle = 'rgba(235, 235, 235, .18)'
    context.fill()

    roundRectPath(trackX, thumbY, PANEL_SCROLLBAR, thumbHeight, PANEL_SCROLLBAR / 2)
    context.fillStyle = COLOR_LINE
    context.fill()
}



// раскрыть проект
const openProject = (index) => {
    if (index === activeIndex.value) return closeProject()

    if (activeIndex.value >= 0) {
        // сначала убираем открытую панель, потом показываем новую
        pendingIndex = index
        panelDirection = -1
        panelDelay = 0

        return
    }

    activeIndex.value = index
    openIndex = index
    panelScroll = 0
    panelScrollTarget = 0
    panelDirection = 1
    panelDelay = PANEL_DELAY
    velocityX = 0
    rebuildPanel()
}

// свернуть панель
const closeProject = () => {
    if (activeIndex.value < 0) return

    pendingIndex = -1
    panelDirection = -1
    panelDelay = 0
}

// мгновенный сброс: анимировать нечем, пока карточка неактивна
const resetPanel = () => {
    activeIndex.value = -1
    pendingIndex = -1
    panelDirection = 0
    panelDelay = 0
    panelValue = 0
    panelScroll = 0
    panelScrollTarget = 0
    panelDoc = null
    panelContentHeight = 0
    openAmount = 0
    openIndex = -1
    velocityX = 0
}



// координаты указателя относительно канваса
const pointerPosition = (event) => {
    const rect = canvas.value.getBoundingClientRect()

    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    }
}

const handleWheel = (event) => {
    const position = pointerPosition(event)

    pointerX = position.x
    pointerY = position.y

    // колесо над раскрытой панелью крутит её содержимое
    if (activeIndex.value >= 0 && panelValue > 0.9 && isInside(pointerX, pointerY, panelRect)) {
        addPanelScroll(event.deltaY)

        return
    }

    closeProject()
    velocityX = 0

    // Лента горизонтальная, а колесо у большинства мышей только вертикальное,
    // поэтому движение по любой оси толкает её вбок — берём ту, по которой
    // прокрутили сильнее
    const amount = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY

    // Смена направления обнуляет накопленное: иначе остаток прошлого жеста
    // доворачивал бы ленту в обратную сторону
    if (Math.sign(amount) !== Math.sign(wheelAmount)) wheelAmount = 0

    wheelAmount += amount

    if (Math.abs(wheelAmount) < WHEEL_STEP) return

    focusIndex = clamp(focusIndex + Math.sign(wheelAmount), 0, projectsData.length - 1)
    wheelAmount = 0
}

const handlePointerDown = (event) => {
    const position = pointerPosition(event)

    pointerX = position.x
    pointerY = position.y
    pointerDown = true
    pointerMoved = false
    pointerStartX = position.x
    pointerStartY = position.y
    pointerLastX = position.x
    pointerLastY = position.y
    dragTarget = activeIndex.value >= 0 && isInside(pointerX, pointerY, panelRect) ? 'panel' : 'timeline'
    velocityX = 0

    canvas.value.setPointerCapture(event.pointerId)
}

const handlePointerMove = (event) => {
    const position = pointerPosition(event)

    pointerX = position.x
    pointerY = position.y

    if (!pointerDown) return

    const deltaX = position.x - pointerLastX
    const deltaY = position.y - pointerLastY

    pointerLastX = position.x
    pointerLastY = position.y

    // Порог считаем по обеим осям: ленту тянут вбок, панель — вверх-вниз,
    // и одной оси не хватило бы, чтобы отличить перетаскивание от клика
    const shiftX = position.x - pointerStartX
    const shiftY = position.y - pointerStartY

    if (Math.sqrt(shiftX * shiftX + shiftY * shiftY) > 6) pointerMoved = true
    if (!pointerMoved) return

    if (dragTarget === 'panel') {
        addPanelScroll(-deltaY)

        return
    }

    closeProject()

    const bounds = scrollBounds()

    offsetXTarget = clamp(offsetXTarget + deltaX, bounds.min, bounds.max)
    offsetX = offsetXTarget
    velocityX = deltaX
}

const handlePointerUp = (event) => {
    if (!pointerDown) return

    pointerDown = false

    if (canvas.value.hasPointerCapture(event.pointerId)) canvas.value.releasePointerCapture(event.pointerId)

    if (pointerMoved) {
        // лента доводится до ближайшего блока, панель остаётся как есть
        if (dragTarget === 'timeline') settleFocus()

        velocityX = 0
        pointerMoved = false
        dragTarget = null

        return
    }

    dragTarget = null
    handleClick()
}

const handlePointerLeave = () => {
    if (pointerDown) return

    pointerX = -1
    pointerY = -1
}

// клик без перетаскивания
const handleClick = () => {
    for (const item of hitLinks) {
        if (!isInside(pointerX, pointerY, item)) continue

        if (item.link.startsWith('/')) navigateTo(item.link)
        else window.open(item.link, '_blank', 'noopener')

        return
    }

    for (const item of hitBlocks) {
        if (!isInside(pointerX, pointerY, item)) continue

        openProject(item.index)

        return
    }

    // клик мимо панели и блоков сворачивает подробности
    if (activeIndex.value >= 0 && !isInside(pointerX, pointerY, panelRect)) closeProject()
}

const handleKeydown = (event) => {
    if (event.key === 'Escape') closeProject()
}



// подготовка канваса
const resizeCanvas = () => {
    const ratio = window.devicePixelRatio || 1
    const rect = canvas.value.getBoundingClientRect()

    canvasWidth = rect.width
    canvasHeight = rect.height
    pixelRatio = ratio

    canvas.value.width = Math.round(canvasWidth * ratio)
    canvas.value.height = Math.round(canvasHeight * ratio)

    // все расчёты ведём в css-пикселях, ретину закрывает трансформация
    context.setTransform(ratio, 0, 0, ratio, 0, 0)

    measureLayout()
    rebuildPanel()

    // Окно могло переехать на экран с другой плотностью — иначе тёмные копии
    // остались бы отрисованными под прежнюю и замылились
    for (const index in logos) logosDark[index] = createDarkLogo(logos[index])

    // Поле звёзд раскраивается под размер холста, поэтому сцена пересоздаётся
    // вместе с ним. Рисунок при этом меняется — и это заметно только на resize
    sky = createSkyScene(context, { width: canvasWidth, height: canvasHeight }, ratio)

    const bounds = scrollBounds()

    offsetXTarget = clamp(offsetXTarget, bounds.min, bounds.max)
}

const handleResize = () => {
    resizeCanvas()

    offsetX = offsetTarget()
    rowY = rowTarget()

    requestFrame()
}

/**
 * Тёмная копия логотипа.
 *
 * Логотипы — сплошные светлые фигуры, и на вывернутом блоке белое по белому
 * пропадает. `source-in` оставляет от заливки только силуэт картинки, так что
 * выходит тот же логотип, но тёмный; в кадре эти две копии смешиваются
 * по прозрачности.
 */
const createDarkLogo = (image) => {
    const scale = Math.min(BLOCK_ICON / image.naturalWidth, BLOCK_ICON / image.naturalHeight)
    const width = image.naturalWidth * scale
    const height = image.naturalHeight * scale
    const sprite = createSprite(width, height, pixelRatio)

    sprite.context.drawImage(image, 0, 0, width, height)
    sprite.context.globalCompositeOperation = 'source-in'
    sprite.context.fillStyle = COLOR_BACK
    sprite.context.fillRect(0, 0, width, height)

    return sprite
}

// загрузка логотипов
const loadLogos = () => {
    projectsData.forEach((project, index) => {
        const image = new Image()

        image.src = `/svg/projects/${getName(project)}-logo.svg`
        image.onload = () => {
            logos[index] = image
            logosDark[index] = createDarkLogo(image)
            requestFrame()
        }
    })
}



// кадр анимации
const tick = (time) => {
    animationId = null

    const delta = lastTime ? Math.min(time - lastTime, 64) : 16

    lastTime = time
    elapsed += delta

    // твин панели
    if (panelDirection !== 0) {
        if (panelDelay > 0) {
            panelDelay -= delta
        } else {
            panelValue = clamp(panelValue + panelDirection * (delta / PANEL_DURATION), 0, 1)

            if (panelValue === 0 || panelValue === 1) {
                panelDirection = 0

                if (panelValue === 0) {
                    activeIndex.value = -1
                    panelDoc = null
                    panelContentHeight = 0

                    if (pendingIndex >= 0) {
                        const next = pendingIndex

                        pendingIndex = -1
                        openProject(next)
                    }
                }
            }
        }
    }

    // резинка панели: цель возвращается в границы, отрисовка догоняет цель
    if (!(pointerDown && dragTarget === 'panel')) {
        panelScrollTarget = lerp(panelScrollTarget, clamp(panelScrollTarget, 0, panelScrollMax), PANEL_SCROLL_RETURN)
    }

    panelScroll = lerp(panelScroll, panelScrollTarget, PANEL_SCROLL_EASE)

    // параллакс от курсора, сглаженный чтобы не дёргался
    const depth = pointerX < 0 ? { x: 0, y: 0 } : {
        x: -(pointerX - canvasWidth / 2) / PARALLAX_DEPTH,
        y: -(pointerY - canvasHeight / 2) / PARALLAX_DEPTH
    }

    parallaxX = lerp(parallaxX, depth.x, PARALLAX_EASE)
    parallaxY = lerp(parallaxY, depth.y, PARALLAX_EASE)

    // плавное доведение до целей
    openAmount = lerp(openAmount, activeIndex.value < 0 ? 0 : 1, 0.12)

    offsetXTarget = offsetTarget()
    offsetX = lerp(offsetX, offsetXTarget, pointerDown ? 1 : 0.16)

    rowY = lerp(rowY, rowTarget(), 0.12)

    // рисуем
    context.clearRect(0, 0, canvasWidth, canvasHeight)

    // Доля кадра при 60 Гц: delta приходит в миллисекундах, а сцены и выворот
    // блоков считают скорость в шагах
    const step = delta / 16.6667

    // Небо отзывается и на прокрутку ленты, и на курсор, но слабее блоков
    if (sky) sky.draw(step, offsetX * SKY_SCROLL_DEPTH + parallaxX, parallaxY)

    printTimeline(step)
    printPanel()

    if (onScreen.value) requestFrame()
}

const requestFrame = () => {
    if (animationId) return

    animationId = requestAnimationFrame(tick)
}

const canvasInit = () => {
    context = canvas.value.getContext('2d')

    // resizeCanvas первым: он выставляет pixelRatio, под который
    // раскраиваются тёмные копии логотипов
    resizeCanvas()
    loadLogos()

    // Лента открывается с начала хронологии: первый блок по центру
    focusIndex = 0
    offsetX = offsetTarget()
    offsetXTarget = offsetX
    rowY = rowTarget()

    requestFrame()

    // шрифт может подъехать позже — пересчитываем ширины и переносы
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            measureLayout()
            rebuildPanel()
            requestFrame()
        })
    }
}



// старт компонента
onMounted(() => {
    if (!process.client) return

    canvasInit()

    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
    if (!process.client) return

    if (animationId) cancelAnimationFrame(animationId)

    window.removeEventListener('resize', handleResize)
    window.removeEventListener('keydown', handleKeydown)
})

watch(onScreen, (visible) => {
    if (visible) {
        // Пауза между кадрами могла тянуться секундами — не даём delta скакнуть
        lastTime = 0
        requestFrame()
        return
    }

    // Карточка уже за краем экрана: сбрасываем панель и доводим ленту
    // до исходного положения одним кадром, без анимации
    resetPanel()
    offsetX = offsetTarget()
    rowY = rowTarget()
    requestFrame()
})
</script>
