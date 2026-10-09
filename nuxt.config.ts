// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-04-12',

    css: ['@/assets/style/main.scss'],

    app: {
        head: {
            // Без lang браузер не знает, как переносить слова,
            // а скринридер — каким голосом читать
            htmlAttrs: { lang: 'ru' },

            link: [
                { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },

                // Шрифты подключены <link>-ом, а не @import внутри CSS:
                // @import растягивает загрузку на три последовательных запроса
                // до первой отрисовки. Начертания перечислены ровно те,
                // что используются в стилях.
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500&family=Open+Sans:wght@400&display=swap',
                },
            ],

            meta: [
                { name: 'theme-color', content: '#0f0f0f' },
                { name: 'format-detection', content: 'telephone=no' },
            ],
        },
    },

    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    // Современный API Sass: со старым dart-sass
                    // предупреждает об устаревшем интерфейсе на каждой сборке
                    api: 'modern-compiler',
                },
            },
        },
    },
})
