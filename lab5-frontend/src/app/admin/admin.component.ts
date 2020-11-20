import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Validator } from '../validator.service';
import { interval, Observable, Subscription } from 'rxjs';

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

}
