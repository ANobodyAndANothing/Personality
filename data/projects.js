/**
 * Места работы и проекты для карточки «Проекты».
 * У записи всегда есть заголовок и ссылка, а company заполняется, только когда
 * проект принадлежит стороннему заказчику, — чтобы разметка не выбирала
 * между двумя вариантами полей.
 */

// Запись о проекте:
//   id           — ключ для :key и имён файлов в /public/svg/projects
//   title, link, description, previewIcon, logoIcon
//   company      — работодатель { name, link }; null, когда проект и есть компания
//   job          — должность { name, link }
//   experience   — { from, to }, где значение вида '2021-08' либо 'actual'
//   duties       — список обязанностей
//   achievements — список достижений, необязателен
//   tags         — список технологий

const RESUME_URL = 'https://vologda.hh.ru/resume/c1497482ff0b662b500039ed1f4a6e78766c69'

const FRONTEND_JOB = {
    name: 'Frontend-developer',
    link: RESUME_URL,
}

export const PROJECTS = [
    {
        id: 'qayli',
        title: 'qayli',
        link: 'https://qayli.com/',
        description: 'Портал для поиска новостроек и ипотечные предложения',
        previewIcon: '/svg/projects/preview-qayli.svg',
        logoIcon: '/svg/projects/qayli-logo.svg',
        company: {
            name: 'x.seven',
            link: 'https://xseven.io/',
        },
        job: FRONTEND_JOB,
        experience: { from: '2021-08', to: '2023-04' },
        duties: [
            'Декомпозиция задач и оценка сроков',
            'Адаптивная верстка (html, css, scss) страниц портала по макетам из Figma',
            'Написание и поддержка компонентов Vue.js',
            'Перенос страниц портала со стека php/html+css на стек php/nuxt.js',
            'Работа REST-API для реализации логики на стороне клиента',
            'Оптимизация запросов к API',
            'Исправление багов',
            'Добавление нового функционала',
        ],
        achievements: [
            'Совместно с backend программистом полностью перевели портал со стека php/html+css на стек php/nuxt.js с реализацией рендеринга страниц на сервере (SSR)',
            'На 30% сократил количество запросов к API',
            'Занял 2 место в компании по соревнованию быстрой печати среди программистов',
        ],
        tags: ['JavaScript', 'Vue2', 'Nuxt2', 'Git', 'WebPack', 'Editor.js', 'Node.js'],
    },
    {
        id: 'servizoria',
        title: 'servizoria',
        link: 'https://servizoria.ru/',
        description: 'Экосистема маркетинговых исследований и продуктов для бизнеса',
        previewIcon: '/svg/projects/preview-servizoria.svg',
        logoIcon: '/svg/projects/servizoria-logo.svg',
        company: null,
        job: FRONTEND_JOB,
        experience: { from: '2023-04', to: '2024-07' },
        duties: [
            'Декомпозиция задач и оценка сроков',
            'Адаптивная верстка (html, css, scss) страниц портала по макетам из Figma',
            'Добавление нового функционала',
            'Написание кода на jQuery и поддержка/обновление legacy кода',
            'Перенос проекта на Nuxt 3',
        ],
        tags: ['JavaScript', 'jQuery', 'Nuxt3', 'SCSS', 'Figma', 'Git'],
    },
    {
        // Превью пока нет: карточке хватает логотипа, а запись нужна
        // ещё и микроразметке worksFor на главной
        id: 'nanosoft',
        title: 'nanosoft',
        link: 'https://nanosoft.team/',
        description: 'Сайт компании: дизайн и разработка целиком, от макета до сервера',
        logoIcon: '/svg/projects/nanosoft-logo.svg',
        company: {
            name: 'Нанософт',
            link: 'https://www.nanocad.ru/',
        },
        job: {
            name: 'Программист 1С / Интегратор',
            link: RESUME_URL,
        },
        experience: { from: '2024-11', to: '2026-10' },
        duties: [
            'Настройка и создание интеграций с внешними сервисами',
            'Доработка и создание печатных форм, внешних обработок и функционала по требованиям',
            'Работа с клиентами: помощь и формирование задач',
            'Разработка и поддержка сайта компании как дизайнер и fullstack-разработчик',
        ],
        achievements: [
            'Прошёл официальное обучение Anthropic по Claude Code: не формат «сделай мне задачу», а тонкая настройка и понимание процессов под капотом — два сертификата',
        ],
        tags: ['1С', 'JavaScript', 'HTML', 'CSS', 'Figma', 'Claude Code'],
    },
]

/** Контакты держатся отдельно от разметки: их же берёт микроразметка Person. */
export const CONTACTS = {
    name: 'Уханов Дмитрий',
    role: 'Middle Frontend разработчик',
    telegram: 'https://t.me/ANobodyAndANothing',
    resume: RESUME_URL,
    phone: '+79210638647',
    phoneLabel: '+7 (921) 063-86-47',
    site: 'https://autist-program.ru/',
}
