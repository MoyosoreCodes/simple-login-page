var dbConnection = require('./nodelogin/database');
var express = require('express');
var session = require("express-session");
var bodyParser = require('body-parser');
var path = require('path');
var port = 4000;



var app = express();


app.use(bodyParser.urlencoded({extended : false}));


app.use(session({
    secret: 'somekindasecretiswhatshouldbehere',
    resave: true,
    saveUninitialized: true
}));



app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.render("login");
    req.session.loggedin = false;
});

app.post("/auth", (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var sql = "SELECT * FROM `accounts` WHERE username = ? AND password = ?";
    if (username && password) {
        dbConnection.query(sql, [username, password], (err ,rows , fields) => {
            if (err) {
                console.log("Cannot Execute Query");
            }else {
                if( rows.length > 0) {
                    req.session.loggedin = true ;
                    req.session.username = username;
                    res.redirect("/home");
                }else {
                    res.send("Incorrect Username and Password");
                }
            }
        })
    }
});

app.get("/addUser", (req, res) => {
    res.render("Register");
});
app.post("/register", (req, res) => {
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var sql = "INSERT INTO `accounts`(`username`, `password`, `email`) VALUES (?,?,?)";

    if(email && username && password){
        dbConnection.query(sql, [username, password, email], (err, rows, fields) => {
            if(err){
                console.log("Cannot Execute Query");
            }else {
                res.redirect("/");
            }
        })
    }
});

app.get("/home", (req, res) => {
    var user = req.session.username
    if (req.session.loggedin) {
		res.render("User" , {username : user.toString()} );
	} else {
		res.send('Please login to view this page!');
	}
	res.end();
});

app.post("/logout", (req, res) => {
    req.session.loggedin = false;
    res.redirect("/")
});

app.listen(port, () => [
    console.log(`Listening to requests on http://localhost:${port}`)
]);