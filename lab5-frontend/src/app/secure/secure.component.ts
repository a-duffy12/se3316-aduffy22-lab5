import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Validator } from '../validator.service';
import { interval, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'secure',
  templateUrl: './secure.component.html',
  styleUrls: ['./secure.component.css']
})
export class SecureComponent implements OnInit {

  // member variables for input fields
  name: string = "";
  visibility: string = "";
  vis: boolean = false;
  description: string = "";
  count: number = 0;
  build: boolean = false;
  clear: boolean = true;
  subjectCodes: string[] = Array (15);
  courseCodes: string[] = Array (15);

  // member variables to hold output
  cdata: any;
  scheData: any;
  makeError: string = "";

  // fields to track whether a user is logged in or not
  subscription: Subscription;
  activeUser: string = "";

  constructor(private http: HttpClient, private val: Validator)
  {
    // every second, update the active user variable
    this.subscription = interval(1000).subscribe(() => {
      this.activeUser = this.val.getActiveUser();
    });

    // get all courses to check for course validity
    this.http.get("http://localhost:3000/api/admin/courses").subscribe((data:any) => {
      this.cdata = data;
    })
  }

  ngOnInit(): void {
  }

  // method to build the subject + catalog pairs in a schedule
  buildSchedule()
  {
    if ((this.name != "") && this.val.validate(this.name, 100) && this.val.validate(this.description, 200) && this.val.validateNum(this.count, 0, 15))
    {
      this.build = true;
      this.makeError = "";
    }
    else if (this.val.validate(this.description, 200) && this.val.validateNum(this.count, 0, 15))
    {
      this.makeError = "Invalid input in the name field!";
      console.log("Invalid input!");
    }
    else if ((this.name != "") && this.val.validate(this.name, 100) && this.val.validate(this.description, 200))
    {
      this.makeError = "Invalid input in the number of courses field!";
      console.log("Invalid input!");
    }
    else if ((this.name != "") && this.val.validate(this.name, 100) && this.val.validateNum(this.count, 0, 15))
    {
      this.makeError = "Invalid input in the description field!";
      console.log("Invalid input!");
    }
    else if ((this.name != "") && this.val.validate(this.name, 100))
    {
      this.makeError = "Invalid input in the description and number of courses fields!";
      console.log("Invalid input!");
    }
    else if (this.val.validate(this.description, 200))
    {
      this.makeError = "Invalid input in the name and number of courses fields!";
      console.log("Invalid input!");
    }
    else if (this.val.validateNum(this.count, 0, 15))
    {
      this.makeError = "Invalid input in the name and description fields!";
      console.log("Invalid input!");
    }
    else
    {
      this.makeError = "Invalid input in the name, description, and number of courses fields!";
      console.log("Invalid input!");
    }
  }

