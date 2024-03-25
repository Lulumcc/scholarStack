// const articleData = require("../data/articles.json")
// const journalData = require("../data/journals.json")
let articles = []

const env = require("dotenv")
env.config()

const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
    host: process.env.PGHOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false },
    },
});

const Article = sequelize.define('Article', {
    articleID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: Sequelize.STRING,
    description: Sequelize.TEXT,
    authors: Sequelize.ARRAY(Sequelize.STRING),
    date: Sequelize.DATE,
    openAccess: Sequelize.BOOLEAN,
    doi: Sequelize.STRING,
    coverImage: Sequelize.TEXT
})

const Journal = sequelize.define('Journal', {
    journalID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: Sequelize.STRING,
    url: Sequelize.TEXT
})

Article.belongsTo(Journal, { foreignKey: 'journalID' })

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
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            console.log("done")
            resolve("done")
        }).catch((err) => {
            console.log(err)
            reject("error")
        })
    })
}

function getArticles() {
    return new Promise((resolve, reject) => {
        // if (articles) {
        //     resolve(articles)
        // } else {
        //     reject("no article data")
        // }
        Article.findAll().then((articles) => {
            if (articles) {
                resolve(articles)
            } else {
                reject("no articles found")
            }
        }).catch((err) => {
            reject(err)
        })
    })
}

function getArticleByID(paramsID) {
    return new Promise((resolve, reject) => {
        // let foundArticle = articles.find(((article) => article.id == id))
        // if (foundArticle) {
        //     resolve(foundArticle)

        // } else {
        //     reject("article not found by " + id)
        // }

        Article.findOne({
            where: {
                articleID: paramsID
            }
        }).then((article) => {
            if (article) {
                resolve(article)
            } else {
                reject("article not found by " + paramsID)
            }
        }).catch((err) => {
            reject(err)
        })
    })
}

function getArticlesByJournal(journalID) {
    return new Promise((resolve, reject) => {
        // let foundArticles = articles.filter(((article) => article.journal == journalID))
        // if (foundArticles.length > 0) {
        //     resolve(foundArticles)
        // } else {
        //     reject("no articles found with that journal id")
        // }


        Article.findAll({
            where: {
                journalID: journalID
            }
        }).then((articles) => {
            if (articles) {
                resolve(articles)
            } else {
                reject("article not found by journal " + journalID)
            }
        }).catch((err) => {
            reject(err)
        })
    })
}

function getArticleByOpenAccess() {
    return new Promise((resolve, reject) => {
        // let foundArticle = articles.filter(((article) => article.openAccess == true))
        // if (foundArticle) {
        //     resolve(foundArticle)

        // } else {
        //     reject("article not found by open-access")
        // }
        Article.findAll({
            where: {
                openAccess: true
            }
        }).then((articles) => {
            if (articles) {
                resolve(articles)
            } else {
                reject("article not found by journal " + journalID)
            }
        }).catch((err) => {
            reject(err)
        })

    })
}

function addJournal(newJournal) {
    return new Promise((resolve, reject) => {
        // if (newJournal) {
        //     newJournal.id = journalData.length + 1
        //     journalData.push(newJournal)
        //     resolve(journalData)
        // } else {
        //     reject("no journal data found")
        // }

        Journal.create(newJournal).then((confirmation) => {
            // if (confirmation) 
            resolve("done")
        }).catch((err) => {
            reject(err)
        })
    })
}
function getJournals() {
    return new Promise((resolve, reject) => {
        // if (journalData) {
        //     resolve(journalData)
        // } else {
        //     reject("no journal data found")
        // }
        Journal.findAll().then((journals) => { resolve(journals) })
            .catch((err) => { reject(err) })

    })
}

function deleteJournal(journalID) {
    return new Promise((resolve, reject) => {
        Journal.destroy({
            where: {
                journalID: journalID
            }
        }).then(() => {
            resolve("Journal deleted!")
        }).catch((err) => {
            reject(err)
        })
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
    chat,
    deleteJournal
}


// sequelize
// .sync()
// .then(async () => {
//     try {
//         await Journal.bulkCreate(journalData);
//         await Article.bulkCreate(articleData);
//         console.log("-----");
//         console.log("data inserted successfully");
//     } catch (err) {
//         console.log("-----");
//         console.log(err.message);

//         // NOTE: If you receive the error:

//         // insert or update on table "Sets" violates foreign key constraint "Sets_theme_id_fkey"

//         // it is because you have a "set" in your collection that has a "theme_id" that does not exist in the "themeData".   

//         // To fix this, use PgAdmin to delete the newly created "Themes" and "Sets" tables, fix the error in your .json files and re-run this code
//     }

//     process.exit();
// })
// .catch((err) => {
//     console.log('Unable to connect to the database:', err);
// });