<template>
    <main id="DonTraffic" :style="{ '--card-transition': `${CARD_TRANSITION_MS}ms` }">
        <!-- Неподвижная подложка: карточки ездят, а свечение под ними остаётся -->
        <div class="card card-shadow" aria-hidden="true"></div>

        <cards-cardStart v-if="isMounted('cardStart')" />
        <cards-cardMenu v-if="isMounted('cardMenu')" />
        <cards-cardSkills v-if="isMounted('cardSkills')" />
        <cards-cardProjects v-if="isMounted('cardProjects')" />
    </main>
</template>

<script setup>
import { CARD_TRANSITION_MS } from '~/composables/useCards'
import { CONTACTS, PROJECTS } from '~/data/projects'
import { PAGE_META, SITE_IMAGE, SITE_URL } from '~/data/pages'

definePageMeta({ header: false })

usePageSeo(PAGE_META.index)

const { isMounted } = useCards()

/**
 * Микроразметка Person: объясняет поисковику, чья это страница,
 * чем человек занимается и как с ним связаться.
 */
useHead({
    script: [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: CONTACTS.name,
            jobTitle: CONTACTS.role,
            url: SITE_URL,
            image: SITE_IMAGE,
            telephone: CONTACTS.phone,
            description: PAGE_META.index.description,
            sameAs: [CONTACTS.telegram, CONTACTS.resume],
            knowsAbout: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'Vue.js', 'Nuxt.js', 'jQuery'],
            worksFor: PROJECTS.map(project => ({
                '@type': 'Organization',
                name: project.company?.name ?? project.title,
                url: project.company?.link ?? project.link,
            })),
        }),
    }],
})
</script>

<style lang="scss">
    @use "@/assets/style/pages/DonTraffic.scss";
</style>
