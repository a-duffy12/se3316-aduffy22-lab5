const express = require("express"); // get express 
const fs = require("fs"); // get fs module
const cors = require("cors"); // get cors module
const j1data = require("./data/Lab5-timetable-data.json"); // json data for courses
const j2data = require("./data/Lab5-schedule-data.json"); // json data for schedules
const j3data = require("./Lab5-user-data.json"); // json data for users
const sfile = "./data/Lab5-schedule-data.json"; // file holding json data for scehdules
const ufile = "./data/Lab5-user-data.json"; // file holding json data for users

const app = express(); // create app constant
const crouter = express.Router(); // create router obejct for courses
const srouter = express.Router(); // create router object for schedules
const cdata = JSON.parse(JSON.stringify(j1data)); // parse json object holding the courses

const corsOptions = { // options for cors
    origin: "http://localhost:4200",
    optionsSuccessStatus: 200
}

ocrouter.use(express.json()); // allows express to parse json objects (middleware)
osrouter.use(express.json()); // allows express to parse json objects (middleware)
scrouter.use(express.json()); // allows express to parse json objects (middleware)
ssrouter.use(express.json()); // allows express to parse json objects (middleware)
acrouter.use(express.json()); // allows express to parse json objects (middleware)
asrouter.use(express.json()); // allows express to parse json objects (middleware)

app.use("/", express.static("static")); // folder where client-side code is stored

app.use(cors(corsOptions)); // middleware to allow CORS

app.use((req, res, next) => { // middleware function to do console logs
    console.log(`${req.method} request for ${req.url}`); // print to console
    next(); // continue processeing
});

app.use("/api/open/courses", ocrouter); // install router object path for courses
app.use("/api/open/schedules", osrouter) // install router object path for schedules
app.use("/api/secure/courses", scrouter); // install router object path for courses
app.use("/api/secure/schedules", ssrouter) // install router object path for schedules
app.use("/api/admin/courses", acrouter); // install router object path for courses
app.use("/api/admin/schedules", asrouter) // install router object path for schedules

// get PORT environment variable, or use 3000 if not available
const port = process.env.PORT || 3000;
app.listen(port, () => {console.log(`Listeneing on port ${port}`)}); // choose which port to listen on

// function to read from JSON file before each usage of the sdata array
function getData(file)
{
    return JSON.parse(JSON.stringify(file)); // parse json object holding the schedules;
};

// function to write to JSON file after each update to sdata array
function setData(array, file)
{
    fs.writeFile(file, JSON.stringify(array), error => {

        if (error) // if an error is thrown when writing
        {
            throw error;
        }

        console.log(`Successfully wrote to file with name: ${file}`);
    })
};

// function to alphanumeric input
function sanitizeInput(input, l) 
{ 
    // limit is 1000 characters, as test cases with 15 courses (max amount) were always in the range of 700-800 characters
    if (String(input).includes("<") || String(input).includes(">") || String(input).includes("^") || String(input).includes(".") || String(input).includes("/") || String(input).includes("(") || String(input).includes(")") || String(input).includes("*") || String(input).includes("'") || String(input).includes("_") || String(input).includes("=") || String(input).includes("$") || String(input).includes("?") || String(input).includes("!") || String(input).includes("%") || String(input).includes("\"") || String(input).includes("`") || String(input).includes("+") || String(input).includes("|") || String(input).includes("&") || String(input).length >= l || String(input).length < 1)
    {
        return false;
    }
    else
    {
        return true;
    }
};