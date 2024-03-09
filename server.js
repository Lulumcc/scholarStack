const express = require("express")
const app = express()

const HTTP_PORT = 8080
const scholarService = require("./modules/scholarService")
const path = require("path")

app.use(express.static("public"))
app.set("view engine", "ejs")


app.get("/", (req, res) => {
    res.redirect("/articles")
})

app.get("/articles", (req, res) => {

    if (req.query.journal) {
        scholarService.getArticlesByJournal(req.query.journal).then((articles) => {
            res.send(articles)
        }).catch((err) => {
            console.log(err)
            res.send(err)
        })
    } else {
        scholarService.getArticles().then((articles) => {
            // res.json(articles)
            // res.sendFile(path.join(__dirname, "/views/index.html"))
            res.render('index', {
                articles: articles
            })
            console.log(articles)
        }).catch((err) => {
            console.log(err)
        })
    }


})

app.get('/articles/openAccess', (req, res) => {
    scholarService.getArticleByOpenAccess().then((openArticles) => {
        res.render('index', {
            articles: openArticles
        })

    })
})

app.get("/about", (req, res) => {
    res.send("about")
})


app.get("/articles/test", (req, res) => {
    res.send("test")  
})

app.get("/articles/:articleID", (req, res) => {
    // res.send("your ID: "+ req.params.articleID)
    scholarService.getArticleByID(req.params.articleID).then((article) => {
        res.send(article)
    }).catch((err) => {
        console.log(err)
        res.send(err)
    })
})



app.use((req, res, next) => {
    res.status(404).send("404 - We're unable to find what you're looking for.");
})

scholarService.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`server listening at port ${HTTP_PORT}`)
    })
})
