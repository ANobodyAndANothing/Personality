<template>
    <div id="app" class="error-page">
        <div class="card card-shadow error-page__card">
            <h1 class="error-page__code text-shadow">{{ error?.statusCode ?? 500 }}</h1>
            <p class="error-page__text text-shadow">{{ message }}</p>

            <button type="button" class="error-page__btn" @click="clearError({ redirect: '/' })">
                На главную
            </button>
        </div>
    </div>
</template>

<script setup>
/** Своя страница ошибки вместо стандартной страницы фреймворка. */
const props = defineProps({
    error: { type: Object, default: null },
})

const message = computed(() =>
    props.error?.statusCode === 404
        ? 'Такой страницы здесь нет'
        : 'Что-то пошло не так',
)

useHead({ title: `${props.error?.statusCode ?? 500} — ANobodyAndANothing` })
</script>

<style lang="scss">
@use "@/assets/style/core" as *;
@use "@/assets/style/cards/card.scss";

.error-page {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100dvh;

    &__card {
        position: relative;
        flex-direction: column;
        gap: 16px;
        text-align: center;
        padding: 24px;
    }

    &__code {
        font-family: 'Open Sans', system-ui, sans-serif;
        font-size: $font-size-hero;
        line-height: 1;
    }

    &__text {
        font-size: $font-size-lead;
    }

    &__btn {
        padding: 8px 24px;
        border: 1px solid color-white();
        border-radius: $radius;
        font-size: $font-size-base;
        transition: background-color $transition, color $transition;

        @include hover {
            background-color: color-white();
            color: color-black();
        }
    }
}
</style>
