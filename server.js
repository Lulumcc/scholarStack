const express = require("express")
const app = express()

const HTTP_PORT = 8080
const scholarService = require("./modules/scholarService")
const path = require("path")

app.use(express.static("public"))

app.get("/", (req, res) => {
    res.redirect("/articles")
})

app.get("/articles", (req, res) => {
    scholarService.getArticles().then((articles) => {
        // res.json(articles)
        res.sendFile(path.join(__dirname, "/views/index.html"))
        console.log(articles)
    })
})

app.get("/about", (req, res) => {
    scholarService.getArticles().then((articles) => {
        // res.json(articles)
        res.send(articles)
    })})

scholarService.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`server listening at port ${HTTP_PORT}`)
    })
})
