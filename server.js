const express = require("express")
const app = express()

const HTTP_PORT = 8080
const scholarService = require("./modules/scholarService")


app.get("/", (req, res) => {
    res.redirect("/articles")
})

app.get("/articles", (req, res) => {
    scholarService.getArticles().then((articles) => {
        res.json(articles)
    })
})

scholarService.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`server listening at port ${HTTP_PORT}`)
    })
})
