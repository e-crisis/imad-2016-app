

//submit username and password to login

var submit = document.getElementById('submit_btn');
submit.onclick = function () {
    //create a request object
    var request = new XMLHttpRequest();
    //capture the response and store it in a variable
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            //Take some action
            if (request.status === 200) {
                //capture a list of names and render it as a list
               console.log('user logged in');
               alert('Congrats!!The magic has been UNLOCKED!');
               } else if (request.status === 403) {
                   alert('uh-oh! wrong username or password :(');
               } else if (request.status === 500) {
                   alert('something went wrong with the magic wand');
               }
               
            }
        //not done yet
    };
     
     //make the request
     var username = document.getElementById('username').value;
     var password = document.getElementById('password').value;
     console.log(username);
     console.log(password);
     request.open('POST','http://e-crisis.imad.hasura-app.io/login', true);
     request.setRequestHeader('Content-Type', 'application/json');
     request.send(JSON.stringify({username: username, password: password}));
   
};

//submit comment

var submitComment = document.getElementById('submit_comment');
submitComment.onclick = function () {
    //create a request object
    var request = new XMLHttpRequest();
    //capture the response and store it in a variable
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            //Take some action
            if (request.status === 200) {
                //capture a list of comments and render it as a list
               var comments = request.responseText;
               comments = JSON.parse(comments);
               var list = '';
               for (var i=0; i<comments.length; i++) {
                   list += '<li>' + comments[i] + '</li>';
                   
               }
               var uli = document.getElementById('commentList');
               uli.innerHTML = list;
            }
        }
    };
    
     //make the request
     var commentInput = document.getElementById('comment');
     var comment = commentInput.value;
     request.open('GET','http://e-crisis.imad.hasura-app.io/submit-comment?comment=' + comment, true);
     request.send(null);
    
};
