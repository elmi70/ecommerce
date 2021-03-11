require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const methodOverride = require('method-override');


const port = process.env.PORT;
const uri = process.env.DB_URI;

const productRouter= require("./routes/product");
const Product= require('./model/Product');




//initialize app
const app = express();

mongoose.connect(uri, {useNewUrlParser: true,useUnifiedTopology:true});
mongoose.set("useCreateIndex", true);
//Get the default connection
const db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
    console.log("connected to db successfully")
});

app.use(express.static("public"));

//setting up templating engine
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride('_method'));
app.use(session({
    secret: "Our little secret.",
    resave: false,//don't save session if unmodified
    saveUninitialized: false ,// don't create session until something stored

}));
app.use(function (req,res,next){
    res.locals.session=req.session;
    next();
})
app.use(passport.initialize());
app.use(passport.session());
app.use(productRouter);




const userSchema=new mongoose.Schema({
    email: String,
    password:String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//home route
app.get("/",  async function(req, res){
    let products = await Product.find();

    res.render('home', { products: products });
});

//login route
app.get("/signin", function(req, res){
    res.render("signin");
});
//logout route
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

//register route
app.get("/register", function(req, res){
    res.render("register");
});

//add to cart
app.get("/add-to-cart", function(req, res){
    res.render("shoppingCart");
});
//
app.get("/shopping-cart", function(req, res){
    res.render("myCart");
});
//create new account
app.post("/register", function(req, res){

    User.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/admin");
            });
        }
    });

});

app.post("/signin", function(req, res){

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if (err) {
            res.redirect("/signin",);
        } else {
            passport.authenticate("local" )(req, res, function(){
                res.redirect("/admin");
            });

        }
    });

});





app.listen(port, function() {
    console.log("Server started on port specified.");
});