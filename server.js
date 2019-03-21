var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var fs = require("fs");
var jwt = require("jsonwebtoken");
let config = require('./config');
let middleware = require('./middleware');

var app = express();
var jsonParser = bodyParser.json();

app.use(express.static(__dirname + "/public"));
app.use(cookieParser());

app.get("/api/books",function(req, res){
    var content = fs.readFileSync("books.json", "utf8");
    var books = JSON.parse(content);
    
    res.send(books);
});

//get book by id
app.get("/api/books/:id", function(req, res){
      
    var id = req.params.id; //get id
    var content = fs.readFileSync("books.json", "utf8");
    var books = JSON.parse(content);
    var book = null;

    //searsch book by id
    for(var i=0; i<books.length; i++){
        if(books[i].id==id){
            book = books[i];
            break;
        }
    }

    //send book
    if(book){
        res.send(book);
    }
    else{ 
        res.sendStatus(404);
    }
});

//add book
app.post("/api/books", jsonParser,middleware.checkToken, function (req, res) {
     
    if(!req.body) 
        return res.sendStatus(400);
     
    var book = {title: req.body.title, author: req.body.author, release: req.body.release};
     
    var data = fs.readFileSync("books.json", "utf8");
    var books = JSON.parse(data);
     
    //search max id
    var id = Math.max.apply(Math,books.map(function(o){return o.id;}))
    //inc it
    book.id = id+1;
    //add book
    books.push(book);
    var data = JSON.stringify(books);
    //rewrite file
    fs.writeFileSync("books.json", data);
    res.send(book);
});

//delete by id
app.delete("/api/books/:id",middleware.checkToken, function(req, res){
      
    var id = req.params.id;
    var data = fs.readFileSync("books.json", "utf8");
    var books = JSON.parse(data);
    var index = -1;

    //search book index
    for(var i=0; i<books.length; i++){
        if(books[i].id==id){
            index=i;
            break;
        }
    }

    if(index > -1){
        //delete book 
        var book = books.splice(index, 1)[0];//deleted element
        var data = JSON.stringify(books);
        fs.writeFileSync("books.json", data);
        //send deleted book
        res.send(book);
    }
    else{
        res.status(404).send();
    }
});

//modify book
app.put("/api/books", jsonParser,middleware.checkToken, function(req, res){
      
    if(!req.body) 
        return res.sendStatus(400);
     
    var bookId = req.body.id;     
    var data = fs.readFileSync("books.json", "utf8");
    var books = JSON.parse(data);
    var book;

    for(var i=0; i<books.length; i++){
        if(books[i].id==bookId){
            book = books[i];
            break;
        }
    }
    //modify data
    if(book){
        book.title = req.body.title;
        book.author = req.body.author;
        book.release = req.body.release;
        var data = JSON.stringify(books);
        fs.writeFileSync("books.json", data);
        res.send(book);
    }
    else{
        res.status(404).send(book);
    }
});

//authorization
app.post("/api/authorize", jsonParser, function (req, res) {
    if(!req.body) 
        return res.sendStatus(400);
     
    var login = req.body.login;
    var password = req.body.password;
     
    var data = fs.readFileSync("users.json", "utf8");
    var users = JSON.parse(data);
     
    var searchResult = users.filter(user => (user.login === login));
    if (searchResult.length > 0){
        if (searchResult[0].password === password){
            var uToken = middleware.createToken(searchResult[0].login);
            console.log("User "+login+" sign in");
            res.setHeader("Set-Cookie",`jwt=${uToken}; HttpOnly`);
            res.send(searchResult[0]);
        }else{
            console.log("wrong password for "+login)
            return res.sendStatus(401);
        }
    }
    else{
        console.log("User not found(404)");
        return res.sendStatus(404);//conflict
    }
});

//register user
app.post("/api/register", jsonParser, function (req, res) {
    if(!req.body) 
        return res.sendStatus(400);
     
    var newUser = {name: req.body.name, login: req.body.login, password: req.body.password};
     
    var data = fs.readFileSync("users.json", "utf8");
    var users = JSON.parse(data);
     
    //add book
    if (users.filter(user => (user.login === newUser.login)).length == 0){
        var uToken = middleware.createToken(newUser.login);

        console.log("User "+newUser.login+" was register");
        users.push(newUser);
        var data = JSON.stringify(users);
        //rewrite file
        fs.writeFileSync("users.json", data);
        res.setHeader("Set-Cookie",`jwt=${uToken}; HttpOnly`);
        res.send(newUser);
    }
    else{
        console.log("Register error(409)");
        return res.sendStatus(409);//conflict
    }
});

app.listen(3000, function(){
    console.log("Server started...");
});