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

function findByTag(tasks, tag) { return tasks.filter(n => n.tags.some(x => x === tag)); }
console.log(findByTag(tasksList, "personal"));

function findByTags(tasks, tags) { return tasks.filter(n => tags.some(x => n.tags.includes(x))); }
console.log(findByTags(tasksList, [ "personal", "practica"]));

function countDone(tasks) {
    return tasks.reduce((count, n) => {
        if (n.done) count++;
        return count;
    }, 0);
}
console.log(countDone(tasksList));

function createTask(input) {
    let array = input.split(' ');

    // Text
    let text = array.filter(n => n.charAt(0) !== '@');
    text = text.join(" ");

    // Tags
    let tags = array.filter(n => n.charAt(0) === '@');
    tags = tags.map(n => n.slice(1, n.length));

    return {
        text: text,
        tags: tags,
    };
}

console.log(createTask("Ir al medico @personal @salud"));
console.log(createTask("@universidad @practica Preparar practicas TP"));
console.log(createTask("Ir a @deporte entrenar"));