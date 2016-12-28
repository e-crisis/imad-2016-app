var express = require('express');//importing library: creates the webserver
var morgan = require('morgan');//importing library: outputs log of our server
var path = require('path');//importing library
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');
var config = {
    user: 'e-crisis',
    database: 'e-crisis',
    host: 'db.imad.hasura-app.io',
    port: '5432',
    password: process.env.DB_PASSWORD
};
var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
    secret: 'someRandomValue',//key to encrypt the cookie with
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30}//age of cookie,in this case cookie lasts for 1 month
    
}));
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
                
                <input type="submit" value="Submit" id="submit_comment">
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

app.get('/about', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'about.html'));
});

app.get('/contact', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'contact.html'));
});

function hash (input, salt) {
    //how to create a hash? use crypto library.
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');//512 byte string,the value of salt is appended to the input,apply hash function 10000 times;salt used to increase security of passwords
    return ["pbkdf2", "10000", salt, hashed.toString('hex')].join('$');//output comes in binary, we want it in hex
}

app.get('/hash/:input', function (req, res) {
    var hashedString = hash(req.params.input, 'random-string');
    res.send(hashedString);
    
});

app.post('/create-user', function (req, res) {
    //takes username and password as input and creates an entry in the user table of the database
    //{"username": "pree", "password": "password"} 
    //JSON
    
    var username = req.body.username;
    var password = req.body.password;

    var salt = crypto.randomBytes(128).toString('hex');
    var dbString = hash(password, salt);
    pool.query('INSERT INTO "user" (username, password) VALUES ($1, $2)', [username, dbString], function (err,result){
        if (err) {
            res.status(500).send(err.toString());
        } else {
            res.send('user successfully registered: ' + username);
        }
    
    });
    
});
app.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    pool.query('SELECT * FROM "user" WHERE username = $1', [username], function (err,result){ //$1 is the username value
        if (err) {
            res.status(500).send(err.toString());
        } else {
            if(result.rows.length === 0){
                res.send(403).send('invalid username or password');
            }
            else{
                //match the password
                var dbString = result.rows[0].password;//first element in the password field
                var salt = dbString.split('$')[2];//split by $ will return an array. we extract the third value ie the salt from the array
                var hashedPassword = hash(password, salt); //creating a hash based on the password submitted and the original salt
                if (hashedPassword === dbString) {
                    //set a session
                    req.session.auth = {userId: result.rows[0].id};
                    //set cookie with a session id that is randomly generated
                    //internally, on the server side it maps the session id to an object
                    //this object contains a value called auth with contains
                    // {auth: {userId}}
                    res.send('user seccessfully logged in!');
                
            } else{
                res.send(403).send('invalid username or password');
            }
          }
        }
    });
    
});

app.get('/check-login', function (req, res) {
    if (req.session && req.session.auth && req.session.auth.userId) {
        res.send('you are logged in: ' + req.session.auth.userId.toString());
    } else {
        res.send('you are not logged in');
    }
});



app.get('/logout', function (req, res) {
    delete req.session.auth;
    res.send('logged out');
});
    
var pool = new Pool(config);

app.get('/get-articles', function (req, res) {
   // make a select request
   // return a response with the results
   pool.query('SELECT * FROM article ORDER BY date DESC', function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send(JSON.stringify(result.rows));
      }
   });
});

app.get('/get-comments/:articleName', function (req, res) {
   // make a select request
   // return a response with the results
   pool.query('SELECT comment.*, "user".username FROM article, comment, "user" WHERE article.title = $1 AND article.id = comment.article_id AND comment.user_id = "user".id ORDER BY comment.timestamp DESC', [req.params.articleName], function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send(JSON.stringify(result.rows));
      }
   });
});

app.post('/submit-comment/:articleName', function (req, res) {
   // Check if the user is logged in
    if (req.session && req.session.auth && req.session.auth.userId) {
        // First check if the article exists and get the article-id
        pool.query('SELECT * from article where title = $1', [req.params.articleName], function (err, result) {
            if (err) {
                res.status(500).send(err.toString());
            } else {
                if (result.rows.length === 0) {
                    res.status(400).send('Article not found');
                } else {
                    var articleId = result.rows[0].id;
                    // Now insert the right comment for this article
                    pool.query(
                        "INSERT INTO comment (comment, article_id, user_id) VALUES ($1, $2, $3)",
                        [req.body.comment, articleId, req.session.auth.userId],
                        function (err, result) {
                            if (err) {
                                res.status(500).send(err.toString());
                            } else {
                                res.status(200).send('Comment inserted!');
                            }
                        });
                }
            }
       });     
    } else {
        res.status(403).send('Only logged in users can comment');
    }
});

app.get('/articles/:articleName', function (req, res){
 //articleName == article-one
 //articles[articleName] == {} content object for article one
 //SELECT * FROM article WHERE title = 'article-one' 
 pool.query("SELECT * FROM article WHERE title = $1", [req.params.articleName], function (err, result) {
    if (err) {
            res.status(500).send(err.toString());
        } else {
            if(result.rows.length === 0) {
               res.status(404).send('article not found'); 
            } else {
                var articleData = result.rows[0]; 
                res.send(createTemplate(articleData));
            }
        } 
 });
 
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
