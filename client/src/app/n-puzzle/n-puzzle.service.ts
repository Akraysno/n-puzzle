import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment';
import { NPuzzleAlgo } from '../../../../entities/n-puzzle/enums/n-puzzle-algo.enum';

@Injectable()
export class NPuzzleService {

    constructor(
        private http: HttpClient
    ) { }

    resolve(type: NPuzzleAlgo, size: number, startState: number[], finalState: number[]) {
        return this.http.post(`${environment.APP_URL}${environment.APP_NPUZZLE_PATH}`, {
            type,
            size,
            startState,
            finalState
        })
    }
}