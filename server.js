const express = require("express")
const app = express()
const env = require("dotenv")
env.config()

const HTTP_PORT = process.env.PORT || 8080
const scholarService = require("./modules/scholarService")
const userService = require("./modules/userService")
const path = require("path")
const clientSessions = require('client-sessions');

app.use(express.static("public"))
app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }));

app.use(
    clientSessions({
      cookieName: 'session', // this is the object name that will be added to 'req'
      secret: 'o6LjQ5EVNC28ZgK64hDELM18ScpFQr', // this should be a long un-guessable string.
      duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
      activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
    })
)

function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect('/login');
    } else {
      next();
    }
  }

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
})
  
app.get("/", (req, res) => {
    res.redirect("/articles")
})

app.get("/articles", (req, res) => {

    if (req.query.journal) {
        scholarService.getArticlesByJournal(req.query.journal).then((articles) => {
            // res.send(articles)
            res.render('index', {
                articles: articles,
                chat: null
            })
        }).catch((err) => {
            // console.log(err)
            res.send(err)
        })
    } else {
        scholarService.getArticles().then((articles) => {
            // res.json(articles)
            // res.sendFile(path.join(__dirname, "/views/index.html"))
            res.render('index', {
                articles: articles,
                chat: null
            })
            // console.log(articles)
            // articles.forEach((article) => {
            //     scholarService.summarizeAbstract(article.description).then(() => {
            //         console.log("success")
            // })
            // })
        }).catch((err) => {
            console.log(err)
        })
    }


})

app.get('/articles/openAccess', (req, res) => {
    scholarService.getArticleByOpenAccess().then((openArticles) => {
        res.render('index', {
            articles: openArticles,
            chat: null
        })

    })
})

app.get("/about", ensureLogin, (req, res) => {
    res.send("about")
})


app.get("/articles/new", ensureLogin, (req, res) => {
    // res.send("new")  
    res.render('newArticle', {
        data: 0
    })
})

app.get("/articles/:articleID", (req, res) => {
    // res.send("your ID: "+ req.params.articleID)
    scholarService.getArticleByID(req.params.articleID).then((article) => {
        // res.send(article)
        res.render('index', {
            articles: [article],
            chat: null
        })
    }).catch((err) => {
        console.log(err)
        res.send(err)
    })
})

app.get("/journals/delete/:journalID", (req, res) => {
    scholarService.deleteJournal(req.params.journalID).then(() => {
        res.redirect("/journals")
    }).catch((err) => {
        res.send(err)
    })
})

app.get("/journals/new", (req, res) => {
    res.render('newJournal')
})



app.post("/journals/new", (req, res) => {
    // console.log(req.body)
    scholarService.addJournal(req.body).then(() => {
        res.redirect("/journals")
    })

    // your logic here to check if req.body.password == yourDataOnFileForThisUser.password
    // res.send(req.body)
})

app.get("/journals", (req, res) => {
    scholarService.getJournals().then((journals) => {
        // res.send(journals)
        res.render('journals', {
            journals: journals
        })
    })
})


app.post("/chat", (req, res) => {
    scholarService.chat(req.body.chat).then((chat) => {
        // res.render(data)
        scholarService.getArticles().then((articles) => {
            // res.json(articles)
            // res.sendFile(path.join(__dirname, "/views/index.html"))
            res.render('index', {
                articles: articles,
                chat: chat
        
            })
    })
})
})

app.get("/register", (req, res) => {
    res.render('register', {
        successMessage: null,
        errorMessage: null
    })
})

app.post("/register", (req, res) => {
    userService.registerUser(req.body).then((success) => {
        res.render('register', {
            successMessage: success,
            errorMessage: null
        })
    }).catch((err) => {
        console.log(err)
        res.render('register', {
            successMessage: null,
            errorMessage: err
        })
    })
})

app.get("/login", (req, res) => {
    res.render('login')
})

app.post("/login", (req, res) => {
    req.body.userAgent = req.get('User-Agent')
    userService.loginUser(req.body).then((user) => {
        //session stuff here
        req.session.user = {
            username: user.username,
            email: user.email,
            loginHistory: user.loginHistory
        }

        res.redirect("/articles")
    }).catch((err) => {
        res.send(err)
    })
})

app.get("/logout", (req, res) => {
    req.session.reset()
    res.redirect("/login")
})

app.use((req, res, next) => {
    res.status(404).send("404 - We're unable to find what you're looking for.");
})

scholarService.initialize()
.then(userService.initialize)
.then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`server listening at port ${HTTP_PORT}`)
    })
}).catch((err) => {
    console.log(err)
})
