"use strict"

let tasksList = [
    { text: "Preparar prácticas AW", tags: [ "universidad", "aw" ] },
    { text: "Mirar fechas congreso", done: true, tags: [] },
    { text: "Ir al supermercado", tags: [ "personal", "básico" ] },
    { text: "Jugar al fútbol", done: false, tags: [ "personal", "deportes" ] },
    { text: "Hablar con el profesor", done: false, tags: [ "universidad", "tp2" ] }
];

function getToDoTasks(tasksList) {
    let unfinalished = tasksList.filter(n => !n.done);
    console.log(unfinalished.map(n => n.text));
}

getToDoTasks(tasksList);

function findByTag(tasksList, tag) {
    let tagTasks = tasksList.filter(n => n.tags.some(x => x === tag));
    console.log(tagTasks);
}

findByTag(tasksList, "personal");