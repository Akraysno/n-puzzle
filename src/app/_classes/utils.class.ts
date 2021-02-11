//import hrtime from 'browser-process-hrtime'

/** Hrtime is a type for  time storage of hrtime format:
 * Hrtime[0] seconds + Hrtime[1] nanoseconds.
 * https://node.readthedocs.io/en/latest/api/process/#processhrtime
 */
type Hrtime = [number, number];

/**
 * class ExecTime for precise execution time measurement.
 * Usage: call startTime() when measurement must be started.
 * endTime() when called will return execution time in nanosecond.
 */
export class ExecTime {
    /*
    startT: Hrtime = [0, 0];
    endT: Hrtime
    diffT: number

    public start(): void {
        this.startT = hrtime();
    }

    public finish(): number {
        this.endT = hrtime();
        const endT: Hrtime = hrtime(this.startT);
        this.diffT = endT[0] * 1e9 + endT[1];
        return this.diffT
    }

    public endTime(): number {
        const endT: Hrtime = hrtime(this.startT);
        return endT[0] * 1e9 + endT[1];
    }
    */
    startT: number
    endT: number
    diffT: number

    public start(): void {
        this.startT = Date.now()
    }

    public finish(): number {
        this.endT = Date.now()
        this.diffT = this.endT - this.startT
        return this.diffT
    }

}

export class Utils {
    static chunkArray(arr: any[], size: number) {
        let resultArray: any[][] = []
        let nbRow: number = Math.ceil(arr.length / size)
        for (let i = 0; i < nbRow; i++) {
            let index = i * size
            resultArray.push(arr.slice(index, index + size))
        }
        return resultArray
    }

    static flattenArray(arr: any[][]) {
        let resultArray: any[] = []
        for (let cell of arr) {
            resultArray = resultArray.concat(cell)
        }
        return resultArray
    }
}