import { State } from "./state.class"

/**
* A class to hold the State of the 8 puzzle. This is used to create the solution.
* Node not only holds the state of the 8 puzzle but also the cost associated with the specific state.
*/
export class Node {
    private _state: State
    private _parent: Node
    private _cost: number
    private _depth: number
  
    public set state(state: State) { this._state = state }
    public get state(): State { return this._state }
  
    public set parent(parent: Node) { this._parent = parent }
    public get parent(): Node { return this._parent }
  
    public set cost(cost: number) { this._cost = cost }
    public get cost(): number { return this._cost }
  
    public set depth(depth: number) { this._depth = depth }
    public get depth(): number { return this._depth }
  
  
    constructor(state: State, depth: number = 0, parent: Node = null) {
      this.state = state;
      this.cost = /*_state.GethammingCost() + */this.state.getManhattanCost() + depth;
      this.parent = parent;
      this.depth = depth;
    }
  }