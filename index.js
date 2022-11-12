let express = require("express");
let bodyparser = require("body-parser");
let connection = require("./connection");
require("dotenv").config();
let app = express();

app.use(express.static("assets"));
app.use(express.json());
app.use(bodyparser.json({ limit: '50mb' }));
app.use(bodyparser.urlencoded({ limit: '50mb', extended: true }));

app.get("/", function (req, res) {
    res.send("Welcome to Ecom");
    res.end();
});

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    if (req.method == "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "POST, GET, PUT, PATCH, DELETE");
        return res.status(200).json({});
    }
    next();
});


app.use("/user", require("./routes/user"));

app.listen(process.env.PORT, function () {
    console.log("🚀 http://localhost:8081/");
});