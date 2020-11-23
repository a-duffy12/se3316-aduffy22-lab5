const express = require("express"); // get express 
const fs = require("fs"); // get fs module
const cors = require("cors"); // get cors module
const stringSimilarity = require("string-similarity"); // get string similarity module

const j1data = require("./data/Lab5-timetable-data.json"); // json data for courses
const j2data = require("./data/Lab5-schedule-data.json"); // json data for schedules
const j3data = require("./data/Lab5-user-data.json"); // json data for users
const j4data = require("./data/Lab5-courses-comments-data.json"); // json data for course comments

const cdata = JSON.parse(JSON.stringify(j1data)); // parse json object holding the courses
const sfile = "./data/Lab5-schedule-data.json"; // file holding json data for scehdules
const ufile = "./data/Lab5-user-data.json"; // file holding json data for users
const rfile = "./data/Lab5-courses-comments-data.json"; // file holding data for course comments

const app = express(); // create app constant
const orouter = express.Router(); // create router object for open routes
const srouter = express.Router(); // create router object for secure routes
const arouter = express.Router(); // create router object for admin routes


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
            res.send(udata[exIndex]);
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
})

// create an account POST
orouter.post("/users/:email", (req, res) => {

    if (sanitizeEmail(req.params.email) && sanitizeInput(req.body)) 
    {
        udata = getData(j3data); // get user account data

        const exIndex = udata.findIndex(u => u.email === req.params.email); // find index of the exisitng user with the given email
    
        if (exIndex >= 0) // if the user exists
        {
            res.status(400).send(`User with email: ${req.params.email} already exists!`);
        }
        else if (exIndex < 0) // if the user does not exist
        {
            let newUser = req.body; // empty object for a new user
            newUser.email = req.params.email; // set email field for new user
            udata.push(newUser); // add new user to array of users
            res.send(`Created user account with email: ${req.params.email}`);
        }

        setData(udata, ufile); // send updated user data array to JSON file
    }  
    else
    {
        res.status(400).send("Invalid input!");
    }
});

