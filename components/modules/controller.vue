<template>
    <!-- inert убирает стрелки из таб-порядка, пока карточка не активна
         или поверх неё открыто окно -->
    <div class="controller" :class="{ 'controller--hide': isHidden }" :inert="isHidden">
        <div
            v-for="item in items"
            :key="item.direction"
            :class="['controller__btn-container', `controller__btn-container--${item.direction}`]"
        >
            <!-- Клик и подпись живут на самой кнопке, а не на обёртке,
                 иначе стрелка недоступна с клавиатуры -->
            <button
                type="button"
                class="controller__btn"
                :aria-label="`Перейти к разделу «${CARD_LABELS[item.target]}»`"
                @click="goTo(item.target)"
            >
                <svg class="controller__btn-icon" aria-hidden="true" focusable="false">
                    <use href="@/assets/svg/sprite.svg#arrow"></use>
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup>
import { CARD_LABELS } from '~/composables/useCards'

const props = defineProps({
    /** Карточка, которой принадлежат стрелки */
    card: { type: String, required: true },
    /** Направление стрелки ('left' | 'right' | 'top' | 'bottom') → карточка, к которой она ведёт */
    controllers: { type: Object, required: true },
    /** Спрятать стрелки, пока открыто модальное окно */
    hide: { type: Boolean, default: false },
})

const { activeCard, goTo } = useCards()

/**
 * Стрелки чужой карточки не должны ни ловить клики, ни попадать в таб-порядок:
 * соседние карточки остаются в DOM за краем экрана.
 */
const isHidden = computed(() => props.hide || activeCard.value !== props.card)

const items = computed(() =>
    Object.entries(props.controllers)
        .filter(([, target]) => Boolean(target))
        .map(([direction, target]) => ({ direction, target })),
)
</script>
