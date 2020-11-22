import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Validator } from '../validator.service';

@Component({
  selector: 'open',
  templateUrl: './open.component.html',
  styleUrls: ['./open.component.css']
})
export class OpenComponent implements OnInit {

  // member fields for state data
  subject: string = "";
  numb: string = "";
  catalog: string = "";
  keyword: string = "";
  name: string = "";

  // member fields to hold back end data and errors
  courseData: any; // data from course search and keyword search
  allRevData: any; // data for all course reviews
  revData = new Array<any>(); // data for course reviews
  expand: boolean = false;
  scheData: any; // for public schedules
  esData = new Array<any>(); // for expanded data of schedules
  list: boolean = false;
  timeData: any; // timetable data for schedules
  courseError: string = "";
  scheduleError: string = "";
  timeError: string = "";

  constructor(private http: HttpClient, private val: Validator) { }

  ngOnInit(): void {
  }

  // method to display courses based on the input fields
  displayCourses()
  {
    this.reset(); // reset all back end result variables

    // send all input to upper case
    this.subject = this.subject.toUpperCase();
    this.numb = this.numb.toUpperCase();
    this.catalog = this.catalog.toUpperCase();

    if ((this.subject == "") && (this.numb == "") && (this.catalog == ""))
    {
      // request to back end
      this.http.get(`http://localhost:3000/api/open/courses`).subscribe((data:any) => {
        this.courseData = data; // get back end data object
      })
      console.log("Searched all courses");
    }
    else if ((this.subject != "") && (this.numb == "") && (this.catalog == "") && this.val.validate(this.subject, 8))
    {
      // request to back end
      this.http.get(`http://localhost:3000/api/open/courses/?subject=${this.subject}`).subscribe((data:any) => {
        this.courseData = data; // get back end data object
      })
      console.log(`Searched all courses with subject: ${this.subject}`);
    }
    else if ((this.subject == "") && (this.numb != "") && (this.catalog == "") && this.val.validate(this.numb, 4))
    {
      // request to back end
      this.http.get(`http://localhost:3000/api/open/courses/?courseNum=${this.numb}`).subscribe((data:any) => {
        this.courseData = data; // get back end data object
      })
      console.log(`Searched all courses with course number: ${this.numb}`);
    }
    else if ((this.subject == "") && (this.numb == "") && (this.catalog != "") && this.val.validate(this.catalog, 5))
    {
      // request to back end
      this.http.get(`http://localhost:3000/api/open/courses/?catalog=${this.catalog}`).subscribe((data:any) => {
        this.courseData = data; // get back end data object
      })
      console.log(`Searched all courses with catalog number: ${this.catalog}`);
    }
    else if ((this.subject != "") && (this.numb != "") && (this.catalog == "") && this.val.validate(this.subject, 8) && this.val.validate(this.numb, 4))
    {
      // request to back end
      this.http.get(`http://localhost:3000/api/open/courses/?subject=${this.subject}&courseNum=${this.numb}`).subscribe((data:any) => {
        this.courseData = data; // get back end data object
      })
      console.log(`Searched all courses with subject: ${this.subject} and course number: ${this.numb}`);
    }
    else if ((this.subject != "") && (this.numb == "") && (this.catalog != "") && this.val.validate(this.subject, 8) && this.val.validate(this.catalog, 5))
    {
      // request to back end
      this.http.get(`http://localhost:3000/api/open/courses/?subject=${this.subject}&catalog=${this.catalog}`).subscribe((data:any) => {
        this.courseData = data; // get back end data object
      })
      console.log(`Searched all courses with subject: ${this.subject} and catalog number: ${this.catalog}`);
    }
    else if ((this.subject == "") && (this.numb != "") && (this.catalog != "") && this.val.validate(this.numb, 4) && this.val.validate(this.catalog, 5))
    {
      // request to back end
      this.http.get(`http://localhost:3000/api/open/courses/?courseNum=${this.numb}&catalog=${this.catalog}`).subscribe((data:any) => {
        this.courseData = data; // get back end data object
      })
      console.log(`Searched all courses with course number: ${this.numb} and catalog number: ${this.catalog}`);
    }
    else if ((this.subject != "") && (this.numb != "") && (this.catalog != "") && this.val.validate(this.subject, 8) && this.val.validate(this.numb, 4) && this.val.validate(this.catalog, 5))
    {
      // request to back end
      this.http.get(`http://localhost:3000/api/open/courses/?subject=${this.subject}&courseNum=${this.numb}&catalog=${this.catalog}`).subscribe((data:any) => {
        this.courseData = data; // get back end data object
      })
      console.log(`Searched all courses with subject: ${this.subject}, course number: ${this.numb}, and catalog number: ${this.catalog}`);
    }
    else
    {
      this.courseError = "Invalid input in search fields!";
      console.log("Invalid input!");
    }
  }

