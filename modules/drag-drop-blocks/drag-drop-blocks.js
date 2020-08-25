import Delta from 'quill-delta';
import Quill from '../../core/quill';
import Module from '../../core/module';
import Break from '../../blots/break'

import {
  getDraggableRootBlot,
  getDropableRootBlot,
  isInlineRoot,
  css
} from './utils'

const ICON_DRAG_ANCHOR = '<svg t="1596683681627" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5150" width="20" height="20"><path d="M362.666667 192m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" p-id="5151" fill="#b1b1b1"></path><path d="M661.333333 192m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" p-id="5152" fill="#b1b1b1"></path><path d="M362.666667 512m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" p-id="5153" fill="#b1b1b1"></path><path d="M661.333333 512m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" p-id="5154" fill="#b1b1b1"></path><path d="M362.666667 832m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" p-id="5155" fill="#b1b1b1"></path><path d="M661.333333 832m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" p-id="5156" fill="#b1b1b1"></path></svg>'
const ICON_DRAG_ANCHOR_WIDTH = 20
const HELP_LINE_HEIGHT = 4
const DEFAULT_ZINDEX = 101

export class DragDropBlocks extends Module {
  static register() {}

  constructor(quill, options = {}) {
    super(quill, options)
    this.options = options
    this.dragging = false
    this.draggingRoot = null
    this.dragOverRoot = null
    this.dropRefRoot = null
    this.activeAnchor = null
    this.draggingHelpLine = this.quill.addContainer('cu-dragging-help-line')

    this.quill.on('text-change', (newDelta, oldDelta) => {
      if (
        newDelta &&
        oldDelta &&
        newDelta.diff(oldDelta).length !== 0
      ) {
        this.hideDraggableAnchor()
      }
    })

    this.quill.root.addEventListener('mousemove', evt => {
      if (this.dragging) return
      const target = evt.target
      const curBlot = Quill.find(target, true)
      const curRoot = this.getDraggableRootBlot(curBlot, target)

      if (curRoot && curRoot.statics.blotName === 'table-view') {
        const tableModule = this.quill.getModule('table')
        if (!!tableModule.table) {
          this.hideDraggableAnchor()
          return
        }
      }

      if (curRoot && this.draggingRoot !== curRoot) {
        this.hideDraggableAnchor()
        this.draggingRoot = curRoot
        this.showDraggableAnchor(curBlot, target)
      } else if (!curRoot) {
        this.hideDraggableAnchor()
      }
    }, false)

    this.quill.root.addEventListener('dragover', evt => {
      evt.preventDefault()
      evt.stopPropagation()
      if (!this.dragging) return

      // dragging inline blot
      if (this.isInlineRoot(this.draggingRoot)) {
        const native = this.getNativeSelection(evt);
        if (!native) {
          return;
        }
        const selection = document.getSelection();
        if (selection == null) {
          return;
        }
        selection.removeAllRanges();
        selection.addRange(native);
        return
      }

      // dragging block blot
      const target = evt.target
      const overBlot = Quill.find(target, true)
      const dragOverRoot = this.getDropableRootBlot(overBlot, target)
      if (!dragOverRoot) return

      this.dragOverRoot = dragOverRoot
      if (this.dragOverRoot && this.draggingRoot === this.dragOverRoot) {
        this.resetDraggingHelpLine()
      } else if (this.dragOverRoot && this.draggingRoot !== this.dragOverRoot) {
        const parent = this.quill.root.parentNode
        const containerRect = parent.getBoundingClientRect()
        const overRootRect = this.dragOverRoot.domNode.getBoundingClientRect()
        const offsetY = evt.clientY - overRootRect.top
        if (offsetY < overRootRect.height / 2) {
          css(this.draggingHelpLine, {
            position: 'absolute',
            width: `${overRootRect.width}px`,
            left: `${overRootRect.left - containerRect.left + parent.scrollLeft}px`,
            top: `${overRootRect.top - containerRect.top + parent.scrollTop - HELP_LINE_HEIGHT / 2}px`,
            zIndex: `${this.options.zIndex || DEFAULT_ZINDEX}`,
            display: 'block'
          })
          this.dropRefRoot = this.dragOverRoot
        } else {
          css(this.draggingHelpLine, {
            position: 'absolute',
            width: `${overRootRect.width}px`,
            left: `${overRootRect.left - containerRect.left + parent.scrollLeft}px`,
            top: `${overRootRect.top - containerRect.top + parent.scrollTop + overRootRect.height - HELP_LINE_HEIGHT / 2}px`,
            zIndex: `${this.options.zIndex || DEFAULT_ZINDEX}`,
            display: 'block'
          })
          this.dropRefRoot = this.dragOverRoot.next
        }
      }
    }, false)

    this.quill.root.addEventListener('drop', evt => {
      evt.preventDefault()
      evt.stopPropagation()
      if (!this.dragging || !this.isInlineRoot(this.draggingRoot)) return

      const native = this.getNativeSelection(evt)
      if (!native) {
        return;
      }
      const normalized = this.quill.selection.normalizeNative(native);
      const targetRange = this.quill.selection.normalizedToRange(normalized);
      const draggingBlotIndex = this.quill.getIndex(this.draggingRoot)
      const draggingBlotLength = this.draggingRoot.length()
      const draggingBlotDelta = this.quill.getContents(draggingBlotIndex, draggingBlotLength)

      let diff;
      if (targetRange.index > draggingBlotIndex) {
        diff = new Delta()
          .retain(draggingBlotIndex)
          .delete(draggingBlotLength)
          .retain(targetRange.index - draggingBlotIndex - draggingBlotLength)
          .concat(draggingBlotDelta);
      } else {
        diff = new Delta()
          .retain(targetRange.index)
          .concat(draggingBlotDelta)
          .retain(draggingBlotIndex - targetRange.index)
          .delete(draggingBlotLength);
      }

      this.quill.updateContents(diff, Quill.sources.USER);
    })
  }

