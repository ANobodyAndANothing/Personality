/**
 * Учитывает системную настройку «уменьшить движение».
 * Сайт целиком построен на анимации, поэтому таким посетителям
 * показываем конечное состояние сразу, а не крутим эффекты.
 */
export function usePrefersReducedMotion() {
    const prefersReducedMotion = ref(false)

    if (import.meta.client) {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)')
        prefersReducedMotion.value = query.matches

        const update = event => { prefersReducedMotion.value = event.matches }

        query.addEventListener('change', update)
        onScopeDispose(() => query.removeEventListener('change', update))
    }

    return prefersReducedMotion
}
