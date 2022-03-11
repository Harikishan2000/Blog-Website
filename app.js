//jshint esversion:6
// first need to download the dependencies module in the project by npme install

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose"); 
const md5 = require("md5"); 


// Load the full build.
var _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://Hari2000:Hari2000@cluster0.7meav.mongodb.net/blogdb", {useNewUrlParser: true});

const homeStartingContent = "Here, you can write your daily blog ";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";




var postList=[];
var usergmail;
const postSchema ={
    title:String,
    content:String
}

// mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  //
  post:[postSchema],
});

const User = new mongoose.model("User", userSchema);
//const Post = mongoose.model("Post", postSchema);

app.get("/home",function(req,res){
  
    if(postList.length==0){
        User.findOne({email:usergmail},function(error,result){
            if(error){
                console.log(error);
            } else {    
                   userposts=result.post;    
                  userposts.forEach(function(userPost){
                    let p={
                        title:userPost.title,
                        content:userPost.content
                    }
                    console.log(userPost.title); 
                    console.log(userPost.content); 
    
                     postList.push(p);
                });   
            }    
        });
    }
    

    res.render("home",{homeContent:homeStartingContent,postList:postList});
});

app.get("/about",function(req,res){
    res.render("about",{aboutContent:aboutContent});
});

app.get("/contact",function(req,res){
    res.render("contact",{contactContent:contactContent});
});
app.get("/compose",function(req,res){
    res.render("compose");
});
app.post("/home",function(req,res){
    res.redirect("/compose");
});

app.post("/compose",function(req,res){
  
    var  newPost = {
        title:req.body.titleName,
        content:req.body.postText
    }
   /*   const  post = new Post({
            title:req.body.titleName,
            content:req.body.postText
        }); */
    
     User.findOne({email:usergmail},function(error,foundUser){
            foundUser.post.push(newPost); 
            foundUser.save();    
        });

    postList.push(newPost);
    res.redirect("/home");
    //console.log(newPost);
});

// express route used for particular root to send request
// documentation for express routing
app.get("/posts/:postName",function(req,res){
    
    var titlePostReq = _.lowerCase(req.params.postName);  // lodash functionality https://lodash.com/
    
    postList.forEach(function(post){
        
         if(titlePostReq==_.lowerCase(post.title)){
             console.log("matched");
            res.render("post",{postTitle:post.title,postContent:post.content}); 
         } else  console.log("not matched");
    });
    
});

///////////////////////////////////////////////////////////////////////////
// this all get and post request handle the logins page
app.get("/", function(req, res){
    res.render("homeAuth");
  });
  app.get("/login", function(req, res){
    res.render("loginAuth");
  });
  app.get("/register", function(req, res){
    res.render("registerAuth");
  });

  app.get("/logout", function(req, res){
       
       while(postList.length!=0){
        postList.pop();
       }
       res.redirect("/");
  });
  
  app.post("/register", function(req, res){
      
      if(postList.length!=0){
        while(postList.length!=0){
          postList.pop();
        }
      }

  
       
      const newUser =  new User({
          email: req.body.username,
          password: md5(req.body.password)
        });
        usergmail =req.body.username;

        User.findOne({email:usergmail},function(error,result){
          if(error){
              console.log(error);
          } else {    
             if(result){
               console.log("This account is already exist");
               res.redirect('/');
             }else{

              newUser.save(function(err){
                if (err) {
                  console.log(err);
                } else {
                  res.redirect("/home");
                }
              });

             }  
          }    
      });

       
    
    
    });

    app.post("/login", function(req, res){
        usergmail = req.body.username;
       // password = req.body.password;
       const password = md5(req.body.password);
        User.findOne({email: usergmail}, function(err, foundUser){
            if (err) {
              console.log(err);
            
            } else {
              if (foundUser) {
               
                    if (foundUser.password == password) {
                      res.redirect("/home");
                    }else{ res.redirect('/');  }
               
                }else{
                    res.redirect('/');  
                }
              }
            });
        }); 

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
