import sys, time, math, copy, random, json
from enum import Enum     # for enum34, or the stdlib version
from threading import Thread
from queue import PriorityQueue

# Takes first name and last name via command  
# line arguments and then display them 
debug: bool = False

def listToString(arr: list):
    return ','.join([str(val) for val in arr])

def chunkList(arr: list, size: int):
    return [arr[i:i + size] for i in range(0, len(arr), size)]
  
class TileMoveDirection(Enum):
    TOP = 'TOP'
    RIGHT = 'RIGHT'
    BOTTOM = 'BOTTOM'
    LEFT = 'LEFT'

class State:
    __emptyTileIndex: int
    __arr: list#<int>
    __numRowsOrCols: int
    __neighbours: dict = dict()#Dict<int, list<int>>
    __swip: int = None
    __moveDirection: str = None
    __goal: list#<int>

    #def __init__(self, args, goal: list<int>):
    def __init__(self, args, goal: list):
        if isinstance(args, int) is True:
            self.__numRowsOrCols = args
            self.__arr = list(range(0, int(math.pow(self.__numRowsOrCols, 2))))
            self.__emptyTileIndex = self.__arr.index(0)
        elif isinstance(args, list) is True:
            #debug == True ? console.log('Construct from array') : 0
            self.__numRowsOrCols = int(math.sqrt(len(args)))
            self.__arr = [val for val in args]#list(range(0, int(math.pow(self.__numRowsOrCols, 2))))
            self.__emptyTileIndex = self.__arr.index(0)
        else:
            self.__numRowsOrCols = args.get_numRowsOrCols()
            self.__emptyTileIndex = args.get_emptyTileIndex()
            self.__arr = [val for val in args.get_arr()]#list(range(0, int(math.pow(self.__numRowsOrCols, 2))))
        self.__goal = goal
        #self.createGraphForNPuzzle()

    def __repr__(self):
        return self.toJSON()

    def toJSON(self):
        string = '{'
        string += '"moveDirection":"'+ (self.__moveDirection if self.__moveDirection is not None else '')+'"'
        if (self.__swip) and (self.__swip >= 0):
            string += ',"swip":'+ str(self.__swip)
        string += ',"arr":'+str(self.get_arr())
        string += '}'
        return string

    #def set_arr(self, arr: list<int>):
    def set_arr(self, arr: list):
        self.__arr = arr

    #def get_arr(self) -> list<int>:
    def get_arr(self) -> list:
        return self.__arr

    def get_swip(self) -> int:
        return self.__swip

    def get_moveDirection(self) -> TileMoveDirection:
        return self.__moveDirection

    #def get_goal(self) -> list<int>:
    def get_goal(self) -> list:
        return self.__goal

    def set_numRowsOrCols(self, numRowsOrCols: int):
        self.__numRowsOrCols = numRowsOrCols
    
    def get_numRowsOrCols(self) -> int:
        return self.__numRowsOrCols

    def set_emptyTileIndex(self, emptyTileIndex: int):
        self.__emptyTileIndex = emptyTileIndex

    def get_emptyTileIndex(self) -> int:
        return self.__emptyTileIndex

    #def equals(self, tileA: State, tileB: State) -> bool:
    def equals(self, tileA, tileB) -> bool:
        return listToString(tileA.get_arr()) == listToString(tileB.get_arr())

    def findEmptyTileIndex(self) -> int:
        return self.__arr.index(0)

    def randomize(self):
        #randomizedArray: list<int> = copy.deepcopy(self.__arr)
        randomizedArray: list = copy.deepcopy(self.__arr)
        random.shuffle(randomizedArray)
        self.__arr = randomizedArray

    def swapWithEmpty(self, num: int):
        try:
            index = self.__arr.index(num)
        except ValueError:
            return
        diff = self.__emptyTileIndex - index
        if diff is -1:
            self.__moveDirection = TileMoveDirection.RIGHT.value
        elif diff is 1:
            self.__moveDirection = TileMoveDirection.LEFT.value
        elif diff is self.get_numRowsOrCols():
            self.__moveDirection = TileMoveDirection.TOP.value
        else:
            self.__moveDirection = TileMoveDirection.BOTTOM.value
        tmp: int = self.__arr[index];
        self.__arr[index] = self.__arr[self.__emptyTileIndex];
        self.__arr[self.__emptyTileIndex] = tmp;
        self.__emptyTileIndex = index;
        self.__swip = num

    def getManhattanCost(self) -> int:
        #goal: list<int> = self.__goal
        goal: list = self.__goal
        cost: int = 0

        for index in range(0, len(self.__arr)):
            num = self.__arr[index]
            if num is 0:
                continue
            
            goalIndex: int = -1
            try:
                goalIndex = goal.index(num)
            except ValueError:
                continue

            if goalIndex is index:
                continue

            gx: int = index % self.__numRowsOrCols
            gy: int = math.floor(index / self.__numRowsOrCols)

            x: int = goalIndex % self.__numRowsOrCols
            y: int = math.floor(goalIndex / self.__numRowsOrCols)

            mancost: int = abs(x - gx) + abs(y - gy)
            cost += mancost;
        #print('cost: '+str(cost)) if debug == True else None
        return cost

    #def getNeighbours(id: int) -> list<int>:
    def getNeighbours(self, id: int) -> list:
        return self.__neighbours.get(id)

    def getNeighboursForIndex(self, index: int) -> list:
        i = int(index / self.__numRowsOrCols)
        j = int(index % self.__numRowsOrCols)
        li: list = []
        if i - 1 >= 0:
            li.append(self.__arr[(i - 1) * self.__numRowsOrCols + j])
        if i + 1 < self.__numRowsOrCols:
            li.append(self.__arr[(i + 1) * self.__numRowsOrCols + j])
        if j - 1 >= 0:
            li.append(self.__arr[i * self.__numRowsOrCols + (j - 1)])
        if j + 1 < self.__numRowsOrCols:
            li.append(self.__arr[i * self.__numRowsOrCols + (j + 1)])
        #print('current index : '+str(index)+', value '+str(self.__arr[index])+', li: ['listToString(li)+']') if debug == True ? else None
        print('\n'+str(index)+'  --  '+str(li)) if debug is True else None
        return li

    def createGraphForNPuzzle(self) -> None:
        numRowsOrCols: int = self.__numRowsOrCols
        #arr: list<int> = self.__arr
        arr: list = self.__arr
        #print(self.createGridToPrint()) if debug == True else None
        #print('\n\n')
        for i in range(0, numRowsOrCols):
           # print('\n')
            for j in range(0, numRowsOrCols):
               # print('\n' + str(i) + ' -- ' + str(j))
               # print(self.createGridToPrint())
                index: int = i * numRowsOrCols + j
                #debug == True ? print('current index : '+str(index)+', value : '+str(arr[index])) : 0
                #li: list<int> = []
                li: list = []
                if i - 1 >= 0:
                    li.append(arr[(i - 1) * numRowsOrCols + j])
                if i + 1 < numRowsOrCols:
                    li.append(arr[(i + 1) * numRowsOrCols + j])
                if j - 1 >= 0:
                    li.append(arr[i * numRowsOrCols + (j - 1)])
                if j + 1 < numRowsOrCols:
                    li.append(arr[i * numRowsOrCols + (j + 1)])
                #print('current index : '+str(index)+', value '+str(arr[index])+', li: ['listToString(li)+']') if debug == True ? else None
                print('\n'+str(index)+'  --  '+str(li))
                self.__neighbours[index] = li

    def createGridToPrint(self) -> str:
        #arr: list<list<int>> = chunkList(self.__arr, self.__numRowsOrCols)
        arr: list = chunkList(self.__arr, self.__numRowsOrCols)
        numLen = len(str(self.__numRowsOrCols))
        b: str = ''
        for r in arr:
            s: str = ('\n' if len(b) > 0 else '') + '\t'
            for n in r:
                ns = str(n)
                while len(ns) < numLen:
                    ns = ' ' + ns
                s += ns + ' '
            b += s
        return b

