import { Injectable } from '@angular/core';

@Injectable()
export class Validator {

  private activerUser: string; // string to keep track of the user who is logged in

  constructor()
  {
    this.activerUser = "";
  }

  getActiveUser() // get the value of the active user
  {
    return this.activerUser;
  }

  setActiveUser(val: string) // set the value of the active user
  {
    this.activerUser = val;
  }

  // method to validate a string of a given maximum length
  public validate(inp: string, len: number)
  {
    if ((typeof inp !== "string") || (inp.length == 0) || (inp.length > len) || (inp.includes("<")) || (inp.includes(">")) || (inp.includes("^")) || (inp.includes(".")) || (inp.includes("/")) || (inp.includes("(")) || (inp.includes(")")) || (inp.includes("*")) || (inp.includes("'"))  || (inp.includes("_")) || (inp.includes("=")) || (inp.includes("$")) || (inp.includes("?")) || (inp.includes("!")) || (inp.includes("%")) || (inp.includes("\"")) || (inp.includes("`")) || (inp.includes("+")) || (inp.includes("&")))
    {
      return false;
    }
    else
    {
      return true;
    }
  }

  // method to validate numerical input
  public validateNum(inp: number, min: number, max: number)
  {
    if ((typeof inp === "number") && (inp >= min) && (inp <= max))
    {
      return true;
    }
    else
    {
      return false;
    }
  }

  // method to validate an email address
  public validateEmail(inp: string)
  {
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(inp)) // email must match this pattern
    {
        return true;
    }
    else
    {
        return false;
    }
  }
}
