/**
 * Работа с периодами вида «2021-08» и особым значением 'actual' («по сей день»).
 */

const MONTH_NAMES = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

// Год-месяц везде ниже — строка вида `2021-08` либо 'actual' для текущего момента.
// Разобранный вид: { year, month }, где month — от 1 до 12.

function parseYearMonth(value) {
    if (value === 'actual') {
        const now = new Date()
        return { year: now.getFullYear(), month: now.getMonth() + 1 }
    }

    const [year, month] = value.split('-').map(Number)
    return { year, month }
}

export function formatYearMonth(value) {
    const { year, month } = parseYearMonth(value)
    return `${MONTH_NAMES[month - 1]} ${year}`
}

/** Русское склонение по числу: 1 год, 2 года, 5 лет. */
function plural(count, [one, few, many]) {
    const rest100 = Math.abs(count) % 100
    const rest10 = rest100 % 10

    if (rest100 > 10 && rest100 < 20) return many
    if (rest10 > 1 && rest10 < 5) return few
    if (rest10 === 1) return one
    return many
}

/**
 * Длительность периода словами.
 * Считается по календарным месяцам: деление разницы дат на «тридцать дней»
 * накапливает заметную ошибку уже на первых годах.
 */
export function formatDuration(from, to) {
    const start = parseYearMonth(from)
    const end = parseYearMonth(to)

    const totalMonths = Math.max(0, (end.year - start.year) * 12 + (end.month - start.month))
    const years = Math.floor(totalMonths / 12)
    const months = totalMonths % 12

    const parts = []
    if (years > 0) parts.push(`${years} ${plural(years, ['год', 'года', 'лет'])}`)
    if (months > 0 || years === 0) parts.push(`${months} ${plural(months, ['месяц', 'месяца', 'месяцев'])}`)

    return parts.join(' ')
}