class Neighbours:
    #__edges: dict<int, list<int>> = dict()
    __edges: dict = dict()
    #__instance: Neighbours = None;
    __instance = None;

    #def set_instance(self, instance: Neighbours):
    def set_instance(self, instance):
        self.__instance = instance

    #def get_instance(self) -> Neighbours:
    def get_instance(self):
        neighbours = self.__instance
        if neighbours is None:
            neighbours = self.__class__()
        return neighbours

    #def getNeighbours(self, id: int) -> list<int>:
    def getNeighbours(self, id: int) -> list:
        return self.__edges.get(id)

    def createGraphForNPuzzle(self, rowsOrCols: int) -> None:
        for i in range(0, rowsOrCols):
            for j in range(0, rowsOrCols):
                index: int = i * rowsOrCols + j
                #li: list<int> = []
                li: list = []
                if i - 1 >= 0:
                    li.insert((i - 1) * rowsOrCols + j)
                if i + 1 < rowsOrCols:
                    li.insert((i + 1) * rowsOrCols + j);
                if j - 1 >= 0:
                    li.insert(i * rowsOrCols + j - 1);
                if j + 1 < rowsOrCols:
                    li.insert(i * rowsOrCols + j + 1);
                #debug == True ? console.log(index, li) : 0
                self.__edges[index] = li
                #debug == True ? console.log(self._edges.keys()) : 0

