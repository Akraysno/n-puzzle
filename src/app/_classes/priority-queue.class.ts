import { State } from "./state.class";

export class PriorityQueue {
    private _nodes: Map<number, State[]> = new Map()
    private _minCost: number = -1
    private _length: number = 0

    get length() { return this._length }//{ return this.count() }//
    get minCost() { return this._minCost }//{ return Math.min(...Array.from(this.nodes.keys())) }//
    get nodes() { return this._nodes }
  
    /**
     * Return the number of items in queue.
     */
    public count(): number {
      let count = 0
      this._nodes.forEach((nodes, index) => count += nodes.length);
      return count
    }

    /**
     * Add an item to the queue.
     * 
     * @param state 
     * @param cost 
     */
    public addItem(state: State, cost: number): void {
      let key = cost
      let pack = this._nodes.get(key)
      if (!pack) {
        pack = []
      }
      pack.push(state)
      this._nodes.set(key, pack)
      this._length++
      this._minCost = this.minCost === -1 || this.minCost > key ? key : this.minCost
    }
  
    /**
     * Get the item with the highest priority (in our case the lowest cost)
     */ 
    public getFirst(): State {
      let key = this.minCost
      let pack = this._nodes.get(key)
      let node = pack.shift()
      if (!pack.length) {
        this._nodes.delete(key)
        this._minCost = Math.min(...Array.from(this.nodes.keys()))
      }
      this._length--
      return node
    }
  }