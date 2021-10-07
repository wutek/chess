import { Board } from './board.js'
import { MoveNode } from './moveNode.js'

onmessage = function (ev) {
   const b = new Board(ev.data)

   console.time('AI_move')
   const root_search_tree = new MoveNode(undefined, undefined, b)
   console.timeEnd('AI_move')

   if (root_search_tree.move !== null) {
      self.postMessage([
         'moved',
         root_search_tree.move.From.row,
         root_search_tree.move.From.column,
         root_search_tree.move.To.row,
         root_search_tree.move.To.column
      ])
   } else {
      self.postMessage(['game over'])
   }
}
