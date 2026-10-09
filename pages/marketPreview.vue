<template>
<div id="PrintDonTraffic">
    <main class="wrapper">
        <section class="block catalog__items">
            <!-- <canvas class="catalog__item block-canvas" id="canvasPrint"></canvas> -->

            <!-- <block class="catalog__item block-canvas" id="blockSvg"></block> -->

            <canvas class="catalog__item block-canvas" id="canvasSvg"></canvas>

            <!-- <div class="catalog__item block-canvas" id="blockLog"></div> -->

            <canvas class="catalog__item block-canvas" id="canvasLazer"></canvas>
        </section>

        <section class="block catalog__items">
            <button class="catalog__item-btn" v-on:click="vectorize">start work</button>
            <!-- <button class="catalog__item-btn" v-on:click="svgToLaserCommands">svg in command</button> -->
            <button class="catalog__item-btn" v-on:click="loadImage">load img</button>
            <button class="catalog__item-btn" v-on:click="combineCanvases">combine</button>
            <button class="catalog__item-btn" v-on:click="printWork = !printWork">print work</button>
        </section>
    </main>
</div>
</template>

<script setup>
// SEO и флаг общей шапки: раньше это лежало в состоянии Vuex,
// куда layout ходил по имени маршрута
import { PAGE_META } from '~/data/pages'

definePageMeta({ header: true })
usePageSeo(PAGE_META.marketPreview)
</script>

<script>
import Potrace from 'potrace';

