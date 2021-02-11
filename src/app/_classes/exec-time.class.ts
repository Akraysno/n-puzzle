export class ExecTime {
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