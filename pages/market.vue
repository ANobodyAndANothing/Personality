<template>
    <main id="PrintDonTraffic" class="wrapper">

        <section v-show="activeCatalogItem">

            <h2 class="block__title">Настройте изделие</h2>  

            <div
                id="custom"
                class="DTScroll slider custom-slider" 
                points='{"0":2.2, "450":1.2, "650":1.8, "950":2.2, "1150":3.2}' 
                anchor="true"
                touche="true"
            >
                <div class="slider__line custom-line custom-slider__line">
                    <div class="custom-shadow-prev custom-slider__shadow"></div>
                    
                    <div 
                        class="slider__line-item custom-item custom-slider__item" 
                        v-for="(layer, key) in canvas.layers" :key="layer"
                    >
                        <label class="custom-slider__item-label">
                            <img 
                                class="custom-slider__item-img"
                                :src="layer.image.originImage.currentSrc" 
                                :alt="`image-item-custom-${key}`"
                            >

                            <input
                                class="custom-slider__item-input"
                                type="file"
                                @change="(e) => uploadImageInput(e, key)"
                            >
                        </label>
                    </div>

                    <div class="slider__line-item custom-item custom-slider__item">
                        <label class="custom-slider__item-label">
                            <svg class="custom-slider__item-svg">
                                <use xlink:href="@/assets/svg/sprite.svg#image-default"></use>
                            </svg>

                            <input
                                class="custom-slider__item-input"
                                type="file"
                                @change="(e) => uploadImageInput(e, canvas.layers.length)"
                            >
                        </label>
                    </div>

                    <div class="custom-shadow-next custom-slider__shadow"></div>
                </div>
            </div>

            <div class="redactor">
                <div class="redactor-canvas-container">
                    <canvas class="redactor-canvas redactor-canvas--top" id="custom-redactor-canvas-border"></canvas>
                </div>

                <div class="redactor-layers" :class="{'redactor-layers--show': canvas.layers.show}">
                    <div 
                        class="redactor-layers-button"
                        @click="canvas.layers.show = !canvas.layers.show"
                    >Слои</div>

                    <div class="redactor-layers-items">
                        <div 
                            class="redactor-layers-item"
                            v-for="(item, index) in canvas.layers" 
                            :key="`${item}-${index}`"
                            :class="{'redactor-layers-item--active': this.canvas.linkCanvasActive == this.canvas.layers[index]}"
                        >
                            <input
                                class="redactor-layers-item-text"
                                @click="this.canvas.linkCanvasActive = this.canvas.layers[index]; updateCanvas()"
                                v-model="item.name"
                                type="text"
                            >

                            <div class="redactor-layers-item-arrows">
                                <button 
                                    class="redactor-layers-item-arrow redactor-layers-item-arrow--top"
                                    v-if="index != 0 && index != 1"
                                    @click="moveLayers(Number(index), Number(index)-1)"
                                >
                                    <svg class="redactor-layers-item-arrow-svg">
                                        <use xlink:href="@/assets/svg/sprite.svg#arrow"></use>
                                    </svg>
                                </button>

                                <button 
                                    class="redactor-layers-item-arrow redactor-layers-item-arrow--bottom"
                                    v-if="index != 0 && Number(index)+1 != this.canvas.layers.length"
                                    @click="moveLayers(Number(index), Number(index)+1)"
                                >
                                    <svg class="redactor-layers-item-arrow-svg">
                                        <use xlink:href="@/assets/svg/sprite.svg#arrow"></use>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="redactor-fullscreen" @click="changeFullscreen">
                    <svg class="redactor-fullscreen__svg">
                        <use xlink:href="@/assets/svg/sprite.svg#icon-fullscreen"></use>
                    </svg>
                </div>

                <div class="redactor-tools" :class="{'redactor-tools--show': canvas.toolsShow}" v-if="canvas.linkCanvasActive">
                    <div 
                        class="redactor-tools-button"
                        @click="canvas.toolsShow = !canvas.toolsShow"
                    >Инструменты</div>

                    <div class="redactor-tools-items">
                        <div class="redactor-tools-item">
                            <p class="redactor-tools-item-text">Количество слоёв</p>
                            <div class="redactor-tools-item-container redactor-tools-item-container-position">
                                <div class="redactor-tools-item-container--grid-3">
                                    <input 
                                        class="redactor-tools-item-input" 
                                        type="number" placeholder="По ширине"
                                        v-model="canvas.linkCanvasActive.image.position.x"
                                        @change="setItemPosition(), updateCanvas()"
                                    >

                                </div>
                            </div>
                        </div>

                        <div class="redactor-tools-item">
                            <p class="redactor-tools-item-text">Повернуть</p>
                            <div class="redactor-tools-item-container redactor-tools-item-container-rotate">
                                <input
                                    class="redactor-tools-item-input"
                                    type="number"
                                    v-model="canvas.linkCanvasActive.image.rotate"
                                    @change="updateCanvas()"
                                >
                                <input
                                    class="redactor-tools-item-interactive"
                                    type="range"
                                    v-model="canvas.linkCanvasActive.image.rotate"
                                    min="0" max="7" step="0.05" 
                                    @input="updateCanvas()"
                                >
                            </div>
                        </div>

                        <div class="redactor-tools-item" v-if="canvas.layers.canvasActive != 0">
                            <p class="redactor-tools-item-text">Размер</p>
                            <div class="redactor-tools-item-container redactor-tools-item-container-size">
                                <div class="redactor-tools-item-container--grid-3">
                                    <input 
                                        class="redactor-tools-item-input" 
                                        type="number" placeholder="Ширина"
                                        v-model="canvas.linkCanvasActive.image.size.width"
                                        @change="updateSize('width')"
                                    >
                                    x
                                    <input 
                                        class="redactor-tools-item-input" 
                                        type="number" placeholder="Высота"
                                        v-model="canvas.linkCanvasActive.image.size.height"
                                        @change="updateSize('height')"
                                    >
                                </div>

                                <svg 
                                    class="redactor-tools-item-btn" 
                                    @click="
                                        canvas.toolsChain = canvas.toolsChain ? 0 : canvas.linkCanvasActive.image.size.width/canvas.linkCanvasActive.image.size.height,
                                        stopDragging()
                                    "
                                    :class="{'redactor-tools-item-btn--active': canvas.toolsChain}"
                                >
                                    <use xlink:href="@/assets/svg/sprite.svg#icon-chain"></use>
                                </svg>
                            </div>
                        </div>

                        <div class="redactor-tools-item">
                            <p class="redactor-tools-item-text">Позиция</p>
                            <div class="redactor-tools-item-container redactor-tools-item-container-position">
                                <div class="redactor-tools-item-container--grid-3">
                                    <input 
                                        class="redactor-tools-item-input" 
                                        type="number" placeholder="По ширине"
                                        v-model="canvas.linkCanvasActive.image.position.x"
                                        @change="setItemPosition(), updateCanvas()"
                                    >
                                    x
                                    <input 
                                        class="redactor-tools-item-input" 
                                        type="number" placeholder="По высоте"
                                        v-model="canvas.linkCanvasActive.image.position.y"
                                        @change="setItemPosition(), updateCanvas()"
                                    >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="priceList">
                <h3>Отправить готовый принт</h3>

                <div>
                    <p>Прайс-лист</p>
                    <ul>
                        <li v-if="canvas.colorCount">{{ priceList.layersCount.layerPrice*canvas.colorCount }}руб за {{ canvas.colorCount }} слоёв (1 слой = {{ priceList.layersCount.layerPrice }}руб)</li>
                    </ul>
                </div>

                <button @click="sendbuyerInfo"></button>
            </div>

        </section>

        <section class="catalog">
            <h2 class="block__title">Каталог</h2>

            <div class="catalog__items">
                <div 
                    class="catalog__item" 
                    v-for="(item, key) in catalogItems" 
                    :key="'market-item-' + item"
                >
                    <img 
                        class="catalog__item-image"
                        :src="`/images/market/${key}.png`" 
                        :alt="`market-img-${key}`"
                    >

                    <h3 class="catalog__item-title">{{ item.title }}</h3>
                    <p class="catalog__item-desc">{{ item.desc }}</p>
                    <p class="catalog__item-price">От {{ item.price }}&#8381;</p>

                    <button class="catalog__item-btn" @click="changeCatalogItem = key">закастомить</button>
                </div>
            </div>
        </section>
    </main>
</template>

<script setup>
// SEO и флаг общей шапки: раньше это лежало в состоянии Vuex,
// куда layout ходил по имени маршрута
import { PAGE_META } from '~/data/pages'

definePageMeta({ header: true })
usePageSeo(PAGE_META.market)
</script>

<script>
import {DTScroll} from '~/scripts/slider'
import Potrace from 'potrace';