class Node:
    __state: State
    #__parent: Node
    __parent = None
    __cost: int
    __depth: int

    def __repr__(self):
        return self.toJSON()
        repr = ''
        repr += '{\n'
        repr += '\tcost: '+str(self.__cost)+',\n'
        repr += '\tdepth: '+str(self.__depth)+',\n'
        repr += '\tboard: '+str(self.__state.get_arr())+'\n'
        repr += '}'
        return repr

    def toJSON(self):
        string = '{'
        string += '"state":'+self.__state.toJSON()
        string += ',"cost":'+str(self.__cost)
        string += ',"depth":'+str(self.__depth)
        string += '}'
        return string

    def set_state(self, state: State):
        self.__state = state

    def get_state(self) -> State:
        return self.__state

    #def set_parent(self, parent: Node):
    def set_parent(self, parent):
        self.__parent = parent

    #def get_parent(self) -> Node:
    def get_parent(self):
        return self.__parent

    def set_cost(self, cost: int):
        self.__cost = cost

    def get_cost(self) -> int:
        return self.__cost

    def set_depth(self, depth: int):
        self.__depth = depth

    def get_depth(self) -> int:
        return self.__depth

    #def __init__(self, state: State, depth: int = 0, parent: Node = None):
    def __init__(self, state: State, depth: int = 0, parent = None):
        self.__state = state
        self.__cost = self.__state.getManhattanCost() + depth
        self.__parent = parent
        self.__depth = depth

    #def isSuperior(self, n1: Node, n2: Node) -> bool:
    def isSuperior(self, n1, n2) -> bool:
        return n1.get_cost() > n2.get_cost()

    #def isInferior(self, n1: Node, n2: Node) -> bool:
    def isInferior(self, n1, n2) -> bool:
        return n1.get_cost() < n2.get_cost()

    def print(self, lineNum: int) -> None:
        string: str = ''
        string += str(lineNum)+' -'
        string += 'Node { '
        for elem in self.__state.get_arr():
            string += str(elem)
        string += ' | D: '+self.depth+', MD: '+self.cost+' }'
        print(string) if debug == True else None

class QueueItem(object):
    def __init__(self, priority, item):
        self.priority = priority
        self.item = item

    def __cmp__(self, other):
        return cmp(self.priority, other.priority)

    def __lt__(self, other):
        return self.priority < other.priority

    def __le__(self, other):
        return self.priority <= other.priority

    def __eq__(self, other):
        return self.priority is other.priority

    def __ne__(self, other):
        return self.priority is not other.priority

    def __ge__(self, other):
        return self.priority > other.priority

    def __gt__(self, other):
        return self.priority >= other.priority

class CustomPriorityQueue:
    queue: PriorityQueue = PriorityQueue()

    def count(self) -> int:
        return self.queue.qsize()

    def maxCost(self) -> int:
        return -1

    def minCost(self) -> int:
        return -1

    def add(self, n: Node) -> None:
        self.queue.put(QueueItem(n.get_cost(), n))

    def getAndRemoveTop(self) -> Node:
        item = self.queue.get()
        return item.item

