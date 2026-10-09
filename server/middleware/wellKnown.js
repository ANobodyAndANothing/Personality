/**
 * Chrome DevTools при открытии вкладки запрашивает файл настроек рабочей
 * папки. Маршрута под него нет, запрос доходит до рендерера страниц,
 * и роутер пишет в консоль предупреждение о ненайденном адресе.
 *
 * Пустой ответ — нормальный для неизвестного well-known адреса.
 * Путь сверяется целиком, а не по префиксу, чтобы не перехватывать
 * настоящие файлы из public/.well-known.
 */
const DEVTOOLS_PROBE = '/.well-known/appspecific/com.chrome.devtools.json'

export default defineEventHandler((event) => {
    if (event.path !== DEVTOOLS_PROBE) return

    return sendNoContent(event, 204)
})
