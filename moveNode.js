import { FIELD } from './field.js'
import { Move } from './move.js'
import { Board, FIELD_TYPE } from './board.js'

const MAX_DEPTH = 3

export class MoveNode {
   /** @type {Move} */         move
   /** @type {Number} */       value
   /** @type {MoveNode[]} */   children = []
   /** @type {MoveNode} */     parent
   /** @type {Number} */       depth
   /** @type {Board} */        board

   /**
    * @param {MoveNode} parent
    * @param {Move} move
    * @param {Board} board
    */
   constructor (parent, move, board) {
      if (parent !== undefined) {
         this.current_color = (parent.current_color === FIELD_TYPE.WHITE) ? FIELD_TYPE.BLACK : FIELD_TYPE.WHITE
         this.parent = parent
         this.depth = parent.depth + 1
         this.move = move
         this.board = parent.board
         this.value = this.evaluateMove(this.board, this.move)
         this.board.applyMove(this.move)

         if (this.depth < MAX_DEPTH) {
            this.createAllChildren()
            this.value += this.minMax()
         }

         this.board.revertMove(this.move)
      } else {
         this.current_color = FIELD_TYPE.BLACK
         this.parent = null
         this.depth = 0
         this.move = null
         this.board = board.copy()
         this.value = 0
         this.createAllChildrenWithProgress()

         if (this.children.length > 0) this.move = this.getChildWithHighestValue().move
      }
   }

   createAllChildrenWithProgress () {
      const all_moves = this.board.getAllPossibleMoves(this.current_color)
      const progress_step = 1 / all_moves.length
      let progress = 0

      all_moves.forEach(
         move => {
            this.children.push(new MoveNode(this, move, null))
            self.postMessage(['progressUpdate', progress])
            progress += progress_step
         },
         this
      )
   }

   getChildWithHighestValue () {
      this.shuffleArray(this.children)

      return this.children.reduce((prev, current) => (prev.value < current.value) ? current : prev)
   }

   shuffleArray (array) {
      for (let i = array.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [array[i], array[j]] = [array[j], array[i]]
      }
   }

   /**
    * @param {Board} board
    * @param {Move} move
    * @returns {number}
    */
   evaluateMove (board, move) {
      switch (board.field(move.To)) {
         case FIELD.PAWN_BLACK:
            return -1
         case FIELD.PAWN_WHITE:
            return 1
         case FIELD.ROOK_BLACK:
            return -5
         case FIELD.ROOK_WHITE:
            return 5
         case FIELD.BISHOP_BLACK:
            return -3
         case FIELD.BISHOP_WHITE:
            return 3
         case FIELD.KNIGHT_BLACK:
            return -3
         case FIELD.KNIGHT_WHITE:
            return 3
         case FIELD.QUEEN_BLACK:
            return -9
         case FIELD.QUEEN_WHITE:
            return 9
      }

      if (board.field(move.From) === FIELD.PAWN_BLACK && move.To.column < 5)
         return 0.1

      return 0
   }

   createAllChildren () {
      const all_moves = this.board.getAllPossibleMoves(this.current_color)

      all_moves.forEach(
         move => this.children.push(new MoveNode(this, move, null)),
         this
      )
   }

   minMax () {
      if (this.depth % 2 === 0)
         return this.children.reduce((prev, current) => Math.max(prev, current.value), 0)
      else
         return this.children.reduce((prev, current) => Math.min(prev, current.value), 0)
   }
}
