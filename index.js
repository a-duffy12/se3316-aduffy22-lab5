const express = require("express"); // get express 
const fs = require("fs"); // get fs module
const cors = require("cors"); // get cors module
const j1data = require("./data/Lab5-timetable-data.json"); // json data for courses
const j2data = require("./data/Lab5-schedule-data.json"); // json data for schedules
const j3data = require("./data/Lab5-user-data.json"); // json data for users
const j4data = require("./data/Lab5-courses-comments-data.json"); // json data for course comments
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

// OPEN ROUTES ----------------------------------

// search for an account GET
orouter.get("/users/:email", (req, res) => {
    
    if (sanitizeEmail(req.params.email)) 
    {
        udata = getData(j3data); // get user account data

        const exIndex = udata.findIndex(u => u.email === req.params.email); // find index of the exisitng user with the given email
    
        if (exIndex >= 0) // if the user exists
        {
            res.status(200).send(`User with email: ${req.params.email} exists`);
        }
        else if (exIndex < 0) // if the user does not exist
        {
            res.status(400).send(`User with email: ${req.params.email} does not exist`);
        }
    }  
    else
    {
        res.status(400).send("Invalid input!");
    }
});/*

// create an account POST
orouter.post("/:email", (req, res) => {
    // TODO
    // send user object to file
});

// search for courses based on subject, course number, catalog number, or both GET 3b
orouter.get("/courses/:subject?/:courseNum?/:catalog?", (req, res) => {
    // TODO
    // based on what is included, search cdata array for matches
    // return subject, catalog_nbr, className, class_section, ssr_component, and timetable for all results
});

// expanded search results for the above GET 3c
orouter.get("/courses/full/:subject?/:courseNum?/:catalog?", (req, res) => {
    uter.get("/courses/:subject?/:courseNum?/:catalog?", (req, res) => {
    // TODO
    // based on what is included, search cdata array for matches
    // return all information for each result
});

// search based on a keyword of 5+ chars GET 3d/3e
orouter.get("/courses/key/:keyword", (req, res) => {
    // TODO
    // match for catalog_nbg and/or className using substring and/or soft-matched
    // return all information for each result (?)
}); */

// display all public schedules GET 3f
orouter.get("/schedules", (req, res) => {
    sdata = getData(j2data); // get up to date schedule data

    if (sdata.length > 0) // if there are saved schedules
    {
        let schedules = []; // empty array of schedule objects
        let tally = 0; // keep track of schedules returned

        for (s in sdata)
        {
            if (sdata[s].visibility == "public" && tally < 10)
            {
                const obj = {}; // create empty object
                obj.name = sdata[s].name; // add schedule name
                obj.course_count = sdata[s].classes.length; // add number of classes
                obj.creator = sdata[s].creator; // add creator of the schedule
                obj.date_modified = sdata[s].date_modified; // add modification date of the schedule
                schedules.push(obj); // add object to array
                tally++;
            }
        }

        if (tally > 0)
        {
            res.send(schedules); // send the new array to the front end
        }
        else 
        {
            res.status(404).send("No public schedules exist");
        }
        
    }
    else // if there are no saved schedules
    {
        res.status(404).send("No schedules exist");
    }
});

// search for a given schedule data GET 3g
orouter.get("/schedules/:schedule", (req, res) => {
    
    if (sanitizeInput(req.params.schedule, 100))
    {
        sdata = getData(j2data); // get up to date schedule data

        const exIndex = sdata.findIndex(s => s.name === req.params.schedule); // find index of existing schedule of same name

        if ((exIndex >= 0) && (sdata[exIndex].visibility == "public")) // if the schedule exists
        {
            let obj = {}; // create empty object
            obj.name = sdata[exIndex].name; // set schedule name
            obj.classes = sdata[exIndex].classes; // set classes of the schedule
            obj.description = sdata[exIndex].description; // set description of the schedule
            res.send(obj); // send schedule data object
        }
        else if (exIndex >= 0)
        {
            res.status(404).send(`No public schedule found with name: ${req.params.schedule}`);
        }
        else if (exIndex < 0) // if the schedule doesn't exist
        {
            res.status(404).send(`No schedule found with name: ${req.params.schedule}`);
        }
    }
    else
    {
        res.status(400).send("Invalid input!");    
    }
})