// expanded search results for the above GET 3b/3c (differentiated on front end)
orouter.get("/courses/:subject?/:courseNum?/:catalog?", (req, res) => {

    // return all information for each result

    if (!req.query.subject && !req.query.courseNum && !req.query.catalog) // none
    {
        let courses = []; // empty array to hold all courses

        for (c in cdata)
        {
            let obj = {};
            obj.course_code = cdata[c].catalog_nbr;
            obj.subject_code = cdata[c].subject;
            obj.class_name = cdata[c].className;

            for (i in cdata[c].course_info)
            {
                obj.class_section = cdata[c].course_info[i].class_section;
                obj.component = cdata[c].course_info[i].ssr_component;
                obj.class_number = cdata[c].course_info[i].class_nbr;
                obj.enrollment = cdata[c].course_info[i].enrl_stat;
                obj.description = cdata[c].course_info[i].descr;
                obj.long_description = cdata[c].course_info[i].descrlong;
                obj.campus = cdata[c].course_info[i].campus;
                obj.classroom = cdata[c].course_info[i].facility_ID;
                obj.profs = cdata[c].course_info[i].instructors;
                obj.times = []; // empty array for days the class runs

                for (d in cdata[c].course_info[i].days)
                {
                    let obj2 = {};
                    obj2.day = cdata[c].course_info[i].days[d];
                    obj2.start = cdata[c].course_info[i].start_time;
                    obj2.end = cdata[c].course_info[i].end_time;
                    obj.times.push(obj2); // add days data object to course
                }
            }
            
            obj.content = cdata[c].catalog_description;

            courses.push(obj); // add course data object to array of courses
        }
        
        res.send(courses);
    }
    else if (req.query.subject && !req.query.courseNum && !req.query.catalog) // only subject
    {
        if (sanitizeInput(req.query.subject, 8))
        {
            let courses = []; // empty array to hold all courses

            for (c in cdata)
            {
                if (req.query.subject === cdata[c].subject)
                {
                    let obj = {};
                    obj.course_code = cdata[c].catalog_nbr;
                    obj.subject_code = cdata[c].subject;
                    obj.class_name = cdata[c].className;

                    for (i in cdata[c].course_info)
                    {
                        obj.class_section = cdata[c].course_info[i].class_section;
                        obj.component = cdata[c].course_info[i].ssr_component;
                        obj.class_number = cdata[c].course_info[i].class_nbr;
                        obj.enrollment = cdata[c].course_info[i].enrl_stat;
                        obj.description = cdata[c].course_info[i].descr;
                        obj.long_description = cdata[c].course_info[i].descrlong;
                        obj.campus = cdata[c].course_info[i].campus;
                        obj.classroom = cdata[c].course_info[i].facility_ID;
                        obj.profs = cdata[c].course_info[i].instructors;
                        obj.times = []; // empty array for days the class runs

                        for (d in cdata[c].course_info[i].days)
                        {
                            let obj2 = {};
                            obj2.day = cdata[c].course_info[i].days[d];
                            obj2.start = cdata[c].course_info[i].start_time;
                            obj2.end = cdata[c].course_info[i].end_time;
                            obj.times.push(obj2); // add days data object to course
                        }
                    }
                    
                    obj.content = cdata[c].catalog_description;

                    courses.push(obj); // add course data object to array of courses
                }
            }
            
            if (courses.length > 0)
            {
                res.send(courses);
            }
            else 
            {
                res.send(`No courses found with subject: ${req.query.subject}`);
            }
        }
        else
        {
            res.status(400).send("Invalid input!");
        }
    }
    else if (!req.query.subject && req.query.courseNum && !req.query.catalog) // only course number
    {
        if (sanitizeInput(req.query.courseNum, 4))
        {
            let courses = []; // empty array to hold all courses

            for (c in cdata)
            {
                if (req.query.courseNum === String(cdata[c].catalog_nbr).substring(0, 4))
                {
                    let obj = {};
                    obj.course_code = cdata[c].catalog_nbr;
                    obj.subject_code = cdata[c].subject;
                    obj.class_name = cdata[c].className;

                    for (i in cdata[c].course_info)
                    {
                        obj.class_section = cdata[c].course_info[i].class_section;
                        obj.component = cdata[c].course_info[i].ssr_component;
                        obj.class_number = cdata[c].course_info[i].class_nbr;
                        obj.enrollment = cdata[c].course_info[i].enrl_stat;
                        obj.description = cdata[c].course_info[i].descr;
                        obj.long_description = cdata[c].course_info[i].descrlong;
                        obj.campus = cdata[c].course_info[i].campus;
                        obj.classroom = cdata[c].course_info[i].facility_ID;
                        obj.profs = cdata[c].course_info[i].instructors;
                        obj.times = []; // empty array for days the class runs

                        for (d in cdata[c].course_info[i].days)
                        {
                            let obj2 = {};
                            obj2.day = cdata[c].course_info[i].days[d];
                            obj2.start = cdata[c].course_info[i].start_time;
                            obj2.end = cdata[c].course_info[i].end_time;
                            obj.times.push(obj2); // add days data object to course
                        }
                    }
                    
                    obj.content = cdata[c].catalog_description;

                    courses.push(obj); // add course data object to array of courses
                }
            }
            
            if (courses.length > 0)
            {
                res.send(courses);
            }
            else 
            {
                res.send(`No courses found with course number: ${req.query.courseNum}`);
            }
        }
        else
        {
            res.status(400).send("Invalid input!");
        }
    }
    else if (!req.query.subject && !req.query.courseNum && req.query.catalog) // only catalog number
    {
        if (sanitizeInput(req.query.catalog, 5))
        {
            let courses = []; // empty array to hold all courses

            for (c in cdata)
            {
                if (req.query.catalog === cdata[c].catalog_nbr)
                {
                    let obj = {};
                    obj.course_code = cdata[c].catalog_nbr;
                    obj.subject_code = cdata[c].subject;
                    obj.class_name = cdata[c].className;

                    for (i in cdata[c].course_info)
                    {
                        obj.class_section = cdata[c].course_info[i].class_section;
                        obj.component = cdata[c].course_info[i].ssr_component;
                        obj.class_number = cdata[c].course_info[i].class_nbr;
                        obj.enrollment = cdata[c].course_info[i].enrl_stat;
                        obj.description = cdata[c].course_info[i].descr;
                        obj.long_description = cdata[c].course_info[i].descrlong;
                        obj.campus = cdata[c].course_info[i].campus;
                        obj.classroom = cdata[c].course_info[i].facility_ID;
                        obj.profs = cdata[c].course_info[i].instructors;
                        obj.times = []; // empty array for days the class runs

                        for (d in cdata[c].course_info[i].days)
                        {
                            let obj2 = {};
                            obj2.day = cdata[c].course_info[i].days[d];
                            obj2.start = cdata[c].course_info[i].start_time;
                            obj2.end = cdata[c].course_info[i].end_time;
                            obj.times.push(obj2); // add days data object to course
                        }
                    }
                    
                    obj.content = cdata[c].catalog_description;

                    courses.push(obj); // add course data object to array of courses
                }
            }
            
            if (courses.length > 0)
            {
                res.send(courses);
            }
            else 
            {
                res.send(`No courses found with course code: ${req.query.catalog}`);
            }
        }
        else
        {
            res.status(400).send("Invalid input!");
        }
    }
    else if (req.query.subject && req.query.courseNum && !req.query.catalog) // subject and course number
    {
        if (sanitizeInput(req.query.subject, 8) && sanitizeInput(req.query.courseNum, 4))
        {
            let courses = []; // empty array to hold all courses

            for (c in cdata)
            {
                if (req.query.subject === cdata[c].subject && req.query.courseNum === String(cdata[c].catalog_nbr).substring(0, 4))
                {
                    let obj = {};
                    obj.course_code = cdata[c].catalog_nbr;
                    obj.subject_code = cdata[c].subject;
                    obj.class_name = cdata[c].className;

                    for (i in cdata[c].course_info)
                    {
                        obj.class_section = cdata[c].course_info[i].class_section;
                        obj.component = cdata[c].course_info[i].ssr_component;
                        obj.class_number = cdata[c].course_info[i].class_nbr;
                        obj.enrollment = cdata[c].course_info[i].enrl_stat;
                        obj.description = cdata[c].course_info[i].descr;
                        obj.long_description = cdata[c].course_info[i].descrlong;
                        obj.campus = cdata[c].course_info[i].campus;
                        obj.classroom = cdata[c].course_info[i].facility_ID;
                        obj.profs = cdata[c].course_info[i].instructors;
                        obj.times = []; // empty array for days the class runs

                        for (d in cdata[c].course_info[i].days)
                        {
                            let obj2 = {};
                            obj2.day = cdata[c].course_info[i].days[d];
                            obj2.start = cdata[c].course_info[i].start_time;
                            obj2.end = cdata[c].course_info[i].end_time;
                            obj.times.push(obj2); // add days data object to course
                        }
                    }
                    
                    obj.content = cdata[c].catalog_description;

                    courses.push(obj); // add course data object to array of courses
                }
            }
            
            if (courses.length > 0)
            {
                res.send(courses);
            }
            else 
            {
                res.send(`No courses found with subject: ${req.query.subject} and course number: ${req.query.courseNum}`);
            }
        }
        else
        {
            res.status(400).send("Invalid input!");
        }
    }
    else if (req.query.subject && !req.query.courseNum && req.query.catalog) // subject and catalog number
    {
        if (sanitizeInput(req.query.subject, 8) && sanitizeInput(req.query.catalog, 5))
        {
            let courses = []; // empty array to hold all courses

            for (c in cdata)
            {
                if (req.query.subject === cdata[c].subject && req.query.catalog === cdata[c].catalog_nbr)
                {
                    let obj = {};
                    obj.course_code = cdata[c].catalog_nbr;
                    obj.subject_code = cdata[c].subject;
                    obj.class_name = cdata[c].className;

                    for (i in cdata[c].course_info)
                    {
                        obj.class_section = cdata[c].course_info[i].class_section;
                        obj.component = cdata[c].course_info[i].ssr_component;
                        obj.class_number = cdata[c].course_info[i].class_nbr;
                        obj.enrollment = cdata[c].course_info[i].enrl_stat;
                        obj.description = cdata[c].course_info[i].descr;
                        obj.long_description = cdata[c].course_info[i].descrlong;
                        obj.campus = cdata[c].course_info[i].campus;
                        obj.classroom = cdata[c].course_info[i].facility_ID;
                        obj.profs = cdata[c].course_info[i].instructors;
                        obj.times = []; // empty array for days the class runs

                        for (d in cdata[c].course_info[i].days)
                        {
                            let obj2 = {};
                            obj2.day = cdata[c].course_info[i].days[d];
                            obj2.start = cdata[c].course_info[i].start_time;
                            obj2.end = cdata[c].course_info[i].end_time;
                            obj.times.push(obj2); // add days data object to course
                        }
                    }
                    
                    obj.content = cdata[c].catalog_description;

                    courses.push(obj); // add course data object to array of courses
                }
            }
            
            if (courses.length > 0)
            {
                res.send(courses);
            }
            else 
            {
                res.send(`No courses found with subject: ${req.query.subject} and course code: ${req.query.catalog}`);
            }
        }
        else
        {
            res.status(400).send("Invalid input!");
        }
    }
    else if (!req.query.subject && req.query.courseNum && req.query.catalog) // course number and catalog number
    {
        if (sanitizeInput(req.query.courseNum, 4) && sanitizeInput(req.query.catalog, 5))
        {
            let courses = []; // empty array to hold all courses

            for (c in cdata)
            {
                if (req.query.courseNum === String(cdata[c].catalog_nbr).substring(0,4) && req.query.catalog === cdata[c].catalog_nbr)
                {
                    let obj = {};
                    obj.course_code = cdata[c].catalog_nbr;
                    obj.subject_code = cdata[c].subject;
                    obj.class_name = cdata[c].className;

                    for (i in cdata[c].course_info)
                    {
                        obj.class_section = cdata[c].course_info[i].class_section;
                        obj.component = cdata[c].course_info[i].ssr_component;
                        obj.class_number = cdata[c].course_info[i].class_nbr;
                        obj.enrollment = cdata[c].course_info[i].enrl_stat;
                        obj.description = cdata[c].course_info[i].descr;
                        obj.long_description = cdata[c].course_info[i].descrlong;
                        obj.campus = cdata[c].course_info[i].campus;
                        obj.classroom = cdata[c].course_info[i].facility_ID;
                        obj.profs = cdata[c].course_info[i].instructors;
                        obj.times = []; // empty array for days the class runs

                        for (d in cdata[c].course_info[i].days)
                        {
                            let obj2 = {};
                            obj2.day = cdata[c].course_info[i].days[d];
                            obj2.start = cdata[c].course_info[i].start_time;
                            obj2.end = cdata[c].course_info[i].end_time;
                            obj.times.push(obj2); // add days data object to course
                        }
                    }
                    
                    obj.content = cdata[c].catalog_description;

                    courses.push(obj); // add course data object to array of courses
                }
            }
            
            if (courses.length > 0)
            {
                res.send(courses);
            }
            else 
            {
                res.send(`No courses found with course number: ${req.query.courseNum} and course code: ${req.query.catalog}`);
            }
        }
        else
        {
            res.status(400).send("Invalid input!");
        }
    }
    else if (req.query.subject && req.query.courseNum && req.query.catalog) // all three
    {
        if (sanitizeInput(req.query.subject, 8) && sanitizeInput(req.query.courseNum, 4) && sanitizeInput(req.query.catalog, 5))
        {
            let courses = []; // empty array to hold all courses

            for (c in cdata)
            {
                if (req.query.subject === cdata[c].subject && req.query.courseNum === String(cdata[c].catalog_nbr).substring(0,4) && req.query.catalog === cdata[c].catalog_nbr)
                {
                    let obj = {};
                    obj.course_code = cdata[c].catalog_nbr;
                    obj.subject_code = cdata[c].subject;
                    obj.class_name = cdata[c].className;

                    for (i in cdata[c].course_info)
                    {
                        obj.class_section = cdata[c].course_info[i].class_section;
                        obj.component = cdata[c].course_info[i].ssr_component;
                        obj.class_number = cdata[c].course_info[i].class_nbr;
                        obj.enrollment = cdata[c].course_info[i].enrl_stat;
                        obj.description = cdata[c].course_info[i].descr;
                        obj.long_description = cdata[c].course_info[i].descrlong;
                        obj.campus = cdata[c].course_info[i].campus;
                        obj.classroom = cdata[c].course_info[i].facility_ID;
                        obj.profs = cdata[c].course_info[i].instructors;
                        obj.times = []; // empty array for days the class runs

                        for (d in cdata[c].course_info[i].days)
                        {
                            let obj2 = {};
                            obj2.day = cdata[c].course_info[i].days[d];
                            obj2.start = cdata[c].course_info[i].start_time;
                            obj2.end = cdata[c].course_info[i].end_time;
                            obj.times.push(obj2); // add days data object to course
                        }
                    }
                    
                    obj.content = cdata[c].catalog_description;

                    courses.push(obj); // add course data object to array of courses
                }
            }
            
            if (courses.length > 0)
            {
                res.send(courses);
            }
            else 
            {
                res.send(`No courses found with subject: ${req.query.subject}, course number: ${req.query.courseNum} and course code: ${req.query.catalog}`);
            }
        }
        else
        {
            res.status(400).send("Invalid input!");
        }
    }
    else
    {
        res.status(404).send("Invalid input!");
    }
});

