import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Validator } from '../validator.service';
import { interval, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.css']
})
export class PolicyComponent implements OnInit {

  // fields to track whether a user is logged in or not
  subscription: Subscription;
  activeUser: string = "";
  ad: boolean = false;

  // member variables to track what to show
  pol: boolean = false;
  dmca: boolean = false;

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

  // method to show and hide privace policy
  showPolicy()
  {
    if (this.pol)
    {
      this.pol = false;
    }
    else if (!this.pol)
    {
      this.pol = true;
    }
  }

  // method to show and hide DMCA notices
  showDMCA()
  {
    if (this.dmca)
    {
      this.dmca = false;
    }
    else if (!this.dmca)
    {
      this.dmca = true;
    }
  }

}
