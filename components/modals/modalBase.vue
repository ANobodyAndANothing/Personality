<template>
    <div
        ref="root"
        class="modal"
        :class="{ 'modal--show': open }"
        role="dialog"
        aria-modal="true"
        :aria-label="label"
        @keydown.esc="emit('close')"
    >
        <button
            type="button"
            class="modal__close"
            aria-label="Закрыть окно"
            @click="emit('close')"
        >
            <svg class="modal__close-icon" aria-hidden="true" focusable="false">
                <use href="@/assets/svg/sprite.svg#close"></use>
            </svg>
        </button>

        <!-- Содержимое живёт, только пока окно открыто: закрытое не должно
             ни занимать память, ни попадать в дерево доступности -->
        <slot v-if="open" />
    </div>
</template>

<script setup>
/**
 * Общая оболочка модальных окон: семантика диалога, кнопка закрытия,
 * Escape, удержание и возврат фокуса.
 */

const props = defineProps({
    open: { type: Boolean, default: false },
    /** Подпись окна для скринридеров */
    label: { type: String, default: '' },
})

const emit = defineEmits(['close'])

const root = useTemplateRef('root')

useFocusTrap(root, toRef(props, 'open'))
</script>