  isInlineRoot (blot) {
    if (this.options.isInlineRoot) {
      return this.options.isInlineRoot(blot)
    }
    return isInlineRoot(blot)
  }

  getDraggableRootBlot (blot, node) {
    if (this.options.getDraggableRootBlot) {
      return this.options.getDraggableRootBlot(blot, node)
    }
    return getDraggableRootBlot(blot, node)
  }

  getDropableRootBlot (blot, node) {
    if (this.options.getDropableRootBlot) {
      return this.options.getDropableRootBlot(blot, node)
    }
    return getDropableRootBlot(blot, node)
  }

  getNativeSelection(e) {
    if (!e) {
      return;
    }
    let native;
    if (document.caretRangeFromPoint) {
      native = document.caretRangeFromPoint(e.clientX, e.clientY);
    } else if (document.caretPositionFromPoint) {
      const position = document.caretPositionFromPoint(e.clientX, e.clientY);
      native = document.createRange();
      native.setStart(position.offsetNode, position.offset);
      native.setEnd(position.offsetNode, position.offset);
    } else {
      return;
    }
    return native;
  }

  resetDraggingHelpLine () {
    if (this.draggingHelpLine) {
      css(this.draggingHelpLine, {
        display: 'none',
        width: '0',
        left: '0',
        top: '0'
      })
    }
  }

  hideDraggableAnchor () {
    this.activeAnchor && this.activeAnchor.remove()
    this.draggingRoot = null
    this.dragOverRoot = null
    this.dropRefRoot = null
    this.activeAnchor = null
  }

