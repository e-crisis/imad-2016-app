var express = require('express');//importing library: creates the webserver
var morgan = require('morgan');//importing library: outputs log of our server
var path = require('path');//importing library
var Pool = require('pg').Pool;
var config = {
    user: 'e-crisis',
    database: 'e-crisis',
    host: 'db.imad.hasura-app.io',
    port: '5432',
    password: process.env.DB_PASSWORD
};
var app = express();
app.use(morgan('combined'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

var pool = new Pool(config);
app.get('/test-db', function (req, res) {
    //make a select request
    //return a response with results
    pool.query('SELECT * FROM TEST', function (err,result){
        if (err) {
            res.status(500).send(err.toString());
        } else {
            res.send(JSON.stringify(result));
        }
        
    });
});

var counter = 0;
app.get('/counter', function (req, res) {
 counter = counter + 1;
  res.send(counter.toString());//you can only send a string as a response and hence we convert the number to a string format
});
var comments = [];
app.get('/submit-comment', function (req, res) { // URL: /submit-comment?comment=xxxxxx
    //get the name from the request
    var comment = req.query.comment;
    comments.push(comment);
    // JSON: JavaScript object notation
    res.send(JSON.stringify(comments));//this will convert the array into a string
});
var names = [];
app.get('/submit-name', function (req, res) { // URL: /submit-name?name=xxxx
    //get the name from the request
    var name = req.query.name;
    names.push(name);
    // JSON: JavaScript object notation
    res.send(JSON.stringify(names));//this will convert the array into a string
});
app.get('/article-one', function (req, res){
 res.sendFile(path.join(__dirname, 'ui', 'article-one.html'));
});
app.get('/article-two', function (req, res){
 res.sendFile(path.join(__dirname, 'ui', 'article-two.html'));
});
app.get('/article-three', function (req, res){
 res.sendFile(path.join(__dirname, 'ui', 'article-three.html'));
});
app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});
app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});



var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