// search based on a keyword of 5+ chars GET 3d/3e
orouter.get("/key/:keyword", (req, res) => {
 
    // match for catalog_nbg and/or className using substring and/or soft-matched

    if (sanitizeInput(req.params.keyword, 100) && req.params.keyword.length >= 4)
    {
        let courses = []; // empty array to hold all courses
        const key = new RegExp(req.params.keyword, 'g');

        for (c in cdata)
        {
            if (String(cdata[c].catalog_nbr).match(key) || String(cdata[c].className).match(key) || stringSimilarity.compareTwoStrings(req.params.keyword, String(cdata[c].catalog_nbr)) > 0.8 || stringSimilarity.compareTwoStrings(req.params.keyword, String(cdata[c].className)) > 0.5)
            {
                let obj = {};
                obj.course_code = cdata[c].catalog_nbr;
                obj.subject_code = cdata[c].subject;
                obj.class_name = cdata[c].className;

                for (i in cdata[c].course_info)
                {
                    obj.class_section = cdata[c].course_info[i].class_section;
                    obj.component = cdata[c].course_info[i].ssr_component;
                    obj.class_number = cdata[c].course_info[i].class_nbr;
                    obj.enrollment = cdata[c].course_info[i].enrl_stat;
                    obj.description = cdata[c].course_info[i].descr;
                    obj.long_description = cdata[c].course_info[i].descrlong;
                    obj.campus = cdata[c].course_info[i].campus;
                    obj.classroom = cdata[c].course_info[i].facility_ID;
                    obj.profs = cdata[c].course_info[i].instructors;
                    obj.times = []; // empty array for days the class runs

                    for (d in cdata[c].course_info[i].days)
                    {
                        let obj2 = {};
                        obj2.day = cdata[c].course_info[i].days[d];
                        obj2.start = cdata[c].course_info[i].start_time;
                        obj2.end = cdata[c].course_info[i].end_time;
                        obj.times.push(obj2); // add days data object to course
                    }
                }
                
                obj.content = cdata[c].catalog_description;

                courses.push(obj); // add course data object to array of courses
            }
        }
        
        if (courses.length > 0)
        {
            res.send(courses);
        }
        else 
        {
            res.send(`No courses found matching keyword: ${req.params.keyword}`);
        }
    }
    else
    {
        res.status(400).send("Invalid input!");
    }    
}); 

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
                obj.creator_name = sdata[s].creator_name; // set name of creator
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
            obj.creator_name = sdata[exIndex].creator_name; // set name of creator
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

        if ((exIndex >= 0) && (sdata[exIndex].visibility == "public")) // if the schedule exists and is public
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
        else // if the schedule doesn't exist or is not public
        {
            res.status(404).send(`No public schedule found with name: ${req.params.schedule}`);
        }
    }
    else
    {
        res.status(400).send("Invalid input!");    
    }
});

