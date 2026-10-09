import { PAGE_META, SITE_IMAGE, SITE_NAME, SITE_URL } from '~/data/pages'

/** Мета-теги страницы: Open Graph, Twitter и канонический адрес. */
export function usePageSeo(meta) {
    const route = useRoute()
    const canonical = `${SITE_URL}${route.path === '/' ? '' : route.path}`

    useSeoMeta({
        title: meta.title,
        description: meta.description,
        keywords: meta.keywords,

        ogType: 'website',
        ogSiteName: SITE_NAME,
        ogLocale: 'ru_RU',
        ogTitle: meta.title,
        ogDescription: meta.description,
        ogUrl: canonical,
        ogImage: SITE_IMAGE,
        ogImageAlt: meta.title,
        ogImageWidth: 1920,
        ogImageHeight: 1080,

        twitterCard: 'summary_large_image',
        twitterTitle: meta.title,
        twitterDescription: meta.description,
        twitterImage: SITE_IMAGE,
    })

    useHead({
        link: [{ rel: 'canonical', href: canonical }],
    })
}

/** Описание текущей страницы по её имени в роутере — его показывает шапка. */
export function useCurrentPageMeta() {
    const route = useRoute()
    return computed(() => PAGE_META[route.name] ?? null)
}
