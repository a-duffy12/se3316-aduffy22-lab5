import { Injectable } from '@angular/core';

@Injectable()
export class Validator {

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
}
