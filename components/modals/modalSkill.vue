<template>
    <modals-modalBase
        class="modal-skill"
        :open="Boolean(skill)"
        :label="skill ? `Навык: ${skill.name}` : ''"
        @close="emit('close')"
    >
        <h2 class="modal-skill__title">Язык: {{ skill?.name }}</h2>

        <div class="modal-skill__content">
            <div class="modal-skill__lists">
                <div
                    v-for="group in linkGroups"
                    :key="group.field"
                    class="modal-skill__lists-item"
                >
                    <h3 class="modal-skill__lists-title">{{ group.title }}</h3>

                    <ul class="modal-skill__lists-list">
                        <li
                            v-for="item in group.items"
                            :key="item.url"
                            class="modal-skill__lists-list-item"
                        >
                            <a :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.title }}</a>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="modal-skill__info">
                <img
                    class="modal-skill__info-img"
                    :src="skill?.icon"
                    :alt="`Логотип ${skill?.name}`"
                    width="121"
                    height="121"
                    loading="lazy"
                    decoding="async"
                >
                <p class="modal-skill__info-text">Опыт <br> {{ skill?.experience }}</p>
            </div>
        </div>

        <!-- Живой пример есть не у каждого навыка -->
        <a
            v-if="skill?.example"
            class="modal-skill__example"
            :href="skill.example"
            target="_blank"
            rel="noopener noreferrer"
        >Пример</a>
    </modals-modalBase>
</template>

<script setup>
const props = defineProps({
    skill: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const LINK_GROUPS = [
    { field: 'courses', title: 'Курсы:' },
    { field: 'tests', title: 'Пройденные тесты:' },
    { field: 'recommendations', title: 'Рекомендации:' },
]

/** Непустые списки вида { field, title, items }: пустые обёртки в разметку не попадают */
const linkGroups = computed(() => {
    const skill = props.skill
    if (!skill) return []

    return LINK_GROUPS
        .map(group => ({ ...group, items: skill[group.field] ?? [] }))
        .filter(group => group.items.length > 0)
})
</script>
