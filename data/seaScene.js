/**
 * Геометрия подводной сцены: скала и растущие на ней водоросли.
 * Значения подобраны вручную под рисунок, менять их можно только вместе
 * с контуром скалы в utils/seaScene.js.
 */

// Стебель: { height, deviation, deviationMax, deviationDirection,
//            rotate, rotateMax, rotateDirection }.
// deviation — изгиб, rotate — наклон; каждое меняет направление,
// упёршись в свой предел.
//
// Группа: { slide, position: { x, y }, seaweeds } — slide задаёт,
// на каком слайде группа видна.

/** Водоросли на внешней стороне скалы */
export const ROCK_SEAWEEDS = [
    {
        slide: 1,
        position: {
            x: 60,
            y: 65
        },
        seaweeds: [
            {
                height: 43,
                deviation: 1,
                deviationMax: 4,
                deviationDirection: false,
                rotate: 7,
                rotateMax: 10,
                rotateDirection: true
            },
            {
                height: 48,
                deviation: 3,
                deviationMax: 4,
                deviationDirection: true,
                rotate: 0,
                rotateMax: 10,
                rotateDirection: false
            },
            {
                height: 53,
                deviation: 0,
                deviationMax: 4,
                deviationDirection: true,
                rotate: 0,
                rotateMax: 10,
                rotateDirection: false
            },
            {
                height: 55,
                deviation: 3,
                deviationMax: 4,
                deviationDirection: false,
                rotate: 2,
                rotateMax: 10,
                rotateDirection: true
            },
            {
                height: 64,
                deviation: 1,
                deviationMax: 4,
                deviationDirection: false,
                rotate: 2,
                rotateMax: 10,
                rotateDirection: false
            },
            {
                height: 58,
                deviation: 2,
                deviationMax: 4,
                deviationDirection: false,
                rotate: 7,
                rotateMax: 10,
                rotateDirection: false
            },
            {
                height: 48,
                deviation: 1,
                deviationMax: 4,
                deviationDirection: false,
                rotate: 9,
                rotateMax: 10,
                rotateDirection: false
            }
        ]
    },
    {
        slide: 2,
        position: {
            x: 103,
            y: 235
        },
        seaweeds: [
            {
                height: 43,
                deviation: 1,
                deviationMax: 4,
                deviationDirection: false,
                rotate: 4,
                rotateMax: 10,
                rotateDirection: true
            },
            {
                height: 48,
                deviation: 0,
                deviationMax: 4,
                deviationDirection: true,
                rotate: 3,
                rotateMax: 10,
                rotateDirection: false
            },
            {
                height: 53,
                deviation: 1,
                deviationMax: 4,
                deviationDirection: true,
                rotate: 1,
                rotateMax: 10,
                rotateDirection: false
            },
            {
                height: 55,
                deviation: 3,
                deviationMax: 4,
                deviationDirection: false,
                rotate: 2,
                rotateMax: 10,
                rotateDirection: true
            },
            {
                height: 64,
                deviation: 1,
                deviationMax: 4,
                deviationDirection: false,
                rotate: 5,
                rotateMax: 10,
                rotateDirection: false
            },
            {
                height: 58,
                deviation: 3,
                deviationMax: 4,
                deviationDirection: false,
                rotate: 7,
                rotateMax: 10,
                rotateDirection: false
            },
            {
                height: 48,
                deviation: 2,
                deviationMax: 4,
                deviationDirection: false,
                rotate: 1,
                rotateMax: 10,
                rotateDirection: false
            }
        ]
    }
]

/** Водоросли в глубине, видны только на нижнем слайде */
export const ROCK_SEAWEEDS_INSIDE = [
    {
        slide: 2,
        position: {
            x: 30,
            y: 500
        },
        seaweeds: [
            {
                height: 43,
                deviation: 1,
                deviationMax: 4,
                deviationDirection: false,
                rotate: 7,
                rotateMax: 10,
                rotateDirection: true
            },
            {
                height: 48,
                deviation: 3,
                deviationMax: 4,
                deviationDirection: true,
                rotate: 0,
                rotateMax: 10,
                rotateDirection: false
            },
            {
                height: 53,
                deviation: 0,
                deviationMax: 4,
                deviationDirection: true,
                rotate: 0,
                rotateMax: 10,
                rotateDirection: false
            },
            {
                height: 55,
                deviation: 3,
                deviationMax: 4,
                deviationDirection: false,
                rotate: 2,
                rotateMax: 10,
                rotateDirection: true
            },
            {
                height: 64,
                deviation: 1,
                deviationMax: 4,
                deviationDirection: false,
                rotate: 2,
                rotateMax: 10,
                rotateDirection: false
            },
            {
                height: 58,
                deviation: 2,
                deviationMax: 4,
                deviationDirection: false,
                rotate: 7,
                rotateMax: 10,
                rotateDirection: false
            },
            {
                height: 48,
                deviation: 1,
                deviationMax: 4,
                deviationDirection: false,
                rotate: 9,
                rotateMax: 10,
                rotateDirection: false
            }
        ]
    }
]