// display timetable data for a given public schedule GET 3h
orouter.get("/schedules/full/:schedule", (req, res) => {
    
    if (sanitizeInput(req.params.schedule, 100))
    {
        sdata = getData(j2data); // get up to date schedule data

        const exIndex = sdata.findIndex(s => s.name === req.params.schedule); // find index of existing schedule of same name

        if (exIndex >= 0) // if the schedule exists
        {
            let timetables = []; // empty array for timetable data

            for (p in sdata[exIndex].classes) // iterate through each subject+course pair in the schedule
            {
                let sub = sdata[exIndex].classes[p].subject_code;
                let cor = sdata[exIndex].classes[p].course_code;

                for (c in cdata) // iterate through all classes looking for a match
                {
                    if ((cdata[c].subject == sub) && (cdata[c].catalog_nbr == cor))
                    {
                        for (t in cdata[c].course_info) // iterate through all class sections
                        {
                            let obj = {}; // create empty object
                            obj.subject_code = sub;
                            obj.course_code = cor;
                            obj.number = cdata[c].course_info[t].class_nbr; // add class number
                            obj.component = cdata[c].course_info[t].ssr_component; // add component type
                            obj.times = []; // empty array for class times

                            for (d in cdata[c].course_info[t].days) // build timetable by day
                            {
                                let obj2 = {}; // empty day object
                                obj2.day = cdata[c].course_info[t].days[d]; // add day
                                obj2.start = cdata[c].course_info[t].start_time; // add start time
                                obj2.end = cdata[c].course_info[t].end_time; // add end time
                                obj.times.push(obj2); // add object to nested array
                            }

                            timetables.push(obj); // add timetable object to array
                        }
                    }
                }
            }

            res.send(timetables); // return the time table
        }
        else if (exIndex < 0) // if the schedule doesn't exist
        {
            res.status(404).send(`No schedule found with name: ${req.params.schedule}`);
        }
    }
    else
    {
        res.status(400).send("Invalid input!");    
    }
});

// display review for a given course
orouter.get("/comments/:subject/:course/:email", (req, res) => {

    if (sanitizeInput(req.params.subject, 8) && sanitizeInput(req.params.course, 5) && sanitizeEmail(req.params.email))
    {
        rdata = getData(j4data); // get up to date comment data

        const exIndex = rdata.findIndex(r => (r.subject_code === req.params.subject) && (r.course_code === req.params.course) && (r.author === req.params.email))

        if (exIndex >= 0) // this exact comment already exists
        {
            if (rdata[exIndex].hidden) // comment is hidden
            {
                res.status(400).send(`Comment for ${req.params.subject}: ${req.params.course} by ${req.params.email} is hidden!`);
            }
            else if (!rdata[exIndex].hidden) // comment is not hidden
            {
                res.send(rdata[exIndex]); // send corresponding review
            }
        }
        else if (exIndex < 0) // if this exact comment does not already exist
        {
            res.status(400).send(`Comment for ${req.params.subject}: ${req.params.course} by ${req.params.email} does not exist!`);
        }
    }
    else if (sanitizeInput(req.params.subject, 8) && sanitizeInput(req.params.course, 5))
    {
        res.status(400).send("Invalid email address!");
    }
    else if (sanitizeEmail(req.params.email))
    {
        res.status(400).send("Invalid course!");
    }
    else
    {
        res.status(400).send("Invalid input!");
    }
});

// SECURE ROUTES --------------------------------

