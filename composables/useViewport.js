/**
 * Совпадение с media-запросом в виде реактивного значения.
 * matchMedia срабатывает только на переходе через границу, в отличие
 * от слушателя resize, который дёргается на каждый пиксель.
 */
export function useMediaQuery(query) {
    const matches = ref(false)

    if (import.meta.client) {
        const media = window.matchMedia(query)
        matches.value = media.matches

        const update = event => { matches.value = event.matches }

        media.addEventListener('change', update)
        onScopeDispose(() => media.removeEventListener('change', update))
    }

    return matches
}

/**
 * Экран шире телефонного. Порог совпадает с $bp-phone в assets/style/media.scss:
 * ниже него тяжёлые сцены на canvas не запускаются вовсе.
 */
export const useIsDesktop = () => useMediaQuery('(min-width: 426px)')
