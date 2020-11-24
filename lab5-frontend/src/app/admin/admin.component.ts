import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Validator } from '../validator.service';
import { interval, Observable, Subscription } from 'rxjs';
import { any } from 'joi';

@Component({
  selector: 'admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  // fields to track whether a user is logged in or not
  subscription: Subscription;
  activeUser: string = "";
  ad: boolean = false;

  // member variables
  addUser: string = ""; // username of user to give admin to

  // member variables for output
  backData: any;
  gError: string = "";

  constructor(private http: HttpClient, private val: Validator)
  {
    // every second, update the active user variable
    this.subscription = interval(10000).subscribe(() => {
      this.activeUser = this.val.getActiveUser();

      if (this.activeUser)
      {
        // check to see if this user is an admin
        this.http.get(`http://localhost:3000/api/open/users/${this.activeUser}`).subscribe((data:any) => {
          if (data.permission_level === "admin") // if user is an admin
          {
            this.ad = true; // reveal admin level content
          }
          else // if user is not an admin
          {
            this.ad = false; // hide admin level content
          }
        })
      }
    });
  }

  ngOnInit(): void {
  }

  // method to give a particular user admin privileges
  giveAdmin()
  {
    this.reset(); // reset all member variables

    if (this.addUser != "" && this.val.validateEmail(this.addUser))
    {
      // empty object to send
      let obj = {
        adds: this.addUser
      }

      // request to back end
      this.http.put(`http://localhost:3000/api/admin/users/${this.addUser}`, JSON.stringify(obj), reqHeader).subscribe((data:any) => {
        this.backData = data; // get response
      })
      console.log(`Gave admin privileges to user: ${this.addUser}`);
    }
    else
    {
      this.gError = "Invalid input for user email!";
      console.log("Invalid error!");
    }
  }

  // method to reset member variables
  reset()
  {
    this.backData = undefined;
    this.gError = "";
  }
}

// build options for the http requests
const reqHeader = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Access-Control-Allow-Headers": "Content-Type"
  })
}