// create a new schedule POST 4a
// update an existing schedule PUT 4b
// delete an exisitng schedule DELETE 4c
srouter.route("/schedules/:schedule") // all routers that access a particular schedule
    .post((req, res) => {

        if (sanitizeInput(req.params.schedule, 100) && sanitizeInput(req.body, 2000)) // both header and body are valid
        {
            sdata = getData(j2data); // get up to date schedule data

            const newSchedule = req.body; // get info for the updated schedule
            newSchedule.name = req.params.schedule; // get name for the updated schedule

            let tally = 0;

            for (s in sdata)
            {
                if (sdata[s].creator === newSchedule.creator)
                {
                    tally++;
                }
            }
            
            if (tally < 20)
            {
                const exIndex = sdata.findIndex(s => s.name === newSchedule.name); // find index of existing schedule of same name

                if (exIndex >= 0) // if schedule already exists
                {
                    res.status(400).send(`Schedule already exists with name: ${newSchedule.name}`);
                }
                else if (exIndex < 0) // create a new schedule
                {       
                    sdata.push(newSchedule); // add new schedule to the array
                    res.send(`Created schedule with name: ${newSchedule.name}`);   
                }

                setData(sdata, sfile); // send updated schedules array to JSON file
            }
            else
            {
                res.status(400).send(`Unable to create schedule with name: ${newSchedule.name} as you have filled your 20 created schedules!`);
            }

            const exIndex = sdata.findIndex(s => s.name === newSchedule.name); // find index of existing schedule of same name

            if (exIndex >= 0) // if schedule already exists
            {
                res.status(400).send(`Schedule already exists with name: ${newSchedule.name}`);
            }
            else if (exIndex < 0) // create a new schedule
            {       
                sdata.push(newSchedule); // add new schedule to the array
                res.send(`Created schedule with name: ${newSchedule.name}`);   
            }

            setData(sdata, sfile); // send updated schedules array to JSON file
        }
        else if (sanitizeInput(req.params.schedule, 100)) // only header is valid
        {
            res.status(400).send("Schedule cannot be created due to inavlid input in request body");
        }
        else if (sanitizeInput(req.body, 1000)) // only body is valid
        {
            res.status(400).send("Schedule cannot be created due to invalid input in request header");
        }
        else // neither header nor body are valid
        {
            res.status(400).send("Schedule cannot be created due to invalid input in request header and request body");
        }
    })
    .put((req, res) => {

        if (sanitizeInput(req.params.schedule, 100) && sanitizeInput(req.body, 2000)) // both header and body are valid
        {
            sdata = getData(j2data); // get up to date schedule data
    
            const newSchedule = req.body; // get info for the new schedule
            newSchedule.name = req.params.schedule; // set name for new schedule
        
            const exIndex = sdata.findIndex(s => s.name === newSchedule.name); // find index existing schedule of same name
        
            if (exIndex >= 0) // if the schedule does exist
            {
                if (newSchedule.creator == sdata[exIndex].creator) // if the one issuing the request is the creator
                {
                    if (newSchedule.classes.length > 0) // if the schedule is not empty
                    {
                        sdata[exIndex] = newSchedule; // replace existing schedule with updated schedule
                        res.send(`Updated schedule with name: ${newSchedule.name}`);
                    }
                    else // if schedule is empty
                    {
                        res.status(400).send(`Unable to add zero courses, cannot update schedule with name: ${newSchedule.name}`)
                    } 
                }
                else // if anyone other than the creator is issuing the request
                {
                    res.status(400).send(`You are not the creator of the schedule with name: ${newSchedule.name}`);    
                }
            }
            else if (exIndex < 0) // if the schedule does not exist
            {
                res.status(404).send(`No schedule found with name: ${newSchedule.name}`);
            }
        
            setData(sdata, sfile); // send updated schedules array to JSON file    
        }
        else if (sanitizeInput(req.params.schedule, 100)) // only header is valid
        {
            res.status(400).send("Schedule cannot be updated due to inavlid input in request body");
        }
        else if (sanitizeInput(req.body, 1000)) // only body is valid
        {
            res.status(400).send("Schedule cannot be updated due to invalid input in request header");
        }
        else // neither header nor body are valid
        {
            res.status(400).send("Schedule cannot be updated due to invalid input in request header and request body");
        }
    })
    .delete((req, res) => {

        if (sanitizeInput(req.params.schedule, 100) && sanitizeInput(req.body, 110))
        {
            sdata = getData(j2data); // get up to date schedule data

            const exIndex = sdata.findIndex(s => s.name === req.params.schedule); // find index of existing schedule of same name
    
            if (exIndex >= 0) // if the schedule exists
            {
                if (req.body.creator == sdata[exIndex].creator) // if the one issuing the request is the creator
                {
                    sdata = sdata.filter(s => s.name != req.params.schedule); // retain all array elements except the one with the specified name
                    res.send(`Deleted schedule with name: ${req.params.schedule}`)
                }
                else // if anyone other than the creator is issuing the request
                {
                    res.status(400).send(`You are not the creator of the schedule with name: ${req.params.schedule}`);    
                }
            }
            else if (exIndex < 0) // if the schedule doesn't exist
            {
                res.status(404).send(`No schedule found with name: ${req.params.schedule}`);
            }
    
            setData(sdata, sfile); // send updated schedules array to JSON file
        }
        else
        {
            res.status(400).send("Invalid input!");
        }
    })

