/**
 * Навыки, разложенные по «слайдам» подводной сцены.
 * Индекс массива = номер слайда: нулевой — заставка с цитатой, без блоков.
 *
 * Путь к иконке хранится в данных, а не собирается из имени навыка: регистр
 * подписи и регистр имени файла совпадать не обязаны, а сервер к нему чувствителен.
 */

// Навык:
//   name        — подпись на блоке и заголовок модального окна
//   icon        — путь к svg в /public/svg/skills
//   experience  — стаж строкой
//   example     — ссылка на живой пример; нет примера — нет и кнопки
//   courses / tests / recommendations — списки ссылок { title, url }
//   position    — { x, y } на холсте в пикселях; отрицательное значение
//                 отсчитывается от правого или нижнего края
//   short       — короткая подпись для узкого холста, если имя не влезает

export const SKILL_SLIDES = [
    [],
    [
        {
            name: 'HTML',
            icon: '/svg/skills/html.svg',
            experience: 'Больше 3х лет',
            courses: [
                {
                    title: '«Профессиональная вёрстка»',
                    url: 'https://gb.ru/certificates/1093227'
                }
            ],
            tests: [
                {
                    title: '«HTML&CSS. Сложный уровень»',
                    url: 'https://gb.ru/go/VNNXB05'
                }
            ],
            recommendations: [
                {
                    title: 'Компания «xseven»',
                    url: '/files/xseven.pdf'
                }
            ],
            position: {
                x: -150,
                y: -150
            }
        },
        {
            name: 'CSS',
            icon: '/svg/skills/css.svg',
            experience: 'Больше 3х лет',
            courses: [
                {
                    title: '«Профессиональная вёрстка»',
                    url: 'https://gb.ru/certificates/1093227'
                }
            ],
            tests: [
                {
                    title: '«HTML&CSS. Сложный уровень»',
                    url: 'https://gb.ru/go/VNNXB05'
                }
            ],
            recommendations: [
                {
                    title: 'Компания «xseven»',
                    url: '/files/xseven.pdf'
                }
            ],
            position: {
                x: 150,
                y: -100
            }
        },
        {
            name: 'jQuery',
            icon: '/svg/skills/jquery.svg',
            experience: 'Больше 1 года',
            recommendations: [
                {
                    title: 'Компания «xseven»',
                    url: '/files/xseven.pdf'
                }
            ],
            position: {
                x: -250,
                y: 175
            }
        },
        {
            name: 'JavaScript',
            icon: '/svg/skills/javascript.svg',
            short: 'JS',
            experience: 'Больше 2х лет',
            example: 'https://dontraffic.ru/market',
            courses: [
                {
                    title: '«Продвинутый курс JavaScript»',
                    url: 'https://gb.ru/certificates/2183847?7d5959fd53c11adb9fc8ab88269d3ea3'
                },
                {
                    title: '«Профессиональная вёрстка»',
                    url: 'https://gb.ru/certificates/1093227?26800bfbac76f0865cff8b768767d415'
                }
            ],
            tests: [
                {
                    title: '«JavaScript. Сложный уровень»',
                    url: 'https://gb.ru/certificates/2185392?13da3644a25fd7f9af1bbe9255e31af5'
                }
            ],
            recommendations: [
                {
                    title: 'Компания «xseven»',
                    url: '/files/xseven.pdf'
                }
            ],
            position: {
                x: 100,
                y: 100
            }
        }
    ],
    [
        {
            name: 'Canvas',
            icon: '/svg/skills/canvas.svg',
            experience: 'Больше 3х лет',
            recommendations: [
                {
                    title: 'Этот сайт',
                    url: '#'
                }
            ],
            position: {
                x: 150,
                y: -100
            }
        },
        {
            name: 'VUE',
            icon: '/svg/skills/vue.svg',
            experience: 'Больше 1 года',
            recommendations: [
                {
                    title: 'Компания «xseven»',
                    url: '/files/xseven.pdf'
                }
            ],
            position: {
                x: -150,
                y: 175
            }
        },
        {
            name: 'NUXT',
            icon: '/svg/skills/nuxt.svg',
            experience: 'Больше 2х лет',
            example: 'https://dontraffic.ru/market',
            recommendations: [
                {
                    title: 'Компания «xseven»',
                    url: '/files/xseven.pdf'
                }
            ],
            position: {
                x: 200,
                y: 100
            }
        }
    ]
]

/** Количество слайдов выводится из самих данных. */
export const SKILL_SLIDES_COUNT = SKILL_SLIDES.length

/** Плоский список всех навыков в виде { skill, slide } — для перебора вне сцены. */
export const ALL_SKILLS = SKILL_SLIDES.flatMap(
    (skills, slide) => skills.map(skill => ({ skill, slide })),
)
