import { Board, FIELD_TYPE } from './board.js'
import { MoveNode } from './moveNode.js'

onmessage = function (ev) {
   const board = new Board(ev.data[0])
   MoveNode.setSearchDepth(ev.data[1])
   const rootSearchTree = new MoveNode(undefined, undefined, board)

   if (rootSearchTree.move !== null)
      self.postMessage([
         'moved',
         rootSearchTree.move.From.row,
         rootSearchTree.move.From.column,
         rootSearchTree.move.To.row,
         rootSearchTree.move.To.column,
      ])

   if (rootSearchTree.move === null) {
      const messageTxt = board.isCheckedBy(FIELD_TYPE.WHITE)
         ? 'Wygrałeś!'
         : 'Remis'

      self.postMessage(['game over', messageTxt])
   }
}
