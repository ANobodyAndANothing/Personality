/**
 * Мета-описания страниц.
 * Это константы, а не состояние: на сервере один модуль обслуживает
 * все запросы сразу, и общее изменяемое состояние протекало бы между ними.
 */

// Описание страницы: { title, description, keywords }.

export const SITE_URL = 'https://dontraffic.ru'
export const SITE_NAME = 'ANobodyAndANothing'
export const SITE_IMAGE = `${SITE_URL}/images/wallpapperLink.jpg`

const MARKET_META = {
    title: 'ANobodyAndANothing.Market',
    description: 'Небольшой магазин по продаже интересных вещей с услугой индивидуального (кастомного) оформления',
    keywords: 'декор, подарки, интересные подарки, подарки близким, красивый декор для дома, индивидуальное оформление, кастомное оформление, свой дизайн, свой принт, своя идея, магазин с декором, доставка, оформление своего',
}

export const PAGE_META = {
    index: {
        title: 'Middle frontend разработчик ANobodyAndANothing',
        description: 'Визитная карточка middle frontend разработчика ANobodyAndANothing',
        keywords: 'визитка, визитная карточка, сайт визитка, frontend, middle, разработчик, ANobodyAndANothing, заказать сайт, вёрстка',
    },
    market: MARKET_META,
    marketPreview: MARKET_META,
}
