/**
 * Удержание фокуса внутри открытого окна: Tab не выпускает фокус наружу,
 * при открытии он уходит на первый интерактивный элемент,
 * при закрытии возвращается туда, откуда окно открыли.
 */

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * @param container ref на корневой элемент окна
 * @param isOpen    ref: открыто ли окно
 */
export function useFocusTrap(container, isOpen) {
    let lastFocused = null

    function focusableItems() {
        if (!container.value) return []
        // offsetParent отсеивает то, что спрятано стилями
        return Array.from(container.value.querySelectorAll(FOCUSABLE_SELECTOR))
            .filter(element => element.offsetParent !== null)
    }

    function onKeydown(event) {
        if (event.key !== 'Tab' || !container.value) return

        const items = focusableItems()
        if (!items.length) return

        const first = items[0]
        const last = items[items.length - 1]
        const active = document.activeElement

        // На краях списка фокус заворачивается обратно внутрь окна
        if (event.shiftKey && (active === first || !container.value.contains(active))) {
            event.preventDefault()
            last.focus()
        } else if (!event.shiftKey && active === last) {
            event.preventDefault()
            first.focus()
        }
    }

    watch(isOpen, async (open) => {
        if (!import.meta.client) return

        if (open) {
            lastFocused = document.activeElement
            await nextTick()
            focusableItems()[0]?.focus()
            document.addEventListener('keydown', onKeydown)
            return
        }

        document.removeEventListener('keydown', onKeydown)
        // Возвращаем фокус туда, откуда окно открыли
        lastFocused?.focus()
        lastFocused = null
    })

    onScopeDispose(() => {
        if (import.meta.client) document.removeEventListener('keydown', onKeydown)
    })
}
