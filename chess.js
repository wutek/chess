import { ALL_FIELDS, FIELD, Field } from './field.js'
import { Move } from './move.js'
import { FIELD_TYPE, HIGHLIGHT, NO_HIGHLIGHT, STARTING_BOARD } from './board.js'
import { MoveNode } from './moveNode.js'

class Chess {
   /** @type {Board}  */    #board
   /** @type {Board} */     #boardHighlight
   /** @type {Boolean} */   #whiteMove = true
   progressModal = document.getElementById('progress_modal')
   progressBar = document.getElementById('ai_move_progress')
   boardTable = document.getElementById('chess_board')

   constructor () {
      this.#board = STARTING_BOARD.copy()
      this.#boardHighlight = NO_HIGHLIGHT.copy()
      this.paint()
   }

   /**
    * Function handling users click on a field on the board.
    *
    * @param {Field} field
    * @returns void
    */
   handleClickOnField (field) {
      if (this.#boardHighlight.field(field) === HIGHLIGHT.SELECTED) {
         this.#clearBoardHighlight()
         this.paint()
         return
      }

      if (this.#board.getFieldType(field) === FIELD_TYPE.WHITE && this.#whiteMove) {
         this.#select(field)
         return
      }

      if (this.#boardHighlight.field(field) === HIGHLIGHT.HIGHLIGHTED) {
         const selected_field = this.#getSelectedField()

         this.applyMoveInGUI(new Move(
            selected_field,
            field.copy(),
            this.#board.field(selected_field),
            this.#board.field(field)
         ))

         this.AIMove()
      }
   }

   AIMove () {
      const worker = new Worker('AI_worker.js', { type: 'module' })

      this.progressBar.value = 0
      this.progressModal.style.display = 'block'
      this.boardTable.style.cursor = 'wait'
      this.progressModal.style.cursor = 'wait'

      const that = this

      worker.onmessage = function (event) {
         switch (event.data[0]) {
            case 'progressUpdate':
               that.progressBar.value = event.data[1]
               break

            case 'moved':
               const from = new Field(event.data[2], event.data[1])
               const to = new Field(event.data[4], event.data[3])
               const from_value = that.#board.field(from)
               const to_value = that.#board.field(to)
               const move = new Move(from, to, from_value, to_value)

               that.applyMoveInGUI(move)

               that.progressModal.style.display = 'none'
               that.boardTable.style.cursor = 'default'

               worker.terminate()
               break

            case 'game over':
               that.progressModal.innerHTML = event.data[1]
               that.boardTable.style.cursor = 'default'
               that.progressModal.style.cursor = 'default'
               break
         }
      }

      worker.onerror = () => { }
      worker.postMessage([
         this.#board.Array,
         MoveNode.MAX_DEPTH
      ])
   }

   /**
    * @param {Move} move
    */
   applyMoveInGUI (move) {
      this.#board.applyMove(move)
      this.#board.disableFutureCastlePossibility(move)
      this.#whiteMove = !this.#whiteMove
      this.#clearBoardHighlight()
      this.paint()
   }

   /**
    * @throws Error
    * @returns {Field} selected field
    */
   #getSelectedField () {
      for (let f of ALL_FIELDS)
         if (this.#boardHighlight.field(f) === HIGHLIGHT.SELECTED)
            return f

      throw new Error('no selected field')
   }

   /**
    * @param {Field} f
    */
   #select (f) {
      this.#clearBoardHighlight()
      this.#boardHighlight.setField(f, HIGHLIGHT.SELECTED)
      this.#board.getAvailableMovesFromField(f).forEach(
         (move) => this.#boardHighlight.setField(move.To, HIGHLIGHT.HIGHLIGHTED)
      )
      this.paint()
   }

   #clearBoardHighlight () {
      this.#boardHighlight = NO_HIGHLIGHT.copy()
   }

   /**
    * @param {number} field
    */
   static #figureName (field) {
      switch (field) {
         case FIELD.INVALID:
            return 'INVALID'

         case FIELD.EMPTY:
            return 'EMPTY'

         case FIELD.PAWN_WHITE:
            return 'PAWN_WHITE'

         case FIELD.ROOK_WHITE:
            return 'ROOK_WHITE'

         case FIELD.KNIGHT_WHITE:
            return 'KNIGHT_WHITE'

         case FIELD.BISHOP_WHITE:
            return 'BISHOP_WHITE'

         case FIELD.QUEEN_WHITE:
            return 'QUEEN_WHITE'

         case FIELD.KING_WHITE:
            return 'KING_WHITE'

         case FIELD.PAWN_BLACK:
            return 'PAWN_BLACK'

         case FIELD.ROOK_BLACK:
            return 'ROOK_BLACK'

         case FIELD.KNIGHT_BLACK:
            return 'KNIGHT_BLACK'

         case FIELD.BISHOP_BLACK:
            return 'BISHOP_BLACK'

         case FIELD.QUEEN_BLACK:
            return 'QUEEN_BLACK'

         case FIELD.KING_BLACK:
            return 'KING_BLACK'
      }
   }

   /**
    * @param {number} field
    */
   static #highlightClass (field) {
      switch (field) {
         case HIGHLIGHT.NONE:
            return ''

         case HIGHLIGHT.HIGHLIGHTED:
            return 'highlighted'

         case HIGHLIGHT.SELECTED:
            return 'selected'
      }
   }

   restart () {
      this.#board = STARTING_BOARD.copy()
      this.#boardHighlight = NO_HIGHLIGHT.copy()
      this.progressModal.style.display = 'none'
      this.boardTable.style.cursor = 'default'
      this.paint()
   }

   /**
    * @param {Field} f
    */
   #fieldsClassName (f) {
      return (
         Chess.#figureName(this.#board.field(f))
         + ' '
         + Chess.#highlightClass(this.#boardHighlight.field(f))
      )
   }

   paint () {
      for (const f of ALL_FIELDS)
         document.getElementById(f.id).className = this.#fieldsClassName(f)
   }
}

const chess = new Chess()

for (const f of ALL_FIELDS) {
   const board_field = document.getElementById(f.id)

   board_field?.addEventListener('click', () => {
      chess.handleClickOnField(f)
   })
}

const restartButton = document.getElementById('restart_button')
restartButton?.addEventListener('click', () => {
   chess.restart()
})

const selectSearchDepth = document.getElementById('search_depth')
selectSearchDepth?.addEventListener('change', (e) => {
   MoveNode.setSearchDepth(parseInt(e.target.value))
})