// display review for a given course
orouter.get("/comments/:subject/:course", (req, res) => {

    if (sanitizeInput(req.params.subject, 8) && sanitizeInput(req.params.course, 5))
    {
        rdata = getData(j4data); // get up to date comment data

        const exIndex = rdata.findIndex(r => (r.subject_code === req.params.subject) && (r.course_code === req.params.course))

        if (exIndex >= 0) // this exact comment already exists
        {
            if (rdata[exIndex].hidden) // comment is hidden
            {
                res.status(400).send(`Comment for ${req.params.subject}: ${req.params.course} is hidden!`);
            }
            else if (!rdata[exIndex].hidden) // comment is not hidden
            {
                res.send(rdata[exIndex]); // send corresponding review
            }
        }
        else if (exIndex < 0) // if this exact comment does not already exist
        {
            res.status(400).send(`Comment for ${req.params.subject}: ${req.params.course} does not exist!`);
        }
    }
    else
    {
        res.status(400).send("Invalid input!");
    }
});


// SECURE ROUTES --------------------------------

// create a new schedule POST 4a
// update an existing schedule PUT 4c
// delete an exisitng schedule DELETE 4d
// get the timetable for the schedule GET 4b
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
            
            if (tally < 20) // check that user has not already used all of their schedules
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
    .get((req, res) => {
        if (sanitizeInput(req.params.schedule, 100))
        {
            sdata = getData(j2data); // get up to date schedule data

            const exIndex = sdata.findIndex(s => s.name === req.params.schedule); // find index of existing schedule of same name

            if ((exIndex >= 0) && (req.body.creator == sdata[exIndex].creator)) // if the schedule exists and the current user is its creator
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
            else // if the schedule doesn't exist
            {
                res.status(404).send(`No schedule made by you found with name: ${req.params.schedule}`);
            }
        }
        else
        {
            res.status(400).send("Invalid input!");    
        }
    })

