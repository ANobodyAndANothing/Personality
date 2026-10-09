<template>
    <div v-if="meta" class="wrapper">
        <header class="header">
            <h1 class="header__title">{{ meta.title }}</h1>
            <p class="header__desc">{{ meta.description }}</p>
        </header>
    </div>
</template>

<script setup>
const meta = useCurrentPageMeta()
</script>
