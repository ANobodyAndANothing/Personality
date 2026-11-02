<template>
    <main class="wrapper">
        <article class="block border work">
            <header class="work__head">
                <h1 class="work__title">{{ vox.title }}</h1>
                <p class="work__tagline">{{ vox.tagline }}</p>
            </header>

            <!-- Главное действие страницы: открыть и говорить. Остальное —
                 для тех, кому нужно приложение. -->
            <section class="vox__start">
                <a class="file vox__open" :href="BROWSER" target="_blank" rel="noopener">
                    <span class="file__label">Открыть в браузере</span>
                    <span class="file__note">микрофон, шумоподавление и комнаты работают прямо на странице</span>
                    <span class="file__size">ничего не нужно ставить</span>
                </a>
                <p class="vox__hint">
                    Регистрация открыта: придумайте логин и пароль — и вы внутри. Логин нужен
                    затем, чтобы вас узнавали в комнатах, а не ради анкеты: ни почты, ни
                    телефона никто не спрашивает.
                </p>
            </section>

            <div class="work__body">
                <section class="work__text">
                    <p v-for="(line, i) in vox.description" :key="i" class="work__paragraph">
                        {{ line }}
                    </p>
                </section>

                <aside class="work__aside">
                    <section class="work__section">
                        <h2 class="work__subtitle">На чём работает</h2>
                        <ul class="work__list">
                            <li v-for="item in vox.stack" :key="item" class="work__item">{{ item }}</li>
                        </ul>
                    </section>

                    <section class="work__section">
                        <h2 class="work__subtitle">Ограничения</h2>
                        <ul class="work__list work__list--limits">
                            <li v-for="item in vox.limits" :key="item" class="work__item">{{ item }}</li>
                        </ul>
                    </section>
                </aside>
            </div>

            <section class="work__downloads">
                <h2 class="work__subtitle">Скачать</h2>

                <div class="work__files">
                    <a
                        v-for="file in vox.downloads"
                        :key="file.href"
                        class="file"
                        :href="file.href"
                        :download="file.download === false ? null : ''"
                        :target="file.download === false ? '_blank' : null"
                        :rel="file.download === false ? 'noopener' : null"
                    >
                        <span class="file__label">{{ file.label }}</span>
                        <span class="file__note">{{ file.note }}</span>
                        <span class="file__size">{{ file.size }}</span>
                    </a>
                </div>

                <p class="work__hint">
                    Адрес сервера уже внутри — вводить его не нужно и негде. Приложение
                    обновляет себя само: интерфейс приезжает с сервера, установщик для этого
                    переустанавливать не надо.
                </p>
            </section>

            <section class="vox__more">
                <h2 class="work__subtitle">Чем это отличается от дискорда</h2>
                <dl class="vox__table">
                    <div v-for="row in СРАВНЕНИЕ" :key="row.что">
                        <dt>{{ row.что }}</dt>
                        <dd>{{ row.как }}</dd>
                    </div>
                </dl>

                <h2 class="work__subtitle">Что внутри</h2>
                <p class="work__paragraph" v-for="(line, i) in ПОДРОБНО" :key="i">{{ line }}</p>
            </section>
        </article>
    </main>
</template>

<script setup>
import { PAGE_META } from '~/data/pages'
import { WORKS } from '~/data/works'

definePageMeta({ header: true })
usePageSeo(PAGE_META.vox)

// Страница живёт на тех же данных, что карточка в «Проектах»: описание,
// стек, ограничения и файлы редактируются в одном месте, а не в двух.
const vox = WORKS.find((w) => w.id === 'vox')

const BROWSER = 'https://vox.217.149.29.3.sslip.io/ui/'

const СРАВНЕНИЕ = [
    { что: 'Битрейт', как: '96 кбит/с и не режется под нагрузкой — у дискорда около 64 и режется' },
    { что: 'Шумоподавление', как: 'DeepFilterNet 3 локально, три уровня; считается у говорящего, вас слышат уже чистым' },
    { что: 'Потери пакетов', как: 'Opus + RED: каждый пакет дублируется со сдвигом, одиночная потеря не слышна' },
    { что: 'Громкость', как: 'выравнивается на лету, тихого человека слышно так же, как громкого' },
    { что: 'Путь звука', как: 'один сервер, мой собственный, без чужих посредников между вами' },
]

const ПОДРОБНО = [
    'Звук у каждого в браузере проходит одну и ту же цепочку: микрофон, нейросетевой шумодав, усиление, компрессор, ограничитель — и только потом уходит в сеть. На приёме всё это выравнивается по громкости, чтобы разговор не приходилось переслушивать.',
    'Сервер раздаёт голос, а не смешивает: каждый получает отдельные дорожки остальных. Поэтому у каждого своя громкость для каждого, можно приглушить одного и не трогать других.',
    'Есть комнаты со своими хозяевами, личные сообщения, показ экрана со звуком, общая очередь музыки и «кастомные события» — маленькие сторонние приложения, которые запускаются внутри комнаты в песочнице и видят только то, что им разрешили.',
]
</script>

<style lang="scss">
    @use "@/assets/style/pages/pages.scss";
    @use "@/assets/style/pages/page-projects.scss";
</style>

<style scoped lang="scss">
.vox__start {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 18px;
}

.vox__open { max-width: 520px; }

.vox__hint {
    font-size: .9rem;
    line-height: 1.6;
    opacity: .7;
}

.vox__more {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
}

.vox__table {
    display: flex;
    flex-direction: column;
    gap: 8px;

    div {
        display: grid;
        grid-template-columns: minmax(140px, 200px) 1fr;
        gap: 10px;
        align-items: baseline;
    }

    dt { opacity: .6; }
    dd { line-height: 1.6; }

    @media (max-width: 640px) {
        div { grid-template-columns: 1fr; gap: 2px; }
    }
}
</style>
