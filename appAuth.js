//jshint esversion:6

require('dotenv').config()  // for env variable to keep some secret stuff
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const md5 = require('md5');
const  ejs =require("ejs");
// required to use cookies and session
const session = require("express-session");
const passport =require("passport");
const passportLocalMongoose =require("passport-local-mongoose");


const findOrCreate = require('mongoose-findorcreate');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

///////////
//it store the user login session
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/keyDb", {useNewUrlParser: true});
//mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
  gmail: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const  User = new mongoose.model("User", userSchema);

passport.use( User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/home",function(req,res){
    res.render("homeAuth");
});

app.get("/login",function(req,res){
    res.render("loginAuth");
});

app.get("/register",function(req,res){
    res.render("registerAuth");
});

app.post("/login",function(req,res){
   
     const user = new User({
    username: req.body.username,
    password: req.body.password
  });
    
     req.login(user, function(err){
    if (err) {
      console.log(err);
        console.log("heloo");
    } else {
        passport.authenticate("local")(req, res, function(){

          // here my blog post come
        res.redirect("/secrets");
       });
    }
    });
});

app.get("/secrets",function(req,res){
     if (req.isAuthenticated()){
    res.render("secrets/Auth");
  } else {
    res.redirect("/login");
  }
})

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});


app.post("/register",function(req,res){
    
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        // open the blog
        res.redirect("/secrets");
      });
    }
});
 });

 app.post("/secrets",function(req,res){
     res.render('submitAuth');
 });

app.post("/submit",function(req,res){
   
   let hiddensecret =req.body.secret;
    let name=req.body.username;
   let pass =req.body.password;
    
   User.updateOne({username:name,password:pass},{secret:hiddensecret},function(error){
       if(!error){
            console.log("succesfully updated with secret in registered credential");
        }else {
          res.redirect('/login');
        }
    })
   res.render("submitAuth");   
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

// for secrets api project
//CLIENT_ID=702407464070-jeehiel1c93418s0najobgar8j6bl0j4.apps.googleusercontent.com
//CLIENT_SECRET=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
//for authentcation project
//CLIENT_ID=497706889907-dte0hi34h0ja31rscuqog2mgavccp39v.apps.googleusercontent.com
//CLIENT_SECRET=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