export default {
    name: 'ShopDonTraffic',

    data () {
        return {
            activeCatalogItem: 'knife',
            catalogItems: {
                knife: {
                    title: 'Нож с травлением',
                    desc: 'Путём травления метала, лезвию ножа придаётся нужный принт. Есть возможность добавить слои, что придаст принту красоты и объёма',
                    message: '',
                    price: 5000,
                    canvas: {},
                    options: {},
                },

                picture: {
                    title: 'Картина с подсветкой',
                    desc: 'Картина, которая ',
                    price: 5000,
                },
            },

            priceList: {
                layersCount: {
                    layerPrice: 100,
                }
            },

            canvas: {
                ctx: null,
                item: null,

                drag: false,
                action: '',
                fullscreen: false,
                toolsShow: false,
                toolsChain: 0,

                offsetY: 0,
                offsetX: 0,

                colorCount: 6,

                border: {
                    html: null,
                    ctx: null,
                },

                linkCanvasActive: null,
                layers: [],

                globalPositionsItems: {
                    max: {
                        x: 0,
                        y: 0,
                    },
                    min: {
                        x: 999999999,
                        y: 999999999,
                    }
                },

                methods: {
                    rotate: (e) => {
                        this.canvas.linkCanvasActive.image.rotate = (e.offsetY * Math.PI) / 180
                    },

                    scale: (e) => {
                        // if (!this.canvas.ratio) this.canvas.ratio = this.canvas.linkCanvasActive.image.size.width/this.canvas.linkCanvasActive.image.size.height

                        this.canvas.linkCanvasActive.image.size = {
                            height: e.offsetY - this.canvas.linkCanvasActive.image.points['left-top'].y,
                            width: this.canvas.linkCanvasActive.image.size.height * this.canvas.linkCanvasActive.image.ratio
                        }
                    },

                    scaleWidth: (e) => {
                        this.canvas.linkCanvasActive.image.size.width = e.offsetX - this.canvas.linkCanvasActive.image.points['left-top'].x
                    },

                    scaleHeight: (e) => {
                        this.canvas.linkCanvasActive.image.size.height = e.offsetY - this.canvas.linkCanvasActive.image.points['left-top'].y
                    },

                    move: (e) => {
                        if (!this.canvas.offsetX) this.canvas.offsetX = e.offsetX - this.canvas.linkCanvasActive.image.position.x
                        if (!this.canvas.offsetY) this.canvas.offsetY = e.offsetY - this.canvas.linkCanvasActive.image.position.y

                        this.canvas.linkCanvasActive.image.position = {
                            x: e.offsetX - this.canvas.offsetX,
                            y: e.offsetY - this.canvas.offsetY
                        }
                    },

                    globalItemsPosition: () => {
                        this.canvas.globalItemsPositions = {
                            max: {
                                x: 0,
                                y: 0,
                            },
                            min: {
                                x: 999999999,
                                y: 999999999,
                            }
                        },

                        this.canvas.layers.forEach(layer => {
                            let globalPos = this.canvas.globalItemsPositions
                            let localPos = layer.image.points['min-max']

                            if(localPos.max.y > globalPos.max.y) globalPos.max.y = localPos.max.y
                            if(localPos.min.y < globalPos.min.y) globalPos.min.y = localPos.min.y
                            if(localPos.max.x > globalPos.max.x) globalPos.max.x = localPos.max.x
                            if(localPos.min.x < globalPos.min.x) globalPos.min.x = localPos.min.x
                        })
                    }
                },
            },
        }
    },

    async mounted() {
        let canvasContainer = document.querySelector('.redactor')


        const startKnifeBase64 = await this.imageToBase64('/images/market/knife-custom.png')
        this.canvas.linkCanvasActive = await this.createCanvas(startKnifeBase64, 0, 0 )
        this.renderPrint(this.canvas.linkCanvasActive)


        this.canvas.border.html = document.querySelector('#custom-redactor-canvas-border')
            this.canvas.border.html.height = canvasContainer.offsetHeight
            this.canvas.border.html.width = canvasContainer.offsetWidth
        this.canvas.border.ctx = document.querySelector('#custom-redactor-canvas-border').getContext("2d")        
        this.printBorderImage()


        canvasContainer.addEventListener('mousedown', this.startDragging)
        canvasContainer.addEventListener('mousemove', (e) => { this.drag(e) })
        canvasContainer.addEventListener('mouseup', this.stopDragging)


        new MutationObserver((item) => {
            DTScroll.sliderUpdateDeep('custom')
        }).observe(
            document.querySelector('#custom').querySelector('.slider__line'), 
            { childList: true, subtree: true }
        ); DTScroll.initScroll('custom')

        console.log(this);
        
        
    },

    methods: {
        async createCanvas(imageData, index, colorCount) {
            let canvasHTML;
            let canvasContainer = document.querySelector('.redactor');
            
            // Создаём или получаем существующий canvas
            if (this.canvas.layers[index]) {
                canvasHTML = this.canvas.layers[index].html
            } else {
                canvasHTML = document.createElement('canvas')
                    canvasHTML.classList.add('redactor-canvas')
                    canvasHTML.setAttribute("id", `custom-redactor-canvas-${index}`)
                    canvasHTML.height = canvasContainer.offsetHeight
                    canvasHTML.width = canvasContainer.offsetWidth
                document.querySelector('.redactor-canvas-container').appendChild(canvasHTML)
            }

            await new Promise((resolve) => {
                const img = new Image();
                img.onload = async () => { 
                    const widthMain = img.width > img.height
                    const ratio = widthMain ? (img.width / img.height) : (img.height / img.width)
                    
                    let imagesObject = {}

                    if (index) {
                        imagesObject = await this.processingImage(img, colorCount)
                    } else {
                        imagesObject = {
                            preview: img,
                        }
                    }

                    const imgHeight = widthMain ? 
                        (canvasHTML.offsetWidth / 1.2) / ratio : 
                        canvasHTML.offsetHeight / 1.2
                    const imgWidth = widthMain ? 
                        (canvasHTML.offsetWidth / 1.2) : 
                        (canvasHTML.offsetHeight / 1.2) / ratio

                    this.canvas.layers[index] = {
                        name: 'image ' + index,
                        html: canvasHTML,
                        ctx: canvasHTML.getContext("2d"),
                        image: {
                            originImage: img,
                            canvasImage: imagesObject.preview,
                            commandsImage: imagesObject.commands,
                            points: {},
                            size: {
                                width: imgWidth,
                                height: imgHeight,
                            },
                            center: {
                                x: canvasHTML.offsetWidth / 2,
                                y: canvasHTML.offsetHeight / 2,
                            },
                            position: {
                                x: canvasHTML.offsetWidth / 2 - imgWidth / 2,
                                y: canvasHTML.offsetHeight / 2 - imgHeight / 2,
                            },
                            rotate: 0,
                            ratio: ratio,
                            widthMain: widthMain
                        },
                    }
                    resolve()
                }
                img.src = imageData;
            })

            this.setItemPosition(this.canvas.layers[index])
            return this.canvas.layers[index];
        },

        renderPrint(canvas) {            
            // Выбираем изменяемый canvas и очищаем его
            const canvasActive = canvas ? canvas : this.canvas.linkCanvasActive
            
            canvasActive.ctx.clearRect(0, 0, canvasActive.html.width, canvasActive.html.height)            

            // Сохраняем текущее состояние контекста
            canvasActive.ctx.save();

            // Применяем трансформации
            canvasActive.ctx.translate(canvasActive.image.center.x, canvasActive.image.center.y)
            canvasActive.ctx.rotate(canvasActive.image.rotate)



            // const scale = Math.min(
            //     canvasActive.html.width / canvasImage.width,
            //     canvasActive.html.height / canvasImage.height
            // ) * 1

            // const x = (canvasActive.html.width - canvasImage.width * scale) / 2
            // const y = (canvasActive.html.height - canvasImage.height * scale) / 2

            // this.canvas.svg.ctx.drawImage(
            //     canvasActive.image.canvasImage,
            //     x,
            //     y,
            //     canvasImage.width * scale,
            //     canvasImage.height * scale
            // )
            
            
            
            // Отрисовываем продукт
            canvasActive.ctx.drawImage(
                canvasActive.image.canvasImage, 
                -canvasActive.image.size.width / 2, 
                -canvasActive.image.size.height / 2, 
                canvasActive.image.size.width, 
                canvasActive.image.size.height
            )

            // if (canvasActive.name == "image 1") {
            //     canvasActive.ctx.drawImage(
            //         canvasActive.image.layersImage[1], 
            //         -canvasActive.image.size.width / 2, 
            //         -canvasActive.image.size.height / 2, 
            //         canvasActive.image.size.width, 
            //         canvasActive.image.size.height
            //     )
            // }

            canvasActive.ctx.restore();
        },

        printBorderImage(canvas){
            let canvasActive = canvas ? canvas : this.canvas.linkCanvasActive
            let canvasBorder = this.canvas.border

            canvasBorder.ctx.clearRect(0, 0, this.canvas.border.html.width, this.canvas.border.html.height)

            canvasBorder.ctx.strokeStyle = "rgb(235, 235, 235)";
            canvasBorder.ctx.lineWidth = 1;

            let radiusArc = 6

            let item = canvasActive.image

            // Сохраняем текущее состояние контекста
            canvasBorder.ctx.save();

            // Применяем трансформации
            canvasBorder.ctx.translate(canvasActive.image.center.x, canvasActive.image.center.y)
            canvasBorder.ctx.rotate(canvasActive.image.rotate)

            let coordX = -item.size.width / 2
            let coordY = -item.size.height / 2

            canvasBorder.ctx.beginPath()
                // старт и круг
                canvasBorder.ctx.moveTo(
                    coordX, coordY,
                );
                canvasBorder.ctx.lineTo(
                    coordX+item.size.width-radiusArc, coordY,
                );
                canvasBorder.ctx.moveTo(
                    coordX+item.size.width+radiusArc, coordY,
                );
                canvasBorder.ctx.arc(
                    coordX+item.size.width, coordY,

                    radiusArc, 0, Math.PI*2,

                    true
                );
                canvasBorder.ctx.moveTo(
                    coordX+item.size.width, coordY+radiusArc,
                );

                // право верх - право середина 
                if (this.canvas.layers.canvasActive != 0) {
                    canvasBorder.ctx.lineTo(
                        coordX+item.size.width, coordY+item.size.height/2-5,
                    );
                    canvasBorder.ctx.lineTo(
                        coordX+item.size.width+5, coordY+item.size.height/2-5,
                    );
                    canvasBorder.ctx.lineTo(
                        coordX+item.size.width+5, coordY+item.size.height/2+5,
                    );
                    canvasBorder.ctx.lineTo(
                        coordX+item.size.width-5, coordY+item.size.height/2+5,
                    );
                    canvasBorder.ctx.lineTo(
                        coordX+item.size.width-5, coordY+item.size.height/2-5,
                    );
                    canvasBorder.ctx.lineTo(
                        coordX+item.size.width, coordY+item.size.height/2-5,
                    );
                    canvasBorder.ctx.moveTo(
                        coordX+item.size.width, coordY+item.size.height/2+5,
                    );
                }

                // право середина - нижняя часть
                canvasBorder.ctx.lineTo(
                    coordX+item.size.width, coordY+item.size.height-5,
                );
                canvasBorder.ctx.lineTo(
                    coordX+item.size.width+5, coordY+item.size.height-5,
                );
                canvasBorder.ctx.lineTo(
                    coordX+item.size.width+5, coordY+item.size.height+5,
                );
                canvasBorder.ctx.lineTo(
                    coordX+item.size.width-5, coordY+item.size.height+5,
                );
                canvasBorder.ctx.lineTo(
                    coordX+item.size.width-5, coordY+item.size.height-5,
                );
                canvasBorder.ctx.lineTo(
                    coordX+item.size.width, coordY+item.size.height-5,
                );
                canvasBorder.ctx.moveTo(
                    coordX+item.size.width-5, coordY+item.size.height,
                );

                // нижняя часть - лево
                if (this.canvas.layers.canvasActive != 0) {
                    canvasBorder.ctx.lineTo(
                        coordX+item.size.width/2+5, coordY+item.size.height,
                    );
                    canvasBorder.ctx.lineTo(
                        coordX+item.size.width/2+5, coordY+item.size.height+5,
                    );
                    canvasBorder.ctx.lineTo(
                        coordX+item.size.width/2-5, coordY+item.size.height+5,
                    );
                    canvasBorder.ctx.lineTo(
                        coordX+item.size.width/2-5, coordY+item.size.height-5,
                    );
                    canvasBorder.ctx.lineTo(
                        coordX+item.size.width/2+5, coordY+item.size.height-5,
                    );
                    canvasBorder.ctx.lineTo(
                        coordX+item.size.width/2+5, coordY+item.size.height,
                    );
                    canvasBorder.ctx.moveTo(
                        coordX+item.size.width/2-5, coordY+item.size.height,
                    );
                }

                // замыкание
                canvasBorder.ctx.lineTo(
                    coordX, coordY+item.size.height,
                );
                canvasBorder.ctx.lineTo(
                    coordX, coordY,
                );

            // Восстанавливаем состояние контекста
            canvasBorder.ctx.stroke()
            canvasBorder.ctx.restore();
        },

        setItemPosition(canvas) {
            let item = canvas ? canvas.image : this.canvas.linkCanvasActive.image

            item.points = {
                'left-top': {
                    x: item.position.x,
                    y: item.position.y
                },
                'right-top': {
                    x: item.position.x + item.size.width,
                    y: item.position.y
                },
                'scale-width': {
                    x: item.position.x + item.size.width,
                    y: item.position.y + item.size.height/2
                },
                'right-bottom': {
                    x: item.position.x + item.size.width,
                    y: item.position.y + item.size.height
                },
                'scale-height': {
                    x: item.position.x + item.size.width/2,
                    y: item.position.y + item.size.height
                },
                'left-bottom': {
                    x: item.position.x,
                    y: item.position.y + item.size.height
                },
                'min-max': {
                    max: {
                        x:0,
                        y:0
                    },
                    min: {
                        x: item.position.x,
                        y: item.position.y
                    }
                }
            }
            item.center = {
                x: item.position.x + item.size.width/2,
                y: item.position.y + item.size.height/2,
            }
        
            let ssin = Math.sin(item.rotate);
            let scos = Math.cos(item.rotate);

            for (const key in item.points) {
                if (key == 'min-max') break

                item.points[key].x = item.center.x + (item.points[key].x - item.center.x) * scos - (item.points[key].y - item.center.y) * ssin;
                if(item.points[key].x > item.points['min-max'].max.x) item.points['min-max'].max.x = item.points[key].x
                if(item.points[key].x < item.points['min-max'].min.x) item.points['min-max'].min.x = item.points[key].x

                item.points[key].y = item.center.y + (item.points[key].x - item.center.x) * ssin + (item.points[key].y - item.center.y) * scos;
                if(item.points[key].y > item.points['min-max'].max.y) item.points['min-max'].max.y = item.points[key].y
                if(item.points[key].y < item.points['min-max'].min.y) item.points['min-max'].min.y = item.points[key].y
            }
        },



        async uploadImageInput(e, index) {
            const reader = new FileReader();
            const file = e.target.files[0]

            reader.readAsDataURL(file)
            reader.onload = async (result) => {
                this.canvas.linkCanvasActive = await this.createCanvas(result.target.result, index, this.canvas.colorCount)
                this.renderPrint(this.canvas.linkCanvasActive)
                this.printBorderImage()
            }
        },

        async updateCanvas(canvas) {
            this.renderPrint(canvas ? canvas : this.canvas.linkCanvasActive)
            this.printBorderImage()
        },
   


        startDragging() {
            this.canvas.drag = true
        },

        drag(e) {
            if (!this.canvas.drag ) return
            
            let item = this.canvas.linkCanvasActive.image

            switch (this.canvas.action) {
                case 'rotate':
                    this.canvas.methods.rotate(e)
                    break;

                case 'scale':
                    this.canvas.methods.scale(e)
                    break;

                case 'scaleWidth':
                    if (this.canvas.layers.canvasActive != 0) this.canvas.methods.scaleWidth(e)
                    break;

                case 'scaleHeight':
                    if (this.canvas.layers.canvasActive != 0) this.canvas.methods.scaleHeight(e)
                    break;

                case 'move':
                    this.canvas.methods.move(e)
                    break;
            }
            
            if (!this.canvas.action) {
                if (
                    item.points['right-top'].x-6 <= e.offsetX && item.points['right-top'].x+6 >= e.offsetX &&
                    item.points['right-top'].y-6 <= e.offsetY && item.points['right-top'].y+6 >= e.offsetY 
                ){ this.canvas.action = 'rotate' } 

                if (
                    item.points['right-bottom'].x-6 <= e.offsetX && item.points['right-bottom'].x+6 >= e.offsetX &&
                    item.points['right-bottom'].y-6 <= e.offsetY && item.points['right-bottom'].y+6 >= e.offsetY 
                ){ this.canvas.action = 'scale' }

                if (
                    item.points['scale-width'].x-6 <= e.offsetX && item.points['scale-width'].x+6 >= e.offsetX &&
                    item.points['scale-width'].y-6 <= e.offsetY && item.points['scale-width'].y+6 >= e.offsetY 
                ){ this.canvas.action = 'scaleWidth' }

                if (
                    item.points['scale-height'].x-6 <= e.offsetX && item.points['scale-height'].x+6 >= e.offsetX &&
                    item.points['scale-height'].y-6 <= e.offsetY && item.points['scale-height'].y+6 >= e.offsetY 
                ){ this.canvas.action = 'scaleHeight' }

                if (
                    item.points['min-max'].min.x <= e.offsetX && item.points['min-max'].max.x >= e.offsetX &&
                    item.points['min-max'].min.y <= e.offsetY && item.points['min-max'].max.y >= e.offsetY
                ){ this.canvas.action = 'move' } 
            }

            item.center = { // ERROR что то не так с rotate или center
                x: item.position.x + item.size.width/2,
                y: item.position.y + item.size.height/2,
            }

            this.renderPrint()
            this.printBorderImage()
        },

        stopDragging() {
            this.setItemPosition()

            this.canvas.drag = false
            this.canvas.action = ''
            this.canvas.offsetX = 0
            this.canvas.offsetY = 0

            let image = this.canvas.linkCanvasActive.image
            image.ratio = image.size.width/image.size.height
        },



        changeFullscreen() {
            let customRedactor = document.querySelector('.redactor')
            this.canvas.fullscreen = !this.canvas.fullscreen

            if (this.canvas.fullscreen) {
                customRedactor.classList.add('redactor--fullscreen')
                customRedactor.style.cssText = `
                    top: -${0}px;
                    left: -${0}px;
                `
            } else {
                customRedactor.classList.remove('redactor--fullscreen')
                customRedactor.style.cssText = `
                    top: auto;
                    left: auto;
                `
            }

            let customRedactorWidth = customRedactor.offsetWidth
            let customRedactorHeight = customRedactor.offsetHeight

            this.canvas.border.height = customRedactorHeight
            this.canvas.border.html.height = customRedactorHeight
            this.canvas.border.width = customRedactorWidth
            this.canvas.border.html.width = customRedactorWidth       

            this.canvas.layers.forEach(layer => {                
                layer.height = customRedactorHeight
                layer.html.height = customRedactorHeight
                layer.width = customRedactorWidth
                layer.html.width = customRedactorWidth
            })

            this.canvas.methods.globalItemsPosition()

            this.canvas.layers.forEach(layer => {
                layer.image.position.x = (layer.width/2) - 
                    (this.canvas.globalItemsPositions.max.x - this.canvas.globalItemsPositions.min.x)/2 + 
                    (layer.image.position.x - this.canvas.globalItemsPositions.min.x)
                layer.image.position.y = (layer.height/2) - 
                    (this.canvas.globalItemsPositions.max.y - this.canvas.globalItemsPositions.min.y)/2 + 
                    (layer.image.position.y - this.canvas.globalItemsPositions.min.y)

                this.setItemPosition(layer)
                this.updateCanvas(layer)
            })
        },

        moveLayers(what, where) {
            let arr = this.canvas.layers
            let item = arr[where]
            arr[where] = arr[what]
            arr[what] = item

            if(this.canvas.layers.canvasActive == what) {
                this.canvas.layers.canvasActive = where
            } else if(this.canvas.layers.canvasActive == where) {
                this.canvas.layers.canvasActive = what
            }

            arr.forEach((item, index) => {
                item.html.style.zIndex = index+1
            });

            this.updateCanvas()
        },



        async processingImage(image, colorCount) {            
            const result = {}

            // Обработка слоев
            result.layers = await this.convertColorImage(image, colorCount)
            
            // Векторизация
            result.vectors = await Promise.all(
                result.layers.map(layer => this.vectorizeImage(layer))
            )
            
            // Конвертация в команды
            result.commands = await Promise.all(
                result.vectors.map(vector => this.svgToCommands(vector))
            )
            
            // Создание превью
            result.previews = await Promise.all(
                result.commands.map((command, index) => 
                    this.createImageFromCommands(command, this.getGrayShade(index, colorCount), image.width, image.height)
                )
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
                            
                            points.push(false, x1, y1, x2, y2, x, y)
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



        async sendbuyerInfo() {
            
        },


        // async processingImage(image, colorCount) {            
        //     const result = {}

        //     // Обработка слоев
        //     result.layers = await this.convertColorImage(image, colorCount)
            
        //     // Векторизация
        //     result.vectors = await Promise.all(
        //         result.layers.map(layer => this.vectorizeImage(layer))
        //     )
            
        //     // Конвертация в команды
        //     result.commands = await Promise.all(
        //         result.vectors.map(vector => this.svgToCommands(vector))
        //     )
            
        //     // Создание превью
        //     result.previews = await Promise.all(
        //         result.commands.map((command, index) => 
        //             this.createImageFromCommands(command, this.getGrayShade(index, colorCount), image.width, image.height)
        //         )
        //     )

        //     // Финальное изображение
        //     result.image = await this.createMainImage(result.previews)

        //     return {
        //         image: result.image,
        //         commands: result.commands
        //     }
        // },

        // async convertColorImage(image, colorCount) {
        //     const canvas = document.createElement('canvas')
        //         canvas.width = image.width
        //         canvas.height = image.height
        //     const ctx = canvas.getContext('2d')
        //     ctx.drawImage(image, 0, 0)
            
        //     const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        //     const resultLayers = Array.from({ length: colorCount }, () => 
        //         ctx.createImageData(canvas.width, canvas.height)
        //     )

        //     const colorStep = (255 * 3) / colorCount

        //     for (let i = 0; i < originalImageData.data.length; i += 4) {
        //         const [r, g, b, a] = originalImageData.data.slice(i, i + 4)
        //         const brightness = r + g + b
        //         const indexLayer = Math.min(Math.round(brightness / colorStep), colorCount - 1)
                
        //         if (a > 0) {
        //             const layerData = resultLayers[indexLayer].data
        //             layerData.set([0, 0, 0, 255], i)
        //         }
        //     }

        //     const createImageFromImageData = (imageData, canvas) => {
        //         const ctx = canvas.getContext('2d')
        //         ctx.clearRect(0, 0, canvas.width, canvas.height)
        //         ctx.putImageData(imageData, 0, 0)

        //         return new Promise((resolve) => {
        //             const img = new Image()
        //             img.onload = () => resolve(img)
        //             img.src = canvas.toDataURL('image/png')
        //         })
        //     }

        //     return Promise.all(
        //         resultLayers.map(layer => createImageFromImageData(layer, canvas))
        //     )
        // },

        // async vectorizeImage(image, color = '#000000') {       
        //     // 1. Создаем временный canvas
        //     const canvas = document.createElement('canvas')
        //         canvas.width = image.width
        //         canvas.height = image.height
        //     const ctx = canvas.getContext('2d')
        //     ctx.drawImage(image, 0, 0)

        //     // 2. Получаем ImageData
        //     const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        //     // 3. Векторизация через Potrace

        //     const params = {
        //         color: color,
        //         threshold: 128,
        //         turdSize: 0,
        //         optCurve: false,
        //         optTolerance: 0,
        //         turnPolicy: Potrace.POTRACE_TURNPOLICY_MINORITY
        //     }

        //     return new Promise((resolve) => {
        //         Potrace.trace(imageData, params, (err, svg) => {
        //             if (err) throw err
        //             resolve(svg)
        //         })
        //     })
        // },

        // async svgToCommands(svgString) {
        //     const parser = new DOMParser()
        //     const doc = parser.parseFromString(svgString, "image/svg+xml")
        //     const svg = doc.querySelector('svg')
        //     const pathElements = doc.querySelectorAll('path')
            
        //     // Получаем исходные размеры SVG
        //     let svgWidth, svgHeight
            
        //     if (svg.hasAttribute('viewBox')) {
        //         const viewBox = svg.getAttribute('viewBox').split(/\s+|,/).filter(Boolean)
        //         svgWidth = parseFloat(viewBox[2])
        //         svgHeight = parseFloat(viewBox[3])
        //     } else {
        //         svgWidth = parseFloat(svg.getAttribute('width')) || 0
        //         svgHeight = parseFloat(svg.getAttribute('height')) || 0
        //     }
            
        //     if (!svgWidth || !svgHeight) {
        //         svgWidth = 100
        //         svgHeight = 100
        //         console.warn("SVG dimensions not found. Using default 100x100.")
        //     }
            
        //     const commands = []

        //     // Обработка векторных путей в оригинальных размерах
        //     pathElements.forEach(path => {
        //         const pathData = path.getAttribute('d')
        //         if (!pathData) return
                
        //         let currentX = 0
        //         let currentY = 0
        //         let subpathStartX = 0
        //         let subpathStartY = 0
                
        //         const tokens = pathData.match(/[a-df-z]|[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/gi) || []
        //         let i = 0
                
        //         while (i < tokens.length) {
        //             const cmd = tokens[i++].toLowerCase()
        //             let points = []
                    
        //             // MoveTo (M)
        //             if (cmd === 'm') {
        //                 const x = parseFloat(tokens[i++])
        //                 const y = parseFloat(tokens[i++])

        //                 points.push(false, x, y)
        //                 currentX = x
        //                 currentY = y
        //                 subpathStartX = x
        //                 subpathStartY = y
                        
        //                 // Дополнительные координаты → LineTo (L)
        //                 while (i < tokens.length && !isNaN(tokens[i])) {
        //                     const x = parseFloat(tokens[i++])
        //                     const y = parseFloat(tokens[i++])
                            
        //                     points.push(true, x, y)
        //                     currentX = x
        //                     currentY = y
        //                 }
        //             }
        //             // LineTo (L)
        //             else if (cmd === 'l') {
        //                 while (i < tokens.length && !isNaN(tokens[i])) {
        //                     const x = parseFloat(tokens[i++])
        //                     const y = parseFloat(tokens[i++])
                            
        //                     points.push(true, x, y)
        //                     currentX = x
        //                     currentY = y
        //                 }
        //             }
        //             // Cubic Bezier (C)
        //             else if (cmd === 'c') {
        //                 while (i < tokens.length && !isNaN(tokens[i])) {
        //                     const x1 = parseFloat(tokens[i++])
        //                     const y1 = parseFloat(tokens[i++])
        //                     const x2 = parseFloat(tokens[i++])
        //                     const y2 = parseFloat(tokens[i++])
        //                     const x = parseFloat(tokens[i++])
        //                     const y = parseFloat(tokens[i++])
                            
        //                     points.push(true, x1, y1, x2, y2, x, y)
        //                     currentX = x
        //                     currentY = y
        //                 }
        //             }
        //             // ClosePath (Z)
        //             else if (cmd === 'z') {
        //                 points.push(true, subpathStartX, subpathStartY)
        //                 currentX = subpathStartX
        //                 currentY = subpathStartY
        //             }
                    
        //             if (points.length > 0) {
        //                 commands.push(points)
        //             }
        //         }
        //     })



        //     const canvas = document.createElement('canvas')
        //         canvas.width = svgWidth
        //         canvas.height = svgHeight
        //     const ctx = canvas.getContext('2d')
            
        //     // Рендерим SVG на canvas
        //     const img = new Image()
        //     await new Promise(resolve => {
        //         img.onload = resolve
        //         img.src = 'data:image/svg+xml,' + encodeURIComponent(svgString)
        //     })
            
        //     ctx.drawImage(img, 0, 0, svgWidth, svgHeight)
        //     const imageData = ctx.getImageData(0, 0, svgWidth, svgHeight)
            
        //     // Генерируем линии
        //     const { width, height, data } = imageData

        //     for (let y = 0; y < height; y++) {
        //         let isLaserOn = false

        //         for (let x = 0; x < width; x++) {
        //             const index = (y * width + x) * 4
        //             const isBlack = data[index] === 0 &&    // R
        //                 data[index + 1] === 0 &&            // G
        //                 data[index + 2] === 0 &&            // B
        //                 data[index + 3] > 0                 // Alpha (не прозрачный)

        //             if (isBlack && !isLaserOn) {
        //                 commands.push([false, x++, y])
        //                 isLaserOn = true
        //             } else if (!isBlack && isLaserOn) {
        //                 commands.push([true, x--, y])
        //                 isLaserOn = false
        //             }
        //         }

        //         if (isLaserOn) commands.push([false, width, y])
        //     }

        //     return commands
        // },

        // async createImageFromCommands(commands, color = "#000000", width = 600, height = 600) {
        //     // Создаем холст в памяти
        //     const canvas = document.createElement('canvas');
        //         canvas.width = width;
        //         canvas.height = height;
        //     const ctx = canvas.getContext('2d');
            
        //     // Настраиваем стиль линии (можно параметризировать при необходимости)
        //     ctx.strokeStyle = color;
        //     ctx.lineWidth = 2;
            
        //     // Выполняем отрисовку команд
        //     commands.forEach(points => {
        //         const [active, ...coords] = points;
                
        //         if (!active) {
        //             ctx.moveTo(coords[0], coords[1]); // MoveTo
        //         } 
        //         else if (coords.length === 2) {
        //             ctx.lineTo(coords[0], coords[1]); // LineTo или ClosePath
        //         } 
        //         else if (coords.length === 6) {
        //             ctx.bezierCurveTo(
        //                 coords[0], coords[1],
        //                 coords[2], coords[3],
        //                 coords[4], coords[5]
        //             );
        //         }
        //     });

        //     ctx.stroke();
            
        //     // Создаем изображение из холста
        //     return new Promise((resolve) => {
        //         const img = new Image();
        //         img.onload = () => resolve(img);
        //         img.src = canvas.toDataURL();
        //     });
        // },

        // async createMainImage(images) {
        //     return new Promise((resolve) => {
        //         // Создаем canvas и получаем исходное изображение
        //         const canvas = document.createElement('canvas')
        //             canvas.width = images[0].width
        //             canvas.height = images[0].height
        //         const ctx = canvas.getContext('2d')

        //         images.forEach(image => {
        //            ctx.drawImage(image, 0, 0) 
        //         })

        //         const img = new Image();
        //             img.onload = () => resolve(img);
        //         img.src = canvas.toDataURL('image/png');
        //     })
        // },



        getGrayShade(index, total) {
            if (total <= 1) return '#000000'
            
            // Рассчитываем значение от 0 (чёрный) до 255 (белый)
            const value = Math.round((index / (total - 1)) * 255)
            
            // Конвертируем в HEX и форматируем
            const hex = value.toString(16).padStart(2, '0')
            return `#${hex}${hex}${hex}`
        },






        async imageToBase64(url) {
            const response = await fetch(url);
            const blob = await response.blob();

            return await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            })
        },

        // async convertColorImage(image, colorCount) {
        //     return new Promise((resolve) => {
        //         // Создаем виртуальный canvas
        //         const canvas = document.createElement('canvas')
        //             canvas.width = image.width
        //             canvas.height = image.height
        //         const ctx = canvas.getContext('2d')
                
        //         // Рисуем изображение на canvas
        //         ctx.drawImage(image, 0, 0, image.width, image.height)
                
        //         // Перебираем и заменяем пиксели
        //         const colorStep = (255 * 3) / colorCount
        //         const imageData = ctx.getImageData(0, 0, image.width, image.height)
        //         const data = imageData.data

        //         for (let i = 0; i < data.length; i += 4) {
        //             const brightness = data[i] + data[i + 1] + data[i + 2]
        //             const color = (Math.round(brightness / colorStep) * colorStep) / 3
        //             data[i] = data[i + 1] = data[i + 2] = color
        //         }

        //         // Применяем изменения
        //         ctx.putImageData(imageData, 0, 0)
                
        //         // Создаем новое изображение
        //         const imageNew = new Image()
        //         imageNew.onload = () => resolve(imageNew)
        //         imageNew.src = canvas.toDataURL('image/png')
        //     })
        // },

        // async imageToSvg(image) {
        //     return new Promise((resolve, reject) => {
        //         // Создаем canvas и рисуем изображение
        //         const canvas = document.createElement('canvas')
        //             canvas.width = image.width
        //             canvas.height = image.height
        //         const ctx = canvas.getContext('2d')
        //         ctx.drawImage(image, 0, 0)

        //         // Получаем ImageData 
        //         const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        //         const params = {
        //             color: '#000000',
        //             threshold: 128,
        //             turdSize: 0,
        //             optCurve: false,
        //             optTolerance: 0,
        //             turnPolicy: Potrace.POTRACE_TURNPOLICY_MINORITY
        //         }

        //         Potrace.trace(imageData, params, function(err, svg) {
        //             if (err) {
        //                 reject(err)
        //             } else {
        //                 resolve(svg)
        //             }
        //         })
        //     });
        // },

        // downloadSVG(svgString, filename = 'image.svg') {
        //     // Создаем data URL из SVG-строки
        //     const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        //     const svgUrl = URL.createObjectURL(svgBlob);

        //     // Создаем ссылку для скачивания
        //     const link = document.createElement('a');
        //     link.href = svgUrl;
        //     link.download = filename;

        //     // Добавляем в DOM, кликаем и удаляем
        //     document.body.appendChild(link);
        //     link.click();
        //     document.body.removeChild(link);

        //     // Освобождаем память (чистим URL)
        //     setTimeout(() => URL.revokeObjectURL(svgUrl), 100);
        // },

        // async convertColorImage(image, colorCount) {
        //     return new Promise((resolve) => {
        //         // Создаем виртуальный canvas для обработки
        //         const canvas = document.createElement('canvas');
        //             canvas.width = image.width;
        //             canvas.height = image.height;
        //         const ctx = canvas.getContext('2d');

        //         // Рисуем изображение на canvas
        //         ctx.drawImage(image, 0, 0, image.width, image.height);
        //         const imageData = ctx.getImageData(0, 0, image.width, image.height);
        //         const data = imageData.data;

        //         // Вычисляем шаг для каждого оттенка
        //         const maxBrightness = 255 * 3;
        //         const colorStep = maxBrightness / colorCount;
        //         const layers = [];

        //         // Создаем общий массив для хранения всех оттенков
        //         const shades = [];
        //         for (let i = 0; i < colorCount; i++) {
        //             shades.push(Math.round(i * colorStep) / 3); // Нормализуем на 1 канал (RGB одинаковые)
        //         }

        //         // Создаем общую картинку (как в оригинале)
        //         const mergedImageData = ctx.getImageData(0, 0, image.width, image.height);
        //         const mergedData = mergedImageData.data;

        //         for (let i = 0; i < mergedData.length; i += 4) {
        //             const brightness = mergedData[i] + mergedData[i + 1] + mergedData[i + 2];
        //             const shadeIndex = Math.min(
        //                 Math.floor(brightness / colorStep),
        //                 colorCount - 1
        //             );
        //             const color = shades[shadeIndex];
        //             mergedData[i] = mergedData[i + 1] = mergedData[i + 2] = color;
        //         }
        //         ctx.putImageData(mergedImageData, 0, 0);

        //         // Создаем слой для каждого оттенка
        //         shades.forEach((shade) => {
        //             const layerCanvas = document.createElement('canvas');
        //                 layerCanvas.width = image.width;
        //                 layerCanvas.height = image.height;
        //             const layerCtx = layerCanvas.getContext('2d');
        //             const layerImageData = layerCtx.createImageData(image.width, image.height);
        //             const layerData = layerImageData.data;

        //             for (let i = 0; i < data.length; i += 4) {
        //                 const r = data[i];
        //                 const g = data[i + 1];
        //                 const b = data[i + 2];
        //                 const brightness = r + g + b;
        //                 const currentShade = Math.round(brightness / colorStep) * colorStep / 3;

        //                 if (Math.abs(currentShade - shade) < 0.1) { // Учитываем погрешность округления
        //                     layerData[i] = r;
        //                     layerData[i + 1] = g;
        //                     layerData[i + 2] = b;
        //                     layerData[i + 3] = 255; // Непрозрачный
        //                 } else {
        //                     layerData[i + 3] = 0; // Прозрачный
        //                 }
        //             }

        //             layerCtx.putImageData(layerImageData, 0, 0);
        //             layers.push(layerCanvas);
        //         });

        //         // Создаем итоговые изображения
        //         const resultImage = new Image();
        //         resultImage.onload = () => {
        //             const resultLayers = layers.map((layerCanvas) => {
        //                 const layerImage = new Image();
        //                     layerImage.src = layerCanvas.toDataURL('image/png');
        //                 return layerImage;
        //             });

        //             resolve({
        //                 image: resultImage, // Общая картинка в оттенках серого
        //                 layers: resultLayers, // Массив слоёв (по одному на оттенок)
        //             });
        //         };
        //         resultImage.src = canvas.toDataURL('image/png');
        //     });
        // }












        
        // createCanvas(name) {
        //     const htmlCanvas = document.createElement('canvas')

        //     this.canvas.layers[name] = {
        //         name: 'image ' + name,
        //         html: htmlCanvas,
        //         ctx: htmlCanvas.getContext("2d"),
        //         image: {
        //             originImage: null,
        //             canvasImage: null,
        //             size: {
        //                 width: 0,
        //                 height: 0,
        //             },
        //             center: {
        //                 x: 0,
        //                 y: 0,
        //             },
        //             position: {
        //                 x: 0,
        //                 y: 0,
        //             },
        //             rotate: 0,
        //             ratio: 0
        //         }
        //     }
        // },

        // updateImage(name, dataImage, colorCount){
        //     if(this.canvas.layers[name]) {
        //         this.canvas.layers[name].image = {
        //                  originImage: img,
        //                  canvasImage: this.convertColorImage(img, this.colorCount),
        //                  size: {
        //                      width: imgWidth,
        //                      height: imgHeight,
        //                  },
        //                  center: {
        //                      x: htmlCanvas.offsetWidth/2,
        //                      y: htmlCanvas.offsetHeight/2,
        //                  },
        //                  position: {
        //                      x: htmlCanvas.offsetWidth/2 - imgWidth/2,
        //                      y: htmlCanvas.offsetHeight/2 - imgHeight/2,
        //                  },
        //                  rotate: 0,
        //                  ratio: img.width/img.height
        //              }
        //         this.canvas.layers[name].originImage = dataImage
        //         this.canvas.layers[name].canvasImage = this.convertColorImage(dataImage, colorCount)
        //     }
        // },










        // createCanvas(imageData, name){
        //     const img = new Image()
        //     img.onload = () => {
        //         const imgHeight = htmlCanvas.offsetHeight/3
        //         const imgWidth = imgHeight*img.width/img.height

        //         this.canvas.layers[name] = {
        //             name: 'image ' + name,
        //             html: htmlCanvas,
        //             ctx: htmlCanvas.getContext("2d"),
        //             image: {
        //                 originImage: img,
        //                 canvasImage: this.convertColorImage(img, this.colorCount),
        //                 size: {
        //                     width: imgWidth,
        //                     height: imgHeight,
        //                 },
        //                 center: {
        //                     x: htmlCanvas.offsetWidth/2,
        //                     y: htmlCanvas.offsetHeight/2,
        //                 },
        //                 position: {
        //                     x: htmlCanvas.offsetWidth/2 - imgWidth/2,
        //                     y: htmlCanvas.offsetHeight/2 - imgHeight/2,
        //                 },
        //                 rotate: 0,
        //                 ratio: img.width/img.height
        //             }
        //         }

        //         // this.canvas.layers[index].html.width = this.canvas.layers[index].width
        //         // this.canvas.layers[index].html.height = this.canvas.layers[index].height

        //         // this.canvas.linkCanvasActive = this.canvas.layers[index]
        //         // this.setItemPosition()
        //         // this.updateCanvas()
        //     }
        //     img.src = imageData
        // },

        // createCanvas(name) {
            // const imageProduct = new Image()
            //     imageProduct.src = `./images/market/${name}-custom.png`

            // let canvasProduct = this.catalogItems[name].canvas
            //     canvasProduct.html = document.querySelector('#custom-redactor-canvas-product')
            //     console.log(canvasProduct);
            //     canvasProduct.width = canvasProduct.html.width
            //     canvasProduct.height = canvasProduct.html.height
            //     canvasProduct.ctx = canvasProduct.html.getContext("2d")

            // // Отрисовываем продукт
            // canvasProduct.ctx.drawImage(
            //     imageProduct, 
            //     -canvasProduct.width / 2, 
            //     -canvasProduct.height / 2, 
            //     canvasProduct.width, 
            //     canvasProduct.height
            // )
            
        // },

        // updateUpload(e, index) {
        //     const reader = new FileReader();
        //     const file = e.target.files[0]

        //     reader.readAsDataURL(file)
        //     reader.onload = (result) => {
        //         let htmlCanvas

        //         if (this.canvas.layers[index]) {
        //             htmlCanvas = this.canvas.layers[index].html
        //         } else {
        //             htmlCanvas = document.createElement('canvas')
        //                 htmlCanvas.classList.add('redactor-canvas')
        //                 htmlCanvas.setAttribute("id", `custom-redactor-canvas-${index}`);
        //             document.querySelector('.redactor-canvas-container').appendChild(htmlCanvas)
        //         }

        //         const img = new Image()
        //         img.onload = () => {
        //             const imgheight = htmlCanvas.offsetHeight/3
        //             const imgWidth = imgheight*img.width/img.height

        //             this.canvas.layers[index] = {
        //                 name: 'image ' + index,
        //                 html: htmlCanvas,
        //                 ctx: htmlCanvas.getContext("2d"),
        //                 image: {
        //                     originImage: img,
        //                     canvasImage: this.convertColorImage(img, this.colorCount),
        //                     size: {
        //                         width: imgWidth,
        //                         height: imgheight,
        //                     },
        //                     center: {
        //                         x: htmlCanvas.offsetWidth/2,
        //                         y: htmlCanvas.offsetHeight/2,
        //                     },
        //                     position: {
        //                         x: htmlCanvas.offsetWidth/2 - imgWidth/2,
        //                         y: htmlCanvas.offsetHeight/2 - imgheight/2,
        //                     },
        //                     rotate: 0,
        //                     ratio: img.width/img.height
        //                 }
        //             }

        //             // this.canvas.layers[index].html.width = this.canvas.layers[index].width
        //             // this.canvas.layers[index].html.height = this.canvas.layers[index].height

        //             this.canvas.linkCanvasActive = this.canvas.layers[index]
        //             // this.setItemPosition()
        //             // this.updateCanvas()
        //         }
        //         img.src = result.target.result                    
        //     }
        // },

        // convertColorImage(image, colorCount) {
        //     // Создаем виртуальный canvas
        //     const canvas = document.createElement('canvas')
        //         canvas.width = image.width
        //         canvas.height = image.height
        //     const ctx = canvas.getContext('2d')
            
        //     // Рисуем изображение на canvas
        //     ctx.drawImage(image, 0, 0, image.width, image.height)
            

        //     // Перебираем и заменяем пиксели
        //     const colorStep = (255*3)/colorCount
        //     const imageData = ctx.getImageData(0, 0, image.width, image.height).data

        //     for (let i = 0; i < imageData.length; i += 4) {
        //         const brightness = imageData[i] + imageData[i + 1] + imageData[i + 2]

        //         const color = (Math.round(brightness/colorStep) * colorStep)/3

        //         imageData[i] = imageData[i + 1] = imageData[i + 2] = color
        //     }

            
        //     // Создаем новое изображение с результатом
        //     const imageNew = new Image()
        //     imageNew.onload = () => { return imageNew }
        //     imageNew.src = canvas.toDataURL('image/png')
        // },














        // updateUpload(e, index) {
        //     let reader = new FileReader();
        //     let file = e.target.files[0]

        //     reader.readAsDataURL(file)
        //     reader.onload = (result) => {
        //         let htmlCanvas

        //         if (this.canvas.layers.canvasList[index]) {
        //             htmlCanvas = this.canvas.layers.canvasList[index].html
        //         } else {
        //             htmlCanvas = document.createElement('canvas')
        //                 htmlCanvas.classList.add('redactor-canvas')
        //                 htmlCanvas.setAttribute("id", `custom-redactor-canvas-${index}`);
        //                 document.querySelector('.redactor-canvas-container').appendChild(htmlCanvas)
        //         }

        //         let img = new Image()
        //         img.onload = () => {
        //             img = this.convertToBlackAndWhite(img, this.colorCount)

        //             let imgWidth = 200*img.width/img.height

        //             this.canvas.layers.canvasList[index] = {
        //                 name: 'image ' + index,
        //                 html: htmlCanvas,
        //                 ctx: htmlCanvas.getContext("2d"),
        //                 width: htmlCanvas.offsetWidth,
        //                 height: htmlCanvas.offsetHeight,
        //                 image: {
        //                     canvasImage: img,
        //                     size: {
        //                         width: imgWidth,
        //                         height: 200,
        //                     },
        //                     center: {
        //                         x: htmlCanvas.offsetWidth/2,
        //                         y: htmlCanvas.offsetHeight/2,
        //                     },
        //                     position: {
        //                         x: htmlCanvas.offsetWidth/2 - imgWidth/2,
        //                         y: htmlCanvas.offsetHeight/2 - 100,
        //                     },
        //                     rotate: 0,
        //                     ratio: img.width/img.height
        //                 }
        //             }

        //             this.canvas.layers.canvasList[index].html.width = this.canvas.layers.canvasList[index].width
        //             this.canvas.layers.canvasList[index].html.height = this.canvas.layers.canvasList[index].height

        //             this.canvas.linkCanvasActive = this.canvas.layers.canvasList[index]
        //             this.setItemPosition()
        //             this.updateCanvas()
        //         }
        //         img.src = result.target.result                    
        //     }
        // },

        // initCanvas() {
        //     this.canvas.canvasBorder.html = document.querySelector('#custom-redactor-canvas-border')
        //         this.canvas.canvasBorder.html.width = this.canvas.canvasBorder.html.offsetWidth
        //         this.canvas.canvasBorder.html.height = this.canvas.canvasBorder.html.offsetHeight
        //     this.canvas.canvasBorder.ctx = this.canvas.canvasBorder.html.getContext("2d")


        //     let htmlCanvas = document.querySelector('#custom-redactor-canvas-0')
        //     this.canvas.layers.canvasList.push({
        //         name: 'product',
        //         html: htmlCanvas,
        //         ctx: htmlCanvas.getContext("2d"),
        //         width: htmlCanvas.offsetWidth,
        //         height: htmlCanvas.offsetHeight,
        //     })
        //     let item = this.canvas.layers.canvasList[0]
        //         item.html.width = item.width
        //         item.html.height = item.height
        //     this.canvas.layers.canvasActive = 0


        //     let img = new Image()
        //     img.onload = () => {
        //         let imgWidth = 200*img.width/img.height

        //         item.image = {
        //             canvasImage: img,
        //             size: {
        //                 width: imgWidth,
        //                 height: 200,
        //             },
        //             center: {
        //                 x: item.width/2,
        //                 y: item.height/2,
        //             },
        //             position: {
        //                 x: item.width/2 - imgWidth/2,
        //                 y: item.height/2 - 100,
        //             },
        //             rotate: 0,
        //             ratio: img.width/img.height
        //         }

        //         this.canvas.linkCanvasActive = this.canvas.layers.canvasList[this.canvas.layers.canvasActive]
        //         this.setItemPosition()
        //         this.updateCanvas()
        //     }
        //     img.src = this.catalogItems[this.activeCatalogItem].productImage

        // },

        // updateCanvas(canvas) {
        //     let canvasActive = canvas ? canvas : this.canvas.linkCanvasActive
        //     canvasActive.ctx.clearRect(0, 0, canvasActive.html.width, canvasActive.html.height)

        //     // Сохраняем текущее состояние контекста
        //     canvasActive.ctx.save();

        //     // Применяем трансформации
        //     canvasActive.ctx.translate(canvasActive.image.center.x, canvasActive.image.center.y)
        //     canvasActive.ctx.rotate(canvasActive.image.rotate)
            
        //     // Отрисовываем продукт
        //     canvasActive.ctx.drawImage(
        //         canvasActive.image.canvasImage, 
        //         -canvasActive.image.size.width / 2, 
        //         -canvasActive.image.size.height / 2, 
        //         canvasActive.image.size.width, 
        //         canvasActive.image.size.height
        //     )

        //     // Восстанавливаем состояние контекста
        //     canvasActive.ctx.restore();
            
        //     this.printBorderImage()
        // },

        // printBorderImage(){
        //     let canvasActive = this.canvas.layers.canvasList[this.canvas.layers.canvasActive]
        //     let canvasBorder = this.canvas.canvasBorder

        //     canvasBorder.ctx.clearRect(0, 0, canvasActive.width, canvasActive.height)

        //     canvasBorder.ctx.strokeStyle = "rgb(235, 235, 235)";
        //     canvasBorder.ctx.lineWidth = 1;

        //     let radiusArc = 6

        //     let item = canvasActive.image

        //     // Сохраняем текущее состояние контекста
        //     canvasBorder.ctx.save();

        //     // Применяем трансформации
        //     canvasBorder.ctx.translate(canvasActive.image.center.x, canvasActive.image.center.y)
        //     canvasBorder.ctx.rotate(canvasActive.image.rotate)

        //     let coordX = -item.size.width / 2
        //     let coordY = -item.size.height / 2

        //     canvasBorder.ctx.beginPath()
        //         // старт и круг
        //         canvasBorder.ctx.moveTo(
        //             coordX, coordY,
        //         );
        //         canvasBorder.ctx.lineTo(
        //             coordX+item.size.width-radiusArc, coordY,
        //         );
        //         canvasBorder.ctx.moveTo(
        //             coordX+item.size.width+radiusArc, coordY,
        //         );
        //         canvasBorder.ctx.arc(
        //             coordX+item.size.width, coordY,

        //             radiusArc, 0, Math.PI*2,

        //             true
        //         );
        //         canvasBorder.ctx.moveTo(
        //             coordX+item.size.width, coordY+radiusArc,
        //         );

        //         // право верх - право середина 
        //         if (this.canvas.layers.canvasActive != 0) {
        //             canvasBorder.ctx.lineTo(
        //                 coordX+item.size.width, coordY+item.size.height/2-5,
        //             );
        //             canvasBorder.ctx.lineTo(
        //                 coordX+item.size.width+5, coordY+item.size.height/2-5,
        //             );
        //             canvasBorder.ctx.lineTo(
        //                 coordX+item.size.width+5, coordY+item.size.height/2+5,
        //             );
        //             canvasBorder.ctx.lineTo(
        //                 coordX+item.size.width-5, coordY+item.size.height/2+5,
        //             );
        //             canvasBorder.ctx.lineTo(
        //                 coordX+item.size.width-5, coordY+item.size.height/2-5,
        //             );
        //             canvasBorder.ctx.lineTo(
        //                 coordX+item.size.width, coordY+item.size.height/2-5,
        //             );
        //             canvasBorder.ctx.moveTo(
        //                 coordX+item.size.width, coordY+item.size.height/2+5,
        //             );
        //         }

        //         // право середина - нижняя часть
        //         canvasBorder.ctx.lineTo(
        //             coordX+item.size.width, coordY+item.size.height-5,
        //         );
        //         canvasBorder.ctx.lineTo(
        //             coordX+item.size.width+5, coordY+item.size.height-5,
        //         );
        //         canvasBorder.ctx.lineTo(
        //             coordX+item.size.width+5, coordY+item.size.height+5,
        //         );
        //         canvasBorder.ctx.lineTo(
        //             coordX+item.size.width-5, coordY+item.size.height+5,
        //         );
        //         canvasBorder.ctx.lineTo(
        //             coordX+item.size.width-5, coordY+item.size.height-5,
        //         );
        //         canvasBorder.ctx.lineTo(
        //             coordX+item.size.width, coordY+item.size.height-5,
        //         );
        //         canvasBorder.ctx.moveTo(
        //             coordX+item.size.width-5, coordY+item.size.height,
        //         );

        //         // нижняя часть - лево
        //         if (this.canvas.layers.canvasActive != 0) {
        //             canvasBorder.ctx.lineTo(
        //                 coordX+item.size.width/2+5, coordY+item.size.height,
        //             );
        //             canvasBorder.ctx.lineTo(
        //                 coordX+item.size.width/2+5, coordY+item.size.height+5,
        //             );
        //             canvasBorder.ctx.lineTo(
        //                 coordX+item.size.width/2-5, coordY+item.size.height+5,
        //             );
        //             canvasBorder.ctx.lineTo(
        //                 coordX+item.size.width/2-5, coordY+item.size.height-5,
        //             );
        //             canvasBorder.ctx.lineTo(
        //                 coordX+item.size.width/2+5, coordY+item.size.height-5,
        //             );
        //             canvasBorder.ctx.lineTo(
        //                 coordX+item.size.width/2+5, coordY+item.size.height,
        //             );
        //             canvasBorder.ctx.moveTo(
        //                 coordX+item.size.width/2-5, coordY+item.size.height,
        //             );
        //         }

        //         // замыкание
        //         canvasBorder.ctx.lineTo(
        //             coordX, coordY+item.size.height,
        //         );
        //         canvasBorder.ctx.lineTo(
        //             coordX, coordY,
        //         );

        //     // Восстанавливаем состояние контекста
        //     canvasBorder.ctx.stroke()
        //     canvasBorder.ctx.restore();

        // },

        // moveLayers(what, where) {
        //     let arr = this.canvas.layers.canvasList
        //     let item = arr[where]
        //     arr[where] = arr[what]
        //     arr[what] = item

        //     if(this.canvas.layers.canvasActive == what) {
        //         this.canvas.layers.canvasActive = where
        //     } else if(this.canvas.layers.canvasActive == where) {
        //         this.canvas.layers.canvasActive = what
        //     }

        //     arr.forEach((item, index) => {
        //         item.html.style.zIndex = index+1
        //     });

        //     this.updateCanvas()
        // },

        // setItemPosition(canvas) {
        //     console.log('setItemPosition');
        //     let item = canvas ? canvas.image : this.canvas.linkCanvasActive.image

        //     item.points = {
        //         'left-top': {
        //             x: item.position.x,
        //             y: item.position.y
        //         },
        //         'right-top': {
        //             x: item.position.x + item.size.width,
        //             y: item.position.y
        //         },
        //         'scale-width': {
        //             x: item.position.x + item.size.width,
        //             y: item.position.y + item.size.height/2
        //         },
        //         'right-bottom': {
        //             x: item.position.x + item.size.width,
        //             y: item.position.y + item.size.height
        //         },
        //         'scale-height': {
        //             x: item.position.x + item.size.width/2,
        //             y: item.position.y + item.size.height
        //         },
        //         'left-bottom': {
        //             x: item.position.x,
        //             y: item.position.y + item.size.height
        //         },
        //         'min-max': {
        //             max: {
        //                 x:0,
        //                 y:0
        //             },
        //             min: {
        //                 x: item.position.x,
        //                 y: item.position.y
        //             }
        //         }
        //     }
        //     item.center = {
        //         x: item.position.x + item.size.width/2,
        //         y: item.position.y + item.size.height/2,
        //     }
        
        //     let ssin = Math.sin(item.rotate);
        //     let scos = Math.cos(item.rotate);

        //     for (const key in item.points) {
        //         if (key == 'min-max') break

        //         item.points[key].x = item.center.x + (item.points[key].x - item.center.x) * scos - (item.points[key].y - item.center.y) * ssin;
        //         if(item.points[key].x > item.points['min-max'].max.x) item.points['min-max'].max.x = item.points[key].x
        //         if(item.points[key].x < item.points['min-max'].min.x) item.points['min-max'].min.x = item.points[key].x

        //         item.points[key].y = item.center.y + (item.points[key].x - item.center.x) * ssin + (item.points[key].y - item.center.y) * scos;
        //         if(item.points[key].y > item.points['min-max'].max.y) item.points['min-max'].max.y = item.points[key].y
        //         if(item.points[key].y < item.points['min-max'].min.y) item.points['min-max'].min.y = item.points[key].y
        //     }
        // },

        // startDragging() {
        //     this.canvas.drag = true

        //     this.canvas.linkCanvasActive = this.canvas.layers.canvasList[this.canvas.layers.canvasActive]
        // },

        // drag(e) {
        //     if (!this.canvas.drag ) return
        //     console.log('drag');
            
        //     let item = this.canvas.linkCanvasActive.image

        //     switch (this.canvas.action) {
        //         case 'rotate':
        //             this.canvas.methods.rotate(e)
        //             break;

        //         case 'scale':
        //             this.canvas.methods.scale(e)
        //             break;

        //         case 'scaleWidth':
        //             if (this.canvas.layers.canvasActive != 0) this.canvas.methods.scaleWidth(e)
        //             break;

        //         case 'scaleHeight':
        //             if (this.canvas.layers.canvasActive != 0) this.canvas.methods.scaleHeight(e)
        //             break;

        //         case 'move':
        //             this.canvas.methods.move(e)
        //             break;
        //     }


        //     if (!this.canvas.action) {
        //         if (
        //             item.points['right-top'].x-6 <= e.offsetX && item.points['right-top'].x+6 >= e.offsetX &&
        //             item.points['right-top'].y-6 <= e.offsetY && item.points['right-top'].y+6 >= e.offsetY 
        //         ){ this.canvas.action = 'rotate' } 

        //         if (
        //             item.points['right-bottom'].x-6 <= e.offsetX && item.points['right-bottom'].x+6 >= e.offsetX &&
        //             item.points['right-bottom'].y-6 <= e.offsetY && item.points['right-bottom'].y+6 >= e.offsetY 
        //         ){ this.canvas.action = 'scale' }

        //         if (
        //             item.points['scale-width'].x-6 <= e.offsetX && item.points['scale-width'].x+6 >= e.offsetX &&
        //             item.points['scale-width'].y-6 <= e.offsetY && item.points['scale-width'].y+6 >= e.offsetY 
        //         ){ this.canvas.action = 'scaleWidth' }

        //         if (
        //             item.points['scale-height'].x-6 <= e.offsetX && item.points['scale-height'].x+6 >= e.offsetX &&
        //             item.points['scale-height'].y-6 <= e.offsetY && item.points['scale-height'].y+6 >= e.offsetY 
        //         ){ this.canvas.action = 'scaleHeight' }

        //         if (
        //             item.points['min-max'].min.x <= e.offsetX && item.points['min-max'].max.x >= e.offsetX &&
        //             item.points['min-max'].min.y <= e.offsetY && item.points['min-max'].max.y >= e.offsetY
        //         ){ this.canvas.action = 'move' } 
        //     }

        //     item.center = { // ERROR что то не так с rotate или center
        //         x: item.position.x + item.size.width/2,
        //         y: item.position.y + item.size.height/2,
        //     }

        //     this.updateCanvas()
        // },

        // stopDragging() {
        //     this.setItemPosition()

        //     this.canvas.drag = false
        //     this.canvas.action = ''
        //     this.canvas.offsetX = 0
        //     this.canvas.offsetY = 0

        //     let image = this.canvas.linkCanvasActive.image
        //     image.ratio = image.size.width/image.size.height
        // },

        // changeFullscreen() {
        //     let customRedactor = document.querySelector('.redactor')
        //     let customMenu = document.querySelector('.custom__menu')
        //         let customMenuX = customMenu.getBoundingClientRect().left
        //         let customMenuY = customMenu.getBoundingClientRect().top

        //     this.canvas.fullscreen = !this.canvas.fullscreen

        //     if (this.canvas.fullscreen) {
        //         customRedactor.classList.add('redactor--fullscreen')
        //         customRedactor.style.cssText = `
        //             top: -${customMenuY}px;
        //             left: -${customMenuX}px;
        //         `
        //     } else {
        //         customRedactor.classList.remove('redactor--fullscreen')
        //         customRedactor.style.cssText = `
        //             top: auto;
        //             left: auto;
        //         `
        //     }

        //     let customRedactorWidth = customRedactor.offsetWidth
        //     let customRedactorHeight = customRedactor.offsetHeight

        //     this.canvas.canvasBorder.height = customRedactorHeight
        //     this.canvas.canvasBorder.html.height = customRedactorHeight
        //     this.canvas.canvasBorder.width = customRedactorWidth
        //     this.canvas.canvasBorder.html.width = this.canvas.canvasBorder.width       

        //     this.canvas.layers.canvasList.forEach(canvas => {
        //         canvas.height = customRedactorHeight
        //         canvas.html.height = customRedactorHeight
        //         canvas.width = customRedactorWidth
        //         canvas.html.width = canvas.width
        //     })

        //     this.canvas.methods.globalItemsPosition()
        //     this.canvas.layers.canvasList.forEach(canvas => {
        //         canvas.image.position.x = (canvas.width/2) - (this.canvas.globalItemsPositions.max.x - this.canvas.globalItemsPositions.min.x)/2 + (canvas.image.position.x - this.canvas.globalItemsPositions.min.x)
        //         canvas.image.position.y = (canvas.height/2) - (this.canvas.globalItemsPositions.max.y - this.canvas.globalItemsPositions.min.y)/2 + (canvas.image.position.y - this.canvas.globalItemsPositions.min.y)

        //         this.setItemPosition(canvas)
        //         this.updateCanvas(canvas)
        //     });
        // },

        // updateSize(direction) {
        //     let item = this.canvas.linkCanvasActive.image

        //     if (this.canvas.toolsChain) {
        //         direction == 'width' ?
        //             item.size.height = item.size.width/item.ratio : 
        //             item.size.width = item.size.height*item.ratio
        //     }

        //     this.setItemPosition()
        //     this.updateCanvas()
        // },

        // convertToBlackAndWhite(imageData, colorCount){
        //     const colorStep = (255*3)/colorCount
        //     const data = imageData.data

        //     console.log(imageData);
            
        //     console.log(data);
            

        //     for (let i = 0; i < data.length; i += 4) {
        //         const brightness = data[i] + data[i + 1] + data[i + 2]

        //         const color = (Math.round(brightness/colorStep) * colorStep)/3

        //         data[i] = data[i + 1] = data[i + 2] = color
        //     }

        //     return imageData
        // },

        // // convertToBlackAndWhite(dataImage, colorCount){
        // //     // let canvasList = this.canvas.layers.canvasList;  // Получаем список слоёв canvas

        // //     // if (canvasList.length < 2) return; // Проверка на наличие слоев

        // //     // // Создаем временный canvas, на который будем объединять все изображения
        // //     // let tempCanvas = document.createElement('canvas');
        // //     // let tempCtx = tempCanvas.getContext('2d');

        // //     // // Размер временного canvas устанавливаем по размеру основного canvas
        // //     // let canvasSize = this.canvas.canvasBorder.html;
        // //     // tempCanvas.width = canvasSize.offsetWidth;
        // //     // tempCanvas.height = canvasSize.offsetHeight;

        // //     // // Перебираем все слои canvas, начиная с 1 (пропуская фоновый или пустой слой 0)
        // //     // for (let index = 1; index < canvasList.length; index++) {
            
        // //     //     let layer = canvasList[index];
        // //     //     let ctx = layer.ctx; // Контекст текущего canvas
                
        // //     //     console.log(layer.image);

        // //     //     // Извлекаем параметры позиции и размера изображения
        // //     //     let position = layer.image.position  // Позиция изображения (x, y)
        // //     //     let size = layer.image.size // Размеры изображения (width, height)

        // //     //     // Сохраняем состояние и устанавливаем параметры для рисунка
        // //     //     tempCtx.save(); // Сохраняем текущее состояние контекста

        // //     //     // Устанавливаем позицию и угол поворота
        // //     //     tempCtx.translate(position.x + size.width / 2, position.y + size.height / 2)
        // //     //     tempCtx.rotate(layer.image.rotate)
        // //     //     tempCtx.translate(-(position.x + size.width / 2), -(position.y + size.height / 2))

        // //     //     // Рисуем текущее изображение на временный canvas с учетом размеров и позиции
        // //     //     tempCtx.drawImage(
        // //     //         layer.image.canvasImage, 
        // //     //         position.x, 
        // //     //         position.y, 
        // //     //         size.width, 
        // //     //         size.height
        // //     //     );

        // //     //     // Восстанавливаем контекст
        // //     //     tempCtx.restore();
        // //     // }


        // //     // Получаем изображение с canvas
        // //     const imageData = tempCtx.getImageData(0, 0, canvasSize.offsetWidth, canvasSize.offsetHeight)
        // //     const data = imageData.data

        // //     const colorStep = (255*3)/colorCount

        // //     // Перебираем все пиксели
        // //     for (let i = 0; i < data.length; i += 4) {
        // //         const brightness = data[i] + data[i + 1] + data[i + 2]

        // //         const color = (Math.round(brightness/colorStep) * colorStep)/3

        // //         data[i] = color      // R канал
        // //         data[i + 1] = color  // G канал
        // //         data[i + 2] = color  // B канал
        // //     }

        // //     // Применяем изменённые данные обратно на canvas
        // //     tempCtx.putImageData(imageData, 0, 0)


        // //     // Генерация ссылки на изображение в формате PNG
        // //     let imageURL = tempCanvas.toDataURL('image/png');

        // //     // // Создаем ссылку для скачивания
        // //     // let downloadLink = document.createElement('a');
        // //     // downloadLink.href = imageURL;
        // //     // downloadLink.download = 'merged_canvas_image.png'; // Имя сохраняемого файла
        // //     // downloadLink.click(); // Автоматический клик для начала загрузки

            

        // //     // Удаляем временный canvas, так как он больше не нужен
        // //     tempCanvas.remove();
        // // },

        // renderResult(){
        //     // this.canvas.canvasBorder.html.toDataURL('image/png')
        //     // console.log(this.canvas.canvasBorder.html);

        //     let canvasCtx = this.canvas.layers.canvasList[0].ctx
        //     let canvasSize = this.canvas.canvasBorder.html

        //     const imageData = canvasCtx.getImageData(0, 0, canvasSize.offsetWidth, canvasSize.offsetHeight)
        //     const data = imageData.data

        //     for (let i = 0; i < data.length; i += 4) {
        //         const r = data[i]
        //         const g = data[i + 1]
        //         const b = data[i + 2]
        //         const gray = (r + g + b) / 3

        //         data[i] = gray
        //         data[i + 1] = gray
        //         data[i + 2] = gray
        //     }

        //     canvasCtx.putImageData(imageData, 0, 0);

        //     const link = document.createElement('a');
        //     link.download = 'black-and-white-image.png';
        //     link.href = this.canvas.layers.canvasList[0].html.toDataURL();
        //     link.click();
        // }
    }
}
</script>

<style lang="scss">
    @use "@/assets/style/pages/pages.scss";
    @use "@/assets/style/pages/page-market.scss";
</style>