// get all schedules for a certain user
srouter.get("/schedules", (req, res) => {

    if (sanitizeInput(req.body))
    {
        sdata = getData(j2data); // get up to date schedule data

        let schedules = []; // empty array to house returned schedules
        
        for (s in sdata)
        {
            if (req.body.creator === sdata[s].creator)
            {
                schedules.push(sdata[s]); // add schedule to array
            }
        }

        if (schedules.length > 0)
        {
            res.send(schedules); // return schedules by the given user
        }
        else
        {
            res.status(404).send(`No schedules found with creator: ${req.body.creator}`);
        }
    }
    else
    {
        res.status(400).send("Invalid input!");
    }
});

// add a review for a specific course POST 4e
srouter.post("/comments/:subject/:course", (req, res) => {

    if (sanitizeInput(req.params.subject, 8) && sanitizeInput(req.params.course, 5))
    {
        rdata = getData(j4data); // get up to date comment data

        const newComment = req.body; // get info for updated comment
        newComment.subject_code = req.params.subject; // set subject of comment
        newComment.course_code = req.params.course; // set course of comment

        const exIndex = rdata.findIndex(r => (r.subject_code === newComment.subject_code) && (r.course_code === newComment.course_code) && (r.author === newComment.creator))

        if (exIndex >= 0) // this exact comment already exists
        {
            res.status(400).send(`Comment for ${newComment.subject_code}: ${newComment.course_code} by ${newComment.creator} already exists!`);
        }
        else if (exIndex < 0) // if this exact comment does not already exist
        {
            rdata.push(newComment); // add new comment to the array
            res.send(`Created comment for ${newComment.subject_code}: ${newComment.course_code} by ${newComment.creator}`);
        }

        setData(rdata, rfile); // send updated comments array to JSON file
    }
    else if (sanitizeInput(req.params.subject, 8))
    {
        res.status(400).send("Invalid course!");
    }
    else if (sanitizeInput(req.params.course, 5))
    {
        res.status(400).send("Invalid subject!");
    }
    else
    {
        res.status(400).send("Invalid input!");
    }
});

