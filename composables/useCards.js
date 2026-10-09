/**
 * Состояние карточек главной страницы.
 *
 * Единственный источник правды — activeCard: из него выводится и положение
 * каждой карточки, и то, какие из них держатся в DOM. Карточка не знает
 * про соседей и ничего не ищет в документе.
 */

// Имя карточки: 'cardStart' | 'cardMenu' | 'cardSkills' | 'cardProjects'
// Положение:    'center' | 'left' | 'right' | 'top' | 'bottom'

/**
 * Длительность проезда карточки.
 * Это же значение уходит в CSS как --card-transition (см. pages/index.vue),
 * чтобы скрипт и стили не разъезжались.
 */
export const CARD_TRANSITION_MS = 1000

/** Названия разделов для подписей к стрелкам и скринридеров. */
export const CARD_LABELS = {
    cardStart: 'Начало',
    cardMenu: 'Визитка',
    cardSkills: 'Навыки',
    cardProjects: 'Проекты',
}

/** Где стоит карточка (ключ второго уровня) при активной карточке (ключ первого). */
const CARD_POSITIONS = {
    cardStart: { cardStart: 'center', cardMenu: 'bottom', cardSkills: 'left', cardProjects: 'right' },
    cardMenu: { cardStart: 'center', cardMenu: 'center', cardSkills: 'left', cardProjects: 'right' },
    cardSkills: { cardStart: 'center', cardMenu: 'center', cardSkills: 'center', cardProjects: 'right' },
    cardProjects: { cardStart: 'center', cardMenu: 'center', cardSkills: 'left', cardProjects: 'center' },
}

/**
 * Какие карточки держим в DOM при активной карточке.
 * Стартовая живёт только до перехода в меню и больше не возвращается,
 * поэтому смысла держать её тяжёлый canvas дальше нет.
 */
const CARD_MOUNTED = {
    cardStart: ['cardStart', 'cardMenu'],
    cardMenu: ['cardMenu', 'cardSkills', 'cardProjects'],
    cardSkills: ['cardMenu', 'cardSkills'],
    cardProjects: ['cardMenu', 'cardProjects'],
}

// Таймер один на страницу и работает только в браузере,
// поэтому между запросами на сервере ничего не разделяется
let unmountTimer

export function useCards() {
    const activeCard = useState('cards:active', () => 'cardStart')
    const mountedCards = useState('cards:mounted', () => CARD_MOUNTED.cardStart)
    // Карточка, которая прямо сейчас уезжает с экрана
    const leavingCard = useState('cards:leaving', () => null)

    /** Перевести фокус на другую карточку. */
    function goTo(name) {
        if (name === activeCard.value) return

        leavingCard.value = activeCard.value
        activeCard.value = name

        if (!import.meta.client) return

        // Снимать с монтирования можно только после проезда: иначе уезжающая
        // карточка исчезает рывком на середине анимации
        clearTimeout(unmountTimer)
        unmountTimer = setTimeout(() => {
            mountedCards.value = CARD_MOUNTED[name]
            leavingCard.value = null
        }, CARD_TRANSITION_MS)
    }

    /** Положение карточки прямо сейчас — попадает в `data-position` и дальше в CSS. */
    const positionOf = name => CARD_POSITIONS[activeCard.value][name]

    const isMounted = name => mountedCards.value.includes(name)

    /**
     * Видна ли карточка на экране — включая время проезда.
     * По этому признаку запускаются и останавливаются анимации на canvas:
     * так они не крутятся вхолостую за краем экрана и не замирают на переходе.
     */
    const isOnScreen = name => activeCard.value === name || leavingCard.value === name

    return { activeCard: readonly(activeCard), goTo, positionOf, isMounted, isOnScreen }
}