  // method to create the schedule with the entered data
  createSchedule()
  {
    this.reset(); // reset all member variables

    if (this.cdata && (this.name != "") && this.val.validate(this.name, 100) && this.val.validate(this.description, 200) && this.val.validateNum(this.count, 0, 15))
    {
      // back end request to get username
      this.http.get(`http://localhost:3000/api/open/users/${this.activeUser}`).subscribe((data:any) => {

        if (this.vis) // user wants their schedule to be visible
        {
          this.visibility = "public";
        }
        else if (!this.vis) // user wants their schedule to not be visible
        {
          this.visibility = "private";
        }

        // create empty schedule object
        let obj: Sched = {
          classes: new Array(this.count),
          creator: this.activeUser,
          creator_name: data.name,
          visibility: this.visibility,
          description: this.description,
          date_modified: (new Date()).toISOString(),
          infringing: false
        }

        let tally = 0; // keep track of legal courses

        for (let i = 0; i < this.count; i++) // for the number of courses in the schedule
        {
          if (this.val.validate(this.subjectCodes[i], 8) && this.val.validate(this.courseCodes[i], 5)) // check that course values are valid
          {
            if (this.courseCodes[i].length == 4) // check with course number
            {
              for (let c in this.cdata) // for all courses
              {
                if (this.subjectCodes[i].toUpperCase() == this.cdata[c].subject && this.courseCodes[i].toUpperCase() == String(this.cdata[c].catalog_nbr).substring(0, 4)) // if the course is valid
                {
                  let temp: Sclass = { // create empty subject code + course code pair
                    subject_code: this.subjectCodes[i].toUpperCase(),
                    course_code: this.courseCodes[i].toUpperCase()
                  };

                  tally++;
                  obj.classes[i] = temp; // add this subject code + course code pair to the list of classes
                  break;
                }
              }
            }
            else if (this.courseCodes[i].length == 5) // check with catalog number
            {
              for (let c in this.cdata) // for all courses
              {
                if (this.subjectCodes[i].toUpperCase() == this.cdata[c].subject && this.courseCodes[i].toUpperCase() == this.cdata[c].catalog_nbr) // if the course is valid
                {
                  let temp: Sclass = { // create empty subject code + course code pair
                    subject_code: this.subjectCodes[i].toUpperCase(),
                    course_code: this.courseCodes[i].toUpperCase()
                  };

                  tally++;
                  obj.classes[i] = temp; // add this subject code + course code pair to the list of classes
                  break;
                }
              }
            }
            else
            {
              this.clear = false; // do not allow this course to be added
            }
          }
          else
          {
            this.makeError = `Invalid input for schedule entry: ${this.subjectCodes[i].toUpperCase()}: ${this.courseCodes[i].toUpperCase()}!`;
            console.log("Invalid input!");
            this.clear = false;
          }
        }

        if (tally != this.count) // different number of correct courses than added courses
        {
          this.clear = false; // do not allow this schedule to be created
        }

        if (this.clear == true) // no illegal courses were found
        {
          // send request with schedule "obj" in the body and "name" in the URL
          this.http.post(`http://localhost:3000/api/secure/schedules/${this.name}`, JSON.stringify(obj), reqHeader).subscribe((data: any) => {
            this.scheData = data; // get response as string
          })
          console.log(`Created schedule with name: ${this.name}`);
        }
        else
        {
          console.log(`Unable to create schedule with name: ${this.name} due to illegal courses`);
        }
      })
    }
    else if (this.val.validate(this.description, 200) && this.val.validateNum(this.count, 0, 15))
    {
      this.makeError = "Invalid input in the name field!";
      console.log("Invalid input!");
    }
    else if ((this.name != "") && this.val.validate(this.name, 100) && this.val.validate(this.description, 200))
    {
      this.makeError = "Invalid input in the number of courses field!";
      console.log("Invalid input!");
    }
    else if ((this.name != "") && this.val.validate(this.name, 100) && this.val.validateNum(this.count, 0, 15))
    {
      this.makeError = "Invalid input in the description field!";
      console.log("Invalid input!");
    }
    else if ((this.name != "") && this.val.validate(this.name, 100))
    {
      this.makeError = "Invalid input in the description and number of courses fields!";
      console.log("Invalid input!");
    }
    else if (this.val.validate(this.description, 200))
    {
      this.makeError = "Invalid input in the name and number of courses fields!";
      console.log("Invalid input!");
    }
    else if (this.val.validateNum(this.count, 0, 15))
    {
      this.makeError = "Invalid input in the name and description fields!";
      console.log("Invalid input!");
    }
    else
    {
      this.makeError = "Invalid input in the name, description, and number of courses fields!";
      console.log("Invalid input!");
    }
  }

