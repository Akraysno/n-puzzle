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