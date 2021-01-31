import { State } from "./state-rework.class";

export class PriorityQueue {
    private _nodes: Map<number, State[]> = new Map()
  
    /**
     * Return the number of items in queue.
     */
    public count(): number {
      let count = 0
      //console.log(this._nodes)
      this._nodes.forEach((nodes, index) => count += nodes.length);
      return count
    }
  
    /**
     * Get maximum cost store in queue
     */
    public maxCost(): number {
      return Math.max(...Array.from(this._nodes.keys()))
    }
  
    /**
     * Get minimum cost store in queue
     */
    public minCost(): number {
      return Math.min(...Array.from(this._nodes.keys()))
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
    }
  
    /**
     * Get the item with the highest priority (in our case the lowest cost)
     */ 
    public getAndRemoveTop(): State {
      let key = this.minCost()
      let pack = this._nodes.get(key)
      let node = pack.shift()
      if (!pack.length) {
        this._nodes.delete(key)
      }
  
      return node
    }
  }