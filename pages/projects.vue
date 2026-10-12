<template>
    <main class="wrapper">
        <article
            v-for="work in works"
            :key="work.id"
            class="block border work"
        >
            <header class="work__head">
                <h2 class="work__title">{{ work.title }}</h2>
                <p class="work__tagline">{{ work.tagline }}</p>
            </header>

            <div class="work__body">
                <section class="work__text">
                    <p v-for="(line, i) in work.description" :key="i" class="work__paragraph">
                        {{ line }}
                    </p>
                </section>

                <aside class="work__aside">
                    <section class="work__section">
                        <h3 class="work__subtitle">На чём работает</h3>
                        <ul class="work__list">
                            <li v-for="item in work.stack" :key="item" class="work__item">{{ item }}</li>
                        </ul>
                    </section>

                    <section class="work__section">
                        <h3 class="work__subtitle">Ограничения</h3>
                        <ul class="work__list work__list--limits">
                            <li v-for="item in work.limits" :key="item" class="work__item">{{ item }}</li>
                        </ul>
                    </section>
                </aside>
            </div>

            <section v-if="work.downloads?.length" class="work__downloads">
                <h3 class="work__subtitle">Скачать</h3>

                <div class="work__files">
                    <a
                        v-for="file in work.downloads"
                        :key="file.href"
                        class="file"
                        :href="file.href"
                        download
                    >
                        <span class="file__label">{{ file.label }}</span>
                        <span class="file__note">{{ file.note }}</span>
                        <span class="file__size">{{ file.size }}</span>
                    </a>
                </div>

                <p class="work__hint">
                    Перед первым запуском поставьте ZeroTier и попросите у меня адрес сервера
                    и номер сети — без них подключаться некуда.
                </p>
            </section>
        </article>
    </main>
</template>

<script setup>
import { PAGE_META } from '~/data/pages'
import { WORKS } from '~/data/works'

definePageMeta({ header: true })
usePageSeo(PAGE_META.projects)

const works = WORKS
</script>

<style lang="scss">
    @use "@/assets/style/pages/pages.scss";
    @use "@/assets/style/pages/page-projects.scss";
</style>
