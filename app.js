const express = require('express');
var bodyParser = require("body-parser");
var cors = require('cors');
const logger = require("morgan");
var errorhandler = require('errorhandler');
var notifier = require('node-notifier');
const redis = require("redis");
const cookieParser = require('cookie-parser');

// for support env
require('dotenv').config();
const port = process.env.PORT;
const REDIS_PORT = process.env.REDIS_PORT || 6379;
global.path = require('path');
const handlebars = require('express-handlebars');
// Auth function middleware
const authenticateToken = require("./middleware/authorization");

// connect database 
require('./db/db');

const app = express();

// Use cookie parser
app.use(cookieParser());

// Role access Middleware 
global.role = require('./middleware/permission');

//Create Redis client on Redis port
// const redisClient = redis.createClient(REDIS_PORT);

// redisClient.on("error", function (error) {
//     console.error(error);
// });

// redisClient.set("key", "value", redis.print);
// redisClient.get("key", redis.print);


//  error handler
if (process.env.NODE_ENV === 'development') {
    // only use in development
    app.use(errorhandler({
        log: errorNotification
    }))
}
//  Error notifier
function errorNotification(err, str, req) {
    var title = 'Error in ' + req.method + ' ' + req.url

    notifier.notify({
        title: title,
        message: str
    })
}

// configuration for cors
var corsOptions = {
    origin: '*',
    // methods:'POST,PUT',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
// use cors
app.use(cors(corsOptions));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));
// Logging API req
app.use(logger("dev"));


// parse application/json
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

// notifier.notify({
//     title: "hello",
//     message: "This is notification",
//     icon: path.join(__dirname, 'public/image/notification.png'),
//     sound: path.join(__dirname, 'public/sounds/notif.mp3'),
//     wait: true
// });


//  views engine

// app.set('view engine', '.hbs');
// app.engine("hbs", handlebars({
//     extname: "hbs",
//     defaultLayout: false,
//     layoutsDir: "views/"
// }));


const userRouter = require('./routers/user');
const productRouter = require('./routers/products');
const cartRouter = require('./routers/carts');
const orderRouter = require('./routers/orders');

// add routes
app.use(express.json());
app.use('/users', userRouter);
app.use(authenticateToken);
app.use('/products', productRouter);
app.use('/carts', cartRouter);
app.use('/orders', orderRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});