  // method to update the schedule with the entered data
  updateSchedule()
  {
    this.reset(); // reset all member variables

    if (this.cdata && (this.name != "") && this.val.validate(this.name, 100) && this.val.validate(this.description, 200) && this.val.validateNum(this.count, 0, 15))
    {
      // back end request to get username
      this.http.get(`http://localhost:3000/api/open/users/${this.activeUser}`).subscribe((data:any) => {

        if (this.vis) // user wants their schedule to be visible
        {
          this.visibility = "public";
        }
        else if (!this.vis) // user wants their schedule to not be visible
        {
          this.visibility = "private";
        }

        // create empty schedule object
        let obj: Sched = {
          classes: new Array(this.count),
          creator: this.activeUser,
          creator_name: data.name,
          visibility: this.visibility,
          description: this.description,
          date_modified: (new Date()).toISOString(),
          infringing: false
        }

        let tally = 0; // keep track of legal courses

        for (let i = 0; i < this.count; i++) // for the number of courses in the schedule
        {
          if (this.val.validate(this.subjectCodes[i], 8) && this.val.validate(this.courseCodes[i], 5)) // check that course values are valid
          {
            if (this.courseCodes[i].length == 4) // check with course number
            {
              for (let c in this.cdata) // for all courses
              {
                if (this.subjectCodes[i].toUpperCase() == this.cdata[c].subject && this.courseCodes[i].toUpperCase() == String(this.cdata[c].catalog_nbr).substring(0, 4)) // if the course is valid
                {
                  let temp: Sclass = { // create empty subject code + course code pair
                    subject_code: this.subjectCodes[i].toUpperCase(),
                    course_code: this.courseCodes[i].toUpperCase()
                  };

                  tally++;
                  obj.classes[i] = temp; // add this subject code + course code pair to the list of classes
                  break;
                }
              }
            }
            else if (this.courseCodes[i].length == 5) // check with catalog number
            {
              for (let c in this.cdata) // for all courses
              {
                if (this.subjectCodes[i].toUpperCase() == this.cdata[c].subject && this.courseCodes[i].toUpperCase() == this.cdata[c].catalog_nbr) // if the course is valid
                {
                  let temp: Sclass = { // create empty subject code + course code pair
                    subject_code: this.subjectCodes[i].toUpperCase(),
                    course_code: this.courseCodes[i].toUpperCase()
                  };

                  tally++;
                  obj.classes[i] = temp; // add this subject code + course code pair to the list of classes
                  break;
                }
              }
            }
            else
            {
              this.clear = false; // do not allow this course to be added
            }
          }
          else
          {
            this.makeError = `Invalid input for schedule entry: ${this.subjectCodes[i].toUpperCase()}: ${this.courseCodes[i].toUpperCase()}!`;
            console.log("Invalid input!");
            this.clear = false;
          }
        }

        if (tally != this.count) // different number of correct courses than added courses
        {
          this.clear = false; // do not allow this schedule to be created
        }

        if (this.clear == true) // no illegal courses were found
        {
          // send request with schedule "obj" in the body and "name" in the URL
          this.http.put(`http://localhost:3000/api/secure/schedules/${this.name}`, JSON.stringify(obj), reqHeader).subscribe((data: any) => {
            this.scheData = data; // get response as string
          })
          console.log(`Updated schedule with name: ${this.name}`);
        }
        else
        {
          console.log(`Unable to update schedule with name: ${this.name} due to illegal courses`);
        }
      })
    }
    else if (this.val.validate(this.description, 200) && this.val.validateNum(this.count, 0, 15))
    {
      this.makeError = "Invalid input in the name field!";
      console.log("Invalid input!");
    }
    else if ((this.name != "") && this.val.validate(this.name, 100) && this.val.validate(this.description, 200))
    {
      this.makeError = "Invalid input in the number of courses field!";
      console.log("Invalid input!");
    }
    else if ((this.name != "") && this.val.validate(this.name, 100) && this.val.validateNum(this.count, 0, 15))
    {
      this.makeError = "Invalid input in the description field!";
      console.log("Invalid input!");
    }
    else if ((this.name != "") && this.val.validate(this.name, 100))
    {
      this.makeError = "Invalid input in the description and number of courses fields!";
      console.log("Invalid input!");
    }
    else if (this.val.validate(this.description, 200))
    {
      this.makeError = "Invalid input in the name and number of courses fields!";
      console.log("Invalid input!");
    }
    else if (this.val.validateNum(this.count, 0, 15))
    {
      this.makeError = "Invalid input in the name and description fields!";
      console.log("Invalid input!");
    }
    else
    {
      this.makeError = "Invalid input in the name, description, and number of courses fields!";
      console.log("Invalid input!");
    }
  }

  // method to reset member fields
  reset()
  {
    this.build = false;
    this.clear = true;
    this.scheData = undefined;
    this.makeError = "";
  }

}

// interface for classes
interface Sclass {
  subject_code: string,
  course_code: string;
};

// interface of schedule data
interface Sched {
  classes: Sclass[],
  creator: string,
  creator_name: string,
  visibility: string,
  description: string,
  date_modified: string,
  infringing: boolean;
};

// build options for the http requests
const reqHeader = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Access-Control-Allow-Headers": "Content-Type"
  })
}
