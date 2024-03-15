const articleData = require("../data/articles.json")
const journalData = require("../data/journals.json")
let articles = []

const env = require("dotenv")
env.config()

const OpenAI = require("openai")
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function summarizeAbstract(abstract) {
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: `summarize this scientific abstract: ${abstract}` }],
        model: "gpt-4",
    });

    console.log(completion.choices[0]);
    return completion.choices[0]
}

async function chat(prompt) {

    const completion = await openai.chat.completions.create({
        messages: [{ role: "assistant", content: prompt }],
        model: "gpt-4",
    });

    console.log(completion.choices[0]);
    return completion.choices[0]
}

function initialize() {
    // do something here to combine the themeID to the lego sets array data 

    return new Promise((resolve, reject) => {
        articles = articleData
        if (articles) {
            resolve("done")
        } else {
            reject("bad")
        }
    })
}

function getArticles() {
    return new Promise((resolve, reject) => {
        if (articles) {
            resolve(articles)
        } else {
            reject("no article data")
        }
    })
}

function getArticleByID(id) {
    return new Promise((resolve, reject) => {
        let foundArticle = articles.find(((article) => article.id == id))
        if (foundArticle) {
            resolve(foundArticle)

        } else {
            reject("article not found by " + id)
        }
    })
}

function getArticlesByJournal(journalID) {
    return new Promise((resolve, reject) => {
        let foundArticles = articles.filter(((article) => article.journal == journalID))
        if (foundArticles.length > 0) {
            resolve(foundArticles)
        } else {
            reject("no articles found with that journal id")
        }
    })
}

function getArticleByOpenAccess() {
    return new Promise((resolve, reject) => {
        let foundArticle = articles.filter(((article) => article.openAccess == true))
        if (foundArticle) {
            resolve(foundArticle)

        } else {
            reject("article not found by open-access")
        }
    })
}

function addJournal(newJournal) {
    return new Promise((resolve, reject) => {
        if (newJournal) {
            newJournal.id = journalData.length + 1
            journalData.push(newJournal)
            resolve(journalData)
        } else {
            reject("no journal data found")
        }
    })
}
function getJournals() {
    return new Promise((resolve, reject) => {
        if (journalData) {
            resolve(journalData)
        } else {
            reject("no journal data found")
        }
    })
}

module.exports = {
    initialize,
    getArticles,
    getArticleByID,
    getArticlesByJournal,
    getArticleByOpenAccess,
    addJournal,
    getJournals,
    summarizeAbstract,
    chat
}