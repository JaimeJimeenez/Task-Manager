"use strict"

let tasksList = [
    { text: "Preparar prácticas AW", tags: [ "universidad", "aw" ] },
    { text: "Mirar fechas congreso", done: true, tags: [] },
    { text: "Ir al supermercado", tags: [ "personal", "básico" ] },
    { text: "Jugar al fútbol", done: false, tags: [ "personal", "deportes" ] },
    { text: "Hablar con el profesor", done: false, tags: [ "universidad", "tp2" ] }
];

function getToDoTasks(tasks) {
    let unfinalished = tasks.filter(n => !n.done);
    return unfinalished.map(n => n.text);
}

console.log(getToDoTasks(tasksList));

function findByTag(tasks, tag) {
    let tagTasks = tasks.filter(n => n.tags.some(x => x === tag));
    return tagTasks;
}

console.log(findByTag(tasksList, "personal"));

function findByTags(tasks, tag) {
    let tagTasks = tasks.filter()
}

//findByTags(tasksList, [ "personal", "practica"]);