class SearchUsingAStar:
    root: Node
    start: State
    goal: State
    solution: list = []
    solved: bool = False
    openlist: CustomPriorityQueue = CustomPriorityQueue()
    closedlist: list = []
    closedState: list = []
    threadCount = 0

    def __init__(self, start: State, goal: State):
        self.start = start
        self.goal = goal
        self.root = Node(start, 0, None)            
        print('CURRENT : \n'+self.start.createGridToPrint()) if debug is True else None
        print('GOAL :\n'+self.goal.createGridToPrint()) if debug is True else None

    #def isClosed(self, state: State, closedlist: list<Node>):
    def isClosed(self, state: State, closedlist: list) -> bool:
        arr = listToString(state.get_arr())
        return True if (arr in closedState) else False

    def searchThread(self):
        print('OPEN LIST RESTANTE : '+str(self.openlist.count())) if debug is True else None
        while (self.openlist.count() > 0) and (self.solved is not True):
            current: Node = self.openlist.getAndRemoveTop()
            #print(current)
            print('PARENT : \n'+ (current.get_parent().get_state().createGridToPrint() if current.get_parent() is not None else '\n')) if debug is True else None
            print('CURRENT ['+str(current.get_state().get_swip())+'] : \n'+current.get_state().createGridToPrint()) if debug is True else None
            print('GOAL :\n'+self.goal.createGridToPrint()) if debug is True else None
            print('DEPTH : '+str(current.get_depth())) if debug is True else None
            print('COST : '+str(current.get_cost())+' ['+str(self.openlist.minCost())+' -> '+str(self.openlist.maxCost())+']') if debug is True else None

            if self.goal.equals(current.get_state(), self.goal) is True:
                s: Node = current
                solution: list = []
                while s is not None:
                    print('Deeper...') if debug is True else None
                    solution.insert(0, s)
                    s = s.get_parent()
                nbMove = len(solution) - 1 # don't count start state

                print('Solution found.. ['+str(len(self.closedlist))+']\nTotal moves needed : '+str(nbMove)) if debug is True else None
                self.solution = solution
                self.solved = True
                break

            zero: int = current.get_state().findEmptyTileIndex()
            neighbours: list = current.get_state().getNeighboursForIndex(zero)
            print(neighbours) if debug is True else None
            print('Voisins: '+listToString(neighbours)) if debug is True else None

            for i in range(0, len(neighbours)) :
                next = neighbours[i]
                state: State = State(current.get_state(), current.get_state().get_goal())
                state.swapWithEmpty(next)
                print('Liste fermees: '+str(len(self.closedlist))) if debug is True else None
                print('Liste Ouvertes: '+str(self.openlist.count())) if debug is True else None
                if self.isClosed(state, self.closedlist) is False:
                    n: Node = Node(state, current.get_depth() + 1)
                    n.set_parent(current)
                    self.openlist.add(n)
                    self.closedlist.append(n)
                    self.closedState.append(listToString(n.state.get_arr()))
                #else:
                    #print('Already explored')
        self.openlist.queue.task_done()

    #async
    def search(self):
        global debug
        #closedlist: list = []
        #closedlist: list<Node> = []
        self.openlist.add(self.root)
        self.closedlist.append(self.root)
        # number of worker threads to complete the processing
        num_worker_threads = 8

        solved: bool = False
        #solution: list<Node> = []
        solution: list = []

        threads = []
        for i in range(num_worker_threads):
            t = Thread(target=self.searchThread)
            t.daemon = True
            t.start()
            threads.append(t)
        threads[0].join()
        #for i in range(len(threads)):
        #    threads[i].join()
        #self.openlist.queue.join()

if __name__ == "__main__":
    start = int(round(time.time() * 1000))
    print("Output from Python")  if debug is True else None
    origin = [int(val) for val in sys.argv[1].split(',')]#[2, 5, 7, 0, 3, 4, 6, 1, 8]#
    final = [int(val) for val in sys.argv[2].split(',')]#[1, 2, 3, 8, 0, 4, 7, 6, 5]#
    print("Oirgin : ")  if debug is True else None
    print(origin) if debug is True else None
    print("Final : ")  if debug is True else None
    print(final) if debug is True else None
    search = SearchUsingAStar( State(origin, final) , State(final, final) )
    #res = search.search()
    search.search()
    print('--------------------') if debug is True else None
    res = search.solution
    print(res)
    end = int(round(time.time() * 1000))
    print('Finish in '+str(end - start)+' millisecondes') if debug is True else None