export default {
    name: 'ShopDonTrafficPreview',

    data() {
        return {
            canvas: {
                print: {
                    html: null,
                    ctx: null,
                },
                svg: {
                    html: null,
                    ctx: null,
                },
                lazer: {
                    html: null,
                    ctx: null,
                }
            },
            svgPath: null,
            isLoading: false,

            currentPosition: { x: 0, y: 0 },
            isLaserOn: false,
            currentInstructionIndex: 0,

            printWork: false,
        }
    },

    mounted() {
        this.initCanvas();
        this.loadImage();
    },

    methods: {
        initCanvas() {
            // this.canvas.print.html = document.querySelector('#canvasPrint');
            //     this.canvas.print.html.width = this.canvas.print.html.offsetWidth;
            //     this.canvas.print.html.height = this.canvas.print.html.offsetHeight;
            // this.canvas.print.ctx = this.canvas.print.html.getContext("2d", { willReadFrequently: true });

            this.canvas.svg.html = document.querySelector('#canvasSvg');
                this.canvas.svg.html.width = this.canvas.svg.html.offsetWidth;
                this.canvas.svg.html.height = this.canvas.svg.html.offsetHeight;
            this.canvas.svg.ctx = this.canvas.svg.html.getContext("2d", { willReadFrequently: true });

            this.canvas.lazer.html = document.querySelector('#canvasLazer');
                this.canvas.lazer.html.width = this.canvas.lazer.html.offsetWidth;
                this.canvas.lazer.html.height = this.canvas.lazer.html.offsetHeight;
            this.canvas.lazer.ctx = this.canvas.lazer.html.getContext("2d", { willReadFrequently: true });
                this.canvas.lazer.ctx.strokeStyle = 'black';
                this.canvas.lazer.ctx.lineWidth = 1;
        },

        loadImage() {
            this.isLoading = true;
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = async () => {
                await this.drawImageCentered(img);
                // await this.processImage();
                this.isLoading = false;
            };
            img.onerror = () => {
                console.error("Failed to load image");
                this.isLoading = false;
            };
            // img.src = 'images/market/cown.png';
            img.src = 'images/market/aqua.png';
        },

        async drawImageCentered(img) {
            const scale = Math.min(
                this.canvas.svg.html.width / img.width,
                this.canvas.svg.html.height / img.height
            ) * 1

            const x = (this.canvas.svg.html.width - img.width * scale) / 2
            const y = (this.canvas.svg.html.height - img.height * scale) / 2

            const image = await this.processingImage(img)            

            this.canvas.svg.ctx.drawImage(
                image.preview,
                x,
                y,
                img.width * scale,
                img.height * scale
            )
        },
        

        async processingImage(image) {            
            const result = {}

            // Обработка слоев
            result.layers = await this.convertColorImage(image, 6)
            
            // Векторизация
            result.vectors = await Promise.all(
                result.layers.map(layer => this.vectorizeImage(layer))
            )

            // this.canvas.lazer.ctx.drawImage(
            //     await this.svgToImage(result.vectors[1]),
            //     0,
            //     0,
            //     image.width * 0.3,
            //     image.height * 0.3
            // )
            
            // Конвертация в команды
            result.commands = await Promise.all(
                result.vectors.map(vector => this.svgToCommands(vector))
            )

            // this.canvas.lazer.ctx.drawImage(
            //     await this.createImageFromCommands(result.commands[1]),
            //     0,
            //     0,
            //     image.width * 0.3,
            //     image.height * 0.3
            // )
            
            // Создание превью
            result.previews = await Promise.all(
                result.commands.map((command, index) => 
                    this.createImageFromCommands(command, this.getGrayShade(index, 7), image.width, image.height)
                )
            )

            this.canvas.lazer.ctx.drawImage(
                await this.createMainImage(result.previews),
                0,
                0,
                image.width * 0.6,
                image.height * 0.6
            )

            // Финальное изображение
            result.image = await this.createMainImage(result.previews)

            return {
                preview: result.image,
                commands: result.commands
            }
        },

        async convertColorImage(image, colorCount) {
            const canvas = document.createElement('canvas')
                canvas.width = image.width
                canvas.height = image.height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(image, 0, 0)
            
            const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const resultLayers = Array.from({ length: colorCount }, () => 
                ctx.createImageData(canvas.width, canvas.height)
            )

            const colorStep = (255 * 3) / colorCount

            for (let i = 0; i < originalImageData.data.length; i += 4) {
                const [r, g, b, a] = originalImageData.data.slice(i, i + 4)
                const brightness = r + g + b
                const indexLayer = Math.min(Math.round(brightness / colorStep), colorCount - 1)
                
                if (a > 0) {
                    const layerData = resultLayers[indexLayer].data
                    layerData.set([0, 0, 0, 255], i)
                }
            }

            const createImageFromImageData = (imageData, canvas) => {
                const ctx = canvas.getContext('2d')
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                ctx.putImageData(imageData, 0, 0)

                return new Promise((resolve) => {
                    const img = new Image()
                    img.onload = () => resolve(img)
                    img.src = canvas.toDataURL('image/png')
                })
            }

            return Promise.all(
                resultLayers.map(layer => createImageFromImageData(layer, canvas))
            )
        },

        async vectorizeImage(image, color = '#000000') {       
            // 1. Создаем временный canvas
            const canvas = document.createElement('canvas')
                canvas.width = image.width
                canvas.height = image.height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(image, 0, 0)

            // 2. Получаем ImageData
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

            // 3. Векторизация через Potrace

            const params = {
                color: color,
                threshold: 128,
                turdSize: 0,
                optCurve: false,
                optTolerance: 0,
                turnPolicy: Potrace.POTRACE_TURNPOLICY_MINORITY
            }

            return new Promise((resolve) => {
                Potrace.trace(imageData, params, (err, svg) => {
                    if (err) throw err
                    resolve(svg)
                })
            })
        },

        async svgToCommands(svgString) {
            const parser = new DOMParser()
            const doc = parser.parseFromString(svgString, "image/svg+xml")
            const svg = doc.querySelector('svg')
            const pathElements = doc.querySelectorAll('path')
            
            // Получаем исходные размеры SVG
            let svgWidth, svgHeight
            
            if (svg.hasAttribute('viewBox')) {
                const viewBox = svg.getAttribute('viewBox').split(/\s+|,/).filter(Boolean)
                svgWidth = parseFloat(viewBox[2])
                svgHeight = parseFloat(viewBox[3])
            } else {
                svgWidth = parseFloat(svg.getAttribute('width')) || 0
                svgHeight = parseFloat(svg.getAttribute('height')) || 0
            }
            
            if (!svgWidth || !svgHeight) {
                svgWidth = 100
                svgHeight = 100
                console.warn("SVG dimensions not found. Using default 100x100.")
            }
            
            const commands = []

            // Обработка векторных путей в оригинальных размерах
            pathElements.forEach(path => {
                const pathData = path.getAttribute('d')
                if (!pathData) return
                
                let currentX = 0
                let currentY = 0
                let subpathStartX = 0
                let subpathStartY = 0
                
                const tokens = pathData.match(/[a-df-z]|[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/gi) || []
                let i = 0
                
                while (i < tokens.length) {
                    const cmd = tokens[i++].toLowerCase()
                    let points = []
                    
                    // MoveTo (M)
                    if (cmd === 'm') {
                        const x = parseFloat(tokens[i++])
                        const y = parseFloat(tokens[i++])

                        points.push(false, x, y)
                        currentX = x
                        currentY = y
                        subpathStartX = x
                        subpathStartY = y
                        
                        // Дополнительные координаты → LineTo (L)
                        while (i < tokens.length && !isNaN(tokens[i])) {
                            const x = parseFloat(tokens[i++])
                            const y = parseFloat(tokens[i++])
                            
                            points.push(true, x, y)
                            currentX = x
                            currentY = y
                        }
                    }
                    // LineTo (L)
                    else if (cmd === 'l') {
                        while (i < tokens.length && !isNaN(tokens[i])) {
                            const x = parseFloat(tokens[i++])
                            const y = parseFloat(tokens[i++])
                            
                            points.push(true, x, y)
                            currentX = x
                            currentY = y
                        }
                    }
                    // Cubic Bezier (C)
                    else if (cmd === 'c') {
                        while (i < tokens.length && !isNaN(tokens[i])) {
                            const x1 = parseFloat(tokens[i++])
                            const y1 = parseFloat(tokens[i++])
                            const x2 = parseFloat(tokens[i++])
                            const y2 = parseFloat(tokens[i++])
                            const x = parseFloat(tokens[i++])
                            const y = parseFloat(tokens[i++])
                            
                            points.push(true, x1, y1, x2, y2, x, y)
                            currentX = x
                            currentY = y
                        }
                    }
                    // ClosePath (Z)
                    else if (cmd === 'z') {
                        points.push(true, subpathStartX, subpathStartY)
                        currentX = subpathStartX
                        currentY = subpathStartY
                    }
                    
                    if (points.length > 0) {
                        commands.push(points)
                    }
                }
            })



            const canvas = document.createElement('canvas')
                canvas.width = svgWidth
                canvas.height = svgHeight
            const ctx = canvas.getContext('2d')
            
            // Рендерим SVG на canvas
            const img = new Image()
            await new Promise(resolve => {
                img.onload = resolve
                img.src = 'data:image/svg+xml,' + encodeURIComponent(svgString)
            })
            
            ctx.drawImage(img, 0, 0, svgWidth, svgHeight)
            const imageData = ctx.getImageData(0, 0, svgWidth, svgHeight)
            
            // Генерируем линии в оригинальных размерах
            const { width, height, data } = imageData

            for (let y = 0; y < height; y++) {
                let isLaserOn = false

                for (let x = 0; x < width; x++) {
                    const index = (y * width + x) * 4
                    const isBlack = data[index] === 0 &&    // R
                        data[index + 1] === 0 &&            // G
                        data[index + 2] === 0 &&            // B
                        data[index + 3] > 0                 // Alpha (не прозрачный)

                    if (isBlack && !isLaserOn) {
                        commands.push([false, x++, y])
                        isLaserOn = true
                    } else if (!isBlack && isLaserOn) {
                        commands.push([true, x--, y])
                        isLaserOn = false
                    }
                }

                if (isLaserOn) commands.push([false, width, y])
            }

            return commands
        },

        async createImageFromCommands(commands, color = "#000000", width = 600, height = 600) {
            // Создаем холст в памяти
            const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // Настраиваем стиль линии (можно параметризировать при необходимости)
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            
            // Выполняем отрисовку команд
            commands.forEach(points => {
                const [active, ...coords] = points;
                
                if (!active) {
                    ctx.moveTo(coords[0], coords[1]); // MoveTo
                } 
                else if (coords.length === 2) {
                    ctx.lineTo(coords[0], coords[1]); // LineTo или ClosePath
                } 
                else if (coords.length === 6) {
                    ctx.bezierCurveTo(
                        coords[0], coords[1],
                        coords[2], coords[3],
                        coords[4], coords[5]
                    );
                }
            });

            ctx.stroke();
            
            // Создаем изображение из холста
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.src = canvas.toDataURL();
            });
        },

        async svgToImage(svg) {
            return new Promise((resolve, reject) => {
                const img = new Image()
                img.onload = () => resolve(img)
                img.onerror = reject
                img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
            })
        },

        async createMainImage(images) {
            return new Promise((resolve) => {
                // Создаем canvas и получаем исходное изображение
                const canvas = document.createElement('canvas')
                    canvas.width = images[0].width
                    canvas.height = images[0].height
                const ctx = canvas.getContext('2d')

                images.forEach(image => {
                   ctx.drawImage(image, 0, 0) 
                })

                const img = new Image();
                    img.onload = () => resolve(img);
                img.src = canvas.toDataURL('image/png');
            })
        },
        

        getGrayShade(index, total) {
            if (total <= 1) return '#000000'
            
            // Рассчитываем значение от 0 (чёрный) до 255 (белый)
            const value = Math.round((index / (total - 1)) * 255)
            
            // Конвертируем в HEX и форматируем
            const hex = value.toString(16).padStart(2, '0')
            return `#${hex}${hex}${hex}`
        },

        downloadJson(jsonString, fileName = 'data.json') {
            // Создаем Blob из JSON строки
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            // Создаем URL для Blob
            const url = URL.createObjectURL(blob);
            
            // Создаем элемент <a> для скачивания
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            
            // Добавляем элемент на страницу (невидимо)
            document.body.appendChild(a);
            
            // Имитируем клик для скачивания
            a.click();
            
            // Удаляем элемент и освобождаем память
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        },

        downloadCanvas(canvas, filename = 'image', format = 'png') {
            // Проверяем поддерживаемые форматы
            const supportedFormats = ['png', 'jpeg', 'webp'];
            if (!supportedFormats.includes(format.toLowerCase())) {
                console.warn(`Формат "${format}" не поддерживается. Будет использован PNG.`);
                format = 'png';
            }

            // Создаем ссылку для скачивания
            const link = document.createElement('a');
            link.download = `${filename}.${format}`;
            
            // Конвертируем canvas в Data URL
            link.href = canvas.toDataURL(`image/${format}`);
            
            // Добавляем ссылку в DOM, кликаем и удаляем
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        downloadSVG(svgElement, fileName = 'image.svg') {
            console.log(svgElement);
            
            // Получаем содержимое SVG
            const serializer = new XMLSerializer();
            let svgString = typeof svgElement == 'string' ? svgElement : serializer.serializeToString(svgElement);
            
            // Добавляем namespace, если его нет
            if (!svgString.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
                svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
            }
            
            // Добавляем декларацию XML, если её нет
            if (!svgString.match(/^<\?xml[^>]+\?>/)) {
                svgString = '<?xml version="1.0" standalone="no"?>\n' + svgString;
            }
            
            // Создаём Blob объект
            const blob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
            const url = URL.createObjectURL(blob);
            
            // Создаём ссылку для скачивания
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            
            // Добавляем ссылку в документ, кликаем и затем удаляем
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Освобождаем память
            URL.revokeObjectURL(url);
        },

        downloadImage(imgObject, fileName = 'image') {
            // Проверяем, что передан объект изображения
            if (!(imgObject instanceof HTMLImageElement)) {
                console.error('Переданный объект не является изображением (HTMLImageElement)');
                return;
            }

            // Создаём canvas и копируем в него изображение
            const canvas = document.createElement('canvas');
            canvas.width = imgObject.naturalWidth || imgObject.width;
            canvas.height = imgObject.naturalHeight || imgObject.height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(imgObject, 0, 0);

            // Преобразуем canvas в Blob и скачиваем
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Не удалось создать Blob из изображения');
                    return;
                }

                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName.includes('.') ? fileName : `${fileName}.png`; // По умолчанию PNG, но можно изменить
                document.body.appendChild(link);
                link.click();
                
                // Очистка
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 100);
            }, 'image/png');
        },

    }
}
</script>

<style lang="scss">
    @use "@/assets/style/pages/pages.scss";
    @use "@/assets/style/pages/page-market.scss";

    .block-canvas{
        height: 600px;
        background-color: rgb(209, 209, 209);
        padding: 0;

        p{
            color: black;
            margin-bottom: 20px;
        }
    }
</style>