import { State } from "./state-rework.class";

export class PriorityQueue {
    // The items and priorities.
    private _nodes: Map<number, State[]> = new Map()
  
    // Return the number of items in the queue.
    public count(): number {
      let count = 0
      this._nodes.forEach((nodes, index) => count += nodes.length);
      return count
    }
  
    public maxCost(): number {
      return Array.from(this._nodes.keys()).pop()
    }
  
    public minCost(): number {
      return Array.from(this._nodes.keys()).shift()
    }
  
    // Add an item to the queue.
    // Old, to delete
    public add(n: State): void {
      let key = n.cost
      let pack = this._nodes.get(key)
      if (!pack) {
        pack = []
      }
      pack.push(n)
      this._nodes.set(key, pack)
    }
    // Add an item to the queue.
    public addItem(n: State, cost: number): void {
      let key = cost
      let pack = this._nodes.get(key)
      if (!pack) {
        pack = []
      }
      pack.push(n)
      this._nodes.set(key, pack)
    }
  
    // Add an item to the queue.
    public addToQueue(n: State, cost: number): void {
      let pack = this._nodes.get(cost)
      if (!pack) {
        pack = []
      }
      pack.push(n)
      this._nodes.set(cost, pack)
    }
  
    // Get the item with the highest priority (in our case the lowest cost)
    public getAndRemoveTop(): State {
      let key = this.minCost()
      let pack = this._nodes.get(key)
      let node = pack.shift()
      if (!pack.length) {
        this._nodes.delete(key)
      }
  
      return node
    }
  
    public isEmpty(): boolean {
      let keys = this._nodes.keys()
      for (let k of keys) {
        let n = this._nodes.get(k)
        if (!n || !n.length) {
          this._nodes.delete(k)
        } else {
          return false
        }
      }
      return true
    }
  }