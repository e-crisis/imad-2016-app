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

var articles = {
    'article-one': {
        title: 'Article One | Preetika Mondal',
        heading: 'Article One',
        date: 'Sep 5, 2016',
        content: `
            <p>
                    i dont know what i am doing with my life. i know i am screwing it. i have a lot of work to do. 
                </p>
                <p>
                    i have to make report for my summer training project for which i have a presentation on 9th november.
                </p>
                <p>
                    i have to decide on my minor project, make the synopsis and submit it
                </p>
                <p>
                    currently the toughest part is deciding on something really awesome for my minor project. i want it to be useful and of significance. 
                </p>`
        
    },
    'article-two': {
        title: 'Article Two | Preetika Mondal',
        heading: 'Article Two',
        date: 'Sep 5, 2016',
        content: `
            <p>
                   This is the second article. 
            </p>`
        
    },
    'article-three': {
        title: 'Article Three | Preetika Mondal',
        heading: 'Article Three',
        date: 'Sep 5, 2016',
        content: `
            <p>
                   This is the third article. 
            </p>`
        
    }

};

function createTemplate (data) {
    var title = data.title;
    var date = data.date;
    var heading = data.heading;
    var content = data.content;
    var htmlTemplate = `
    <html>
        <head>
            <title>
               ${title} 
            </title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link href="/ui/style.css" rel="stylesheet" />
        </head>
        <body>
            <div class="container">
                <div>
                    <a href="/">Home</a>
                </div>
                <hr/>
                <h3>
                    ${heading}
                </h3>
                <div>
                    ${date}
                </div>
                <div>
                    ${content}
                </div>
                <hr/>
            
                <h3> Comments </h3>
                <input type="text" id="comment" placeholder="type your comment.." size="35">
                <br/>
                <br/>
                <input type="submit" value="submit" id="submit_comment">
                <ul id="commentList">
                    
                </ul>
            </div>
            <script type="text/javascript" src="/ui/main.js">
            </script>
        </body>
    </html>
    `;
    return htmlTemplate;
}            
    

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

var pool = new Pool(config);
app.get('/test-db', function (req, res) {
    //make a select request
    //return a response with results
    pool.query('SELECT * FROM test', function (err,result){
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
app.get('/:articleName', function (req, res){
 //articleName == article-one
 //articles[articleName] == {} content object for article one
 var articleName = req.params.articleName;
 res.send(createTemplate(articles[articleName]));
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