// add a review for a specific course POST 4e
srouter.post("/comments/:subject/:course/:email", (req, res) => {

    if (sanitizeInput(req.params.subject, 8) && sanitizeInput(req.params.course, 5) && sanitizeEmail(req.params.email))
    {
        rdata = getData(j4data); // get up to date comment data

        const newComment = req.body; // get info for updated comment
        newComment.subject_code = req.params.subject; // set subject of comment
        newComment.course_code = req.params.course; // set course of comment
        newComment.author = req.params.email; // set author of comment

        const exIndex = rdata.findIndex(r => (r.subject_code === newComment.subject_code) && (r.course_code === newComment.course_code) && (r.author === newComment.author))

        if (exIndex >= 0) // this exact comment already exists
        {
            res.status(400).send(`Comment for ${newComment.subject_code}: ${newComment.course_code} by ${newComment.author} already exists!`);
        }
        else if (exIndex < 0) // if this exact comment does not already exist
        {
            rdata.push(newComment); // add new comment to the array
            res.send(`Created comment for ${newComment.subject_code}: ${newComment.course_code} by ${newComment.author}`);
        }

        setData(rdata, rfile); // send updated comments array to JSON file
    }
    else if (sanitizeInput(req.params.subject, 8) && sanitizeInput(req.params.course, 5))
    {
        res.status(400).send("Invalid email address!");
    }
    else if (sanitizeEmail(req.params.email))
    {
        res.status(400).send("Invalid course!");
    }
    else
    {
        res.status(400).send("Invalid input!");
    }
});

// ADMIN ROUTES --------------------------------

// give admin status to a given user PUT 5b
arouter.put("/users", (req, res) => {

    if (sanitizeInput(req.params.body), 1000) 
    {
        udata = getData(j3data); // get user account data

        for (u in req.body.adds) // iterate through usernames in body
        {
            for (v in udata) // iterate through all saved users
            {
                if (req.body.adds[u].email === udata[v].email) // if the email in the body matches a saved user
                {
                    if (udata[v].permission_level != "admin")
                    {
                        udata[v].permission_level = "admin"; // set permission level to admin
                    }
                }
            }
        }
        
        res.send("Updated permission levels of given users to 'admin'");
        setData(udata, ufile); // update array of users in JSON file
    }  
    else
    {
        res.status(400).send("Invalid input in request body!");
    }
})


