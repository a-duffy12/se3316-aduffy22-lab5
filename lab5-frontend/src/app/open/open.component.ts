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

  // member fields to hold back end data and errors
  courseData: any; // data from course search and keyword search
  expand: boolean = false;
  scheData: any; // for public schedules
  timeData: any; // timetable data for schedules
  error: string = "";

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
      this.error = "Invalid input in search fields!";
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
      this.error = "Invalid input in search fields!";
      console.log("Invalid input!");
    }
  }

  // method to show all course details
  expandRes()
  {
    this.expand = true;
  }

  // method to reset data variables from the back end
  reset()
  {
    this.courseData = undefined;
    this.expand = false;
    this.scheData = undefined;
    this.timeData = undefined;
    this.error = "";
  }
}
