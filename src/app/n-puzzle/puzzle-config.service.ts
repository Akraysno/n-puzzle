import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class NPuzzleService {
    sizeChanged: BehaviorSubject<number> = new BehaviorSubject(3)

    constructor() { }

}