// hide and un-hide course reviews PUT 5c
arouter.put("/comments/:subject/:course/:email", (req, res) => {
    
    if (sanitizeInput(req.params.subject, 8) && sanitizeInput(req.params.course, 5) && sanitizeEmail(req.params.email))
    {
        rdata = getData(j4data); // get up to date comment data

        const exIndex = rdata.findIndex(r => (r.subject_code === req.params.subject) && (r.course_code === req.params.course) && (r.author === req.params.email))

        if (exIndex >= 0) // this exact comment already exists
        {
            if (rdata[exIndex].hidden)
            {
                rdata[exIndex].hidden = false; // set comment to be un-hidden
                res.send(`Comment for ${req.params.subject}: ${req.params.course} by ${req.params.email} has been un-hidden`);
            }
            else if (!rdata[exIndex].hidden)
            {
                rdata[exIndex].hidden = true; // set comment to be hidden
                res.send(`Comment for ${req.params.subject}: ${req.params.course} by ${req.params.email} has been hidden`);
            }
            
            setData(rdata, rfile); // update comments array and send to JSON file
        }
        else if (exIndex < 0) // if this exact comment does not already exist
        {
            res.status(400).send(`Comment for ${req.params.subject}: ${req.params.course} by ${req.params.email} does not exist!`);
        }

        setData(rdata, rfile); // send updated comments array to JSON file
    }
    else if (sanitizeInput(req.params.subject, 8) && sanitizeInput(req.params.course, 5))
    {
        res.status(400).send("Invalid email address!");
    }
    else if (sanitizeEmail(req.params.email))
    {
        res.status(400).send("Invalid course!");
    }
    else
    {
        res.status(400).send("Invalid input!");
    }
})

// activate and deactivate a given user PUT 5d
arouter.put("/users/:email", (req, res) => {

    if (sanitizeEmail(req.params.email)) 
    {
        udata = getData(j3data); // get user account data

        const exIndex = udata.findIndex(u => u.email === req.params.email); // find index of the exisitng user with the given email
    
        if (exIndex >= 0) // if the user exists
        {
            if (udata[exIndex].active) // if the user is currently active
            {
                udata[exIndex].active = false; // deactive user
                res.status(200).send(`User with email: ${req.params.email} has been deactivated`);
            }
            else if (!udata[exIndex].active) // if the user is currently deactivated
            {
                udata[exIndex].active = true; // activate user
                res.status(200).send(`User with email: ${req.params.email} has been activated`);
            }
        }
        else if (exIndex < 0) // if the user does not exist
        {
            res.status(400).send(`User with email: ${req.params.email} does not exist`);
        }

        setData(udata, ufile); // update user data array in JSON file
    }  
    else
    {
        res.status(400).send("Invalid input!");
    }

})


// BONUS ROUTES -------

// get all courses
arouter.get("/courses", (req, res) => {
    res.send(getData(j1data)); // get up to date user data and return it
});

// get all schedules
arouter.get("/schedules", (req, res) => {
    res.send(getData(j2data)); // get up to date user data and return it
});

// get all users
arouter.get("/users", (req, res) => {
    res.send(getData(j3data)); // get up to date user data and return it
});

// get all comments
arouter.get("/comments", (req, res) => {
    res.send(getData(j4data)); // get up to date comment data and return it
});

app.use("/api/open", orouter); // install router object path for open routes
app.use("/api/secure", srouter) // install router object path for secure routes
app.use("/api/admin", arouter); // install router object path for admin routes

// get PORT environment variable, or use 3000 if not available
const port = process.env.PORT || 3000;
app.listen(port, () => {console.log(`Listeneing on port ${port}`)}); // choose which port to listen on

// function to read from referenced JSON file before each usage of the sdata array
function getData(fileRef)
{
    return JSON.parse(JSON.stringify(fileRef)); // parse json object holding the schedules;
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

// function for alphanumeric input
function sanitizeInput(input, l) 
{ 
    // variable character limit
    if (String(input).includes("<") || String(input).includes(">") || String(input).includes("^") || String(input).includes(".") || String(input).includes("/") || String(input).includes("(") || String(input).includes(")") || String(input).includes("*") || String(input).includes("'") || String(input).includes("_") || String(input).includes("=") || String(input).includes("$") || String(input).includes("?") || String(input).includes("!") || String(input).includes("%") || String(input).includes("\"") || String(input).includes("`") || String(input).includes("+") || String(input).includes("|") || String(input).includes("&") || String(input).length > l || String(input).length < 1)
    {
        return false;
    }
    else
    {
        return true;
    }
};

// function for email addresses
function sanitizeEmail(add)
{
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(add)) // email must match this pattern
    {
        return true;
    }
    else
    {
        return false;
    }
}