  showDraggableAnchor (blot, node) {
    if (!this.draggingRoot) {
      return;
    }
    // prevent show anchor from over the empty block
    if (blot &&
      blot.statics.blotName === 'block' &&
      blot.length() === 1 &&
      blot.children.head instanceof Break
    ) {
      return;
    }

    this.activeAnchor = this.quill.addContainer('cu-draggable-anchor')
    const dragIcon = document.createElement('div')
    dragIcon.classList.add('cu-draggable-anchor-icon')
    dragIcon.innerHTML = ICON_DRAG_ANCHOR
    dragIcon.setAttribute('draggable', true)
    this.activeAnchor.appendChild(dragIcon)

    const parent = this.quill.root.parentNode
    const containerRect = parent.getBoundingClientRect()
    const activeRootRect = this.draggingRoot.domNode.getBoundingClientRect()

    let isAnchorAlignCenter = false
    if (this.options.anchorAlignCenter) {
      if (
        typeof this.options.anchorAlignCenter === 'function'
      ) {
        isAnchorAlignCenter = this.options.anchorAlignCenter(blot, node)
      } else if (
        typeof this.options.anchorAlignCenter === 'boolean'
      ) {
        isAnchorAlignCenter = this.options.anchorOffsetLeft
      }
    }

    let anchorOffsetLeft = 0
    if (this.options.anchorOffsetLeft) {
      if (
        typeof this.options.anchorOffsetLeft === 'function'
      ) {
        anchorOffsetLeft = this.options.anchorOffsetLeft(blot, node)
      } else if (
        typeof this.options.anchorOffsetLeft === 'number'
      ) {
        anchorOffsetLeft = this.options.anchorOffsetLeft
      }
    }

    let anchorOffsetTop = 0
    if (this.options.anchorOffsetTop) {
      if (
        typeof this.options.anchorOffsetLeft === 'function'
      ) {
        anchorOffsetTop = this.options.anchorOffsetTop(blot, node)
      } else if (
        typeof this.options.anchorOffsetTop === 'number'
      ) {
        anchorOffsetTop = this.options.anchorOffsetTop
      }
    }

    if (typeof anchorOffsetLeft !== 'number') {
      anchorOffsetLeft = 0
      console.error(`DragDropBlocks module: anchorOffsetLeft can only be a number or function!`)
    }
    if (typeof anchorOffsetLeft !== 'number') {
      anchorOffsetTop = 0
      console.error(`DragDropBlocks module: anchorOffsetTop can only be a number or function!`)
    }
    if (typeof isAnchorAlignCenter !== 'boolean') {
      isAnchorAlignCenter = false
      console.error(`DragDropBlocks module: anchorAlignCenter can only be a boolean or function!`)
    }

    // set the vertical alignment of anchor
    if (isAnchorAlignCenter) {
      this.activeAnchor.classList.add('cu-draggable-anchor-center')
    }

    css(this.activeAnchor, {
      position: 'absolute',
      width: `${ICON_DRAG_ANCHOR_WIDTH}px`,
      height: `${activeRootRect.height}px`,
      left: `${activeRootRect.left - containerRect.left + parent.scrollLeft - ICON_DRAG_ANCHOR_WIDTH + anchorOffsetLeft}px`,
      top: `${activeRootRect.top - containerRect.top + parent.scrollTop + anchorOffsetTop}px`,
      zIndex: `${this.options.zIndex || DEFAULT_ZINDEX}`
    })

    this.activeAnchor.querySelector('.cu-draggable-anchor-icon')
      .addEventListener('dragstart', dragStartHandler.bind(this))
    this.activeAnchor.querySelector('.cu-draggable-anchor-icon')
      .addEventListener('dragend', dragEndHanlder.bind(this))

    function dragStartHandler(e) {
      this.dragging = true
      e.dataTransfer.setData('text/html', this.draggingRoot.domNode.outerHTML)
      e.dataTransfer.effectAllowed = 'move'
      if (this.quill.root && this.quill.root.classList) {
        this.quill.root.classList.add('ql-dragging-blocks')
      }

      const draggingDom = this.draggingRoot && this.draggingRoot.domNode
      if (
        draggingDom &&
        draggingDom.classList
      ) {
        draggingDom.classList.add('ql-dragging-block-active')
      }
    }

    function dragEndHanlder(e) {
      if (!this.dragging) return
      this.dragging = false
      this.resetDraggingHelpLine()
      if (this.quill.root && this.quill.root.classList) {
        this.quill.root.classList.remove('ql-dragging-blocks')
      }

      // change order for blocks
      if (this.draggingRoot !== this.dropRefRoot) {
        if (this.dropRefRoot) {
          this.dropRefRoot.parent.insertBefore(this.draggingRoot, this.dropRefRoot)
        } else if (this.dragOverRoot) {
          this.dragOverRoot.parent.insertBefore(this.draggingRoot, null)
        }
      }

      const draggingDom = this.draggingRoot && this.draggingRoot.domNode
      if (
        draggingDom &&
        draggingDom.classList
      ) {
        draggingDom.classList.remove('ql-dragging-block-active')
      }

      this.hideDraggableAnchor()

      // reposition table tools
      setTimeout(() => {
        const tableModule = this.quill.getModule('table')
        if (!!tableModule.table) {
          tableModule.columnTool && tableModule.columnTool.reposition()
          tableModule.rowTool && tableModule.rowTool.reposition()
          tableModule.tableTool && tableModule.tableTool.reposition()
        }
      }, 1)
    }
  }
}

export { DragDropBlocks as default }
