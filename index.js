const express = require("express"); // get express 
const fs = require("fs"); // get fs module
const cors = require("cors"); // get cors module
const j1data = require("./data/Lab5-timetable-data.json"); // json data for courses
const j2data = require("./data/Lab5-schedule-data.json"); // json data for schedules
const j3data = require("./Lab5-user-data.json"); // json data for users
const j4data = require("./Lab5-courses-comments-data.json") // json data for course comments
const sfile = "./data/Lab5-schedule-data.json"; // file holding json data for scehdules
const ufile = "./data/Lab5-user-data.json"; // file holding json data for users
const rfile = "./data/Lab5-courses-comments-data.json"; // file holding data for course comments

const app = express(); // create app constant
const orouter = express.Router(); // create router object for open routes
const srouter = express.Router(); // create router object for secure routes
const arouter = express.Router(); // create router object for admin routes
const cdata = JSON.parse(JSON.stringify(j1data)); // parse json object holding the courses

const corsOptions = { // options for cors
    origin: "http://localhost:4200",
    optionsSuccessStatus: 200
}

orouter.use(express.json()); // allows express to parse json objects (middleware)
srouter.use(express.json()); // allows express to parse json objects (middleware)
arouter.use(express.json()); // allows express to parse json objects (middleware)

app.use("/", express.static("static")); // folder where client-side code is stored

app.use(cors(corsOptions)); // middleware to allow CORS

app.use((req, res, next) => { // middleware function to do console logs
    console.log(`${req.method} request for ${req.url}`); // print to console
    next(); // continue processeing
});

// OPEN ROUTES

// search for an account GET
// create an account POST
// search for courses based on subject, course number, catalog number, or both GET
// expanded search results for the above GET
// search based on a keyword of 5+ chars GET
// display all public schedules GET
// search for a given schedule data GET
// display timetable data for a given public schedule GET


// SECURE ROUTES

// create a new schedule POST
// update an existing schedule PUT
// delete an exisitng schedule DELETE
// add a review for a specific course POST


// ADMIN ROUTES

// give admin status to a given user PUT
// hide and un-hide course reviews PUT
// activate and deactivate a given user PUT


app.use("/api/open", orouter); // install router object path for open routes
app.use("/api/secure", srouter) // install router object path for secure routes
app.use("/api/admin", arouter); // install router object path for admin routes

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
    // variable character limit
    if (String(input).includes("<") || String(input).includes(">") || String(input).includes("^") || String(input).includes(".") || String(input).includes("/") || String(input).includes("(") || String(input).includes(")") || String(input).includes("*") || String(input).includes("'") || String(input).includes("_") || String(input).includes("=") || String(input).includes("$") || String(input).includes("?") || String(input).includes("!") || String(input).includes("%") || String(input).includes("\"") || String(input).includes("`") || String(input).includes("+") || String(input).includes("|") || String(input).includes("&") || String(input).length >= l || String(input).length < 1)
    {
        return false;
    }
    else
    {
        return true;
    }
};