// change account password PUT
srouter.put("/users/:email", (req, res) => {
    
    // send user object to file
    if (sanitizeEmail(req.params.email) && sanitizeInput(req.body)) 
    {
        udata = getData(j3data); // get user account data

        const exIndex = udata.findIndex(u => u.email === req.params.email); // find index of the exisitng user with the given email
    
        if (exIndex >= 0) // if the user exists
        {
            if (udata[exIndex].password === req.body.old_password)
            {
                if (udata[exIndex].password === req.body.password)
                {
                    res.status(400).send(`Cannot change password to your existing password for user with email: ${req.params.email}!`);
                }
                else
                {
                    udata[exIndex].password = req.body.password; // set password to the new password
                    res.send(`Updated password for user with email: ${req.params.email}`);
                }
            }
            else
            {
                res.status(400).send(`Incorrect password for user with email: ${req.params.email}!`);
            }
        }
        else if (exIndex < 0) // if the user does not exist
        {
            res.status(400).send(`User with email: ${req.params.email} does not exist!`);
        }

        setData(udata, ufile); // send updated user data array to JSON file
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
                    if (udata[v].permission_level != "admin" && udata[v].verified)
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

        const exIndex = rdata.findIndex(r => (r.subject_code === req.params.subject) && (r.course_code === req.params.course) && (r.creator === req.params.email))

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
app.listen(port, () => {console.log(`Listening on port ${port}`)}); // choose which port to listen on

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