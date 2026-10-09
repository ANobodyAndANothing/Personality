<template>
    <div class="card card-menu" :data-position="positionOf('cardMenu')">
        <div class="card__content card-menu__content">
            <p class="text-shadow">я {{ CONTACTS.role }}</p>

            <address class="card-menu__content-btns">
                <a
                    class="card-menu__content-btns-telegram"
                    :href="CONTACTS.telegram"
                    target="_blank"
                    rel="noopener noreferrer"
                    :aria-label="'Telegram:' + CONTACTS.telegram"
                >
                    <svg aria-hidden="true" focusable="false">
                        <use href="@/assets/svg/sprite.svg#telegram"></use>
                    </svg>
                </a>

                <a :href="CONTACTS.resume" target="_blank" rel="noopener noreferrer">hh.ru</a>

                <a :href="`tel:${CONTACTS.phone}`" :aria-label="`Телефон: ${CONTACTS.phoneLabel}`">
                    <svg aria-hidden="true" focusable="false">
                        <use href="@/assets/svg/sprite.svg#phone"></use>
                    </svg>
                </a>
            </address>

            <p class="text-shadow text-shadow-reverse">меня зовут <br> {{ CONTACTS.name }}</p>
        </div>

        <div class="card__background card-menu__background" aria-hidden="true">
            <img class="card-menu__background-img" src="@/assets/img/cardMenuBG.svg" alt="cardMenuBG" />
        </div>

        <modules-controller
            card="cardMenu"
            :controllers="{ left: 'cardSkills', right: 'cardProjects' }"
        />
    </div>
</template>

<script setup>
import { CONTACTS } from '~/data/projects'

const { positionOf } = useCards()
</script>