  // method to display courses based on a keyword
  displayKey()
  {
    this.reset(); // reset all back end result variables

    this.keyword = this.keyword.toUpperCase(); // all fields keyword is matched to are upper case

    if ((this.keyword != "") && this.val.validate(this.keyword, 100))
    {
      this.http.get(`http://localhost:3000/api/open/key/${this.keyword}`).subscribe((data:any) => {
        this.courseData = data; // get back end data object
      })
      console.log(`Searched for courses using keyword: ${this.keyword}`);
    }
    else
    {
      this.courseError = "Invalid input in search fields!";
      console.log("Invalid input!");
    }
  }

  // method to display up to 10 public schedules
  displaySchedules()
  {
    this.reset(); // reset all back end result variables

    this.http.get(`http://localhost:3000/api/open/schedules`).subscribe((data:any) => {
      this.scheData = data.sort((a: any, b: any) => a.date_modified - b.date_modified); // get back end data object sorted by date modified
    })
    console.log(`Get up to 10 public schedules`);
  }

  // method to show all course details
  expandRes()
  {
    // request for all existing reviews
    this.http.get(`http://localhost:3000/api/admin/comments`).subscribe((data:any) => {
      this.allRevData = data; // get all reviews as an object

      for (let c in this.courseData) // for all courses returned in the search
      {
        for (let r in this.allRevData) // check if they have a review
        {
          if (this.allRevData[r].subject_code == this.courseData[c].subject_code && this.allRevData[r].course_code == this.courseData[c].course_code && !this.allRevData[r].hidden) // if the review matches
          {
            this.revData.push(this.allRevData[r]); // add that rview to the list
          }
        }
      }
    })

    this.expand = true; // allow the new data to be displayed
  }

  // method to list schedule details
  listRes()
  {
    // get a list of all public schedules
    this.http.get(`http://localhost:3000/api/open/schedules`).subscribe((data:any) => {

      for (let d in data) // for each of the schedules
      {
        this.http.get(`http://localhost:3000/api/open/schedules/${data[d].name}`).subscribe((dataN:any) => {
          this.esData.push(dataN); // get expanded data object of that schedule
        })
      }
    })
    console.log("Searched for expanded schedule information");

    this.list = true; // allow list to display once it is built
  }

  // method to get the timetable of a given course
  timetable()
  {
    this.reset(); // reset all member variables

    if ((this.name != "") && this.val.validate(this.name, 100))
    {
      // request to back end
      this.http.get(`http://localhost:3000/api/open/schedules/full/${this.name}`).subscribe((data:any) => {
        this.timeData = data; // get back end data object
      })
      console.log(`Searched for timetable data from schedule: ${this.name}`);
    }
    else
    {
      this.timeError = "Invalid input in name field!";
      console.log("Invalid input!");
    }
  }

  // method to reset data variables from the back end
  reset()
  {
    this.courseData = undefined;
    this.allRevData = undefined;
    this.revData.length = 0;
    this.expand = false;
    this.scheData = undefined;
    this.esData.length = 0;
    this.list = false;
    this.timeData = undefined;
    this.courseError = "";
    this.scheduleError = "";
    this.timeError = "";
  }
}

