import Delta from 'quill-delta';
import Quill from '../../core/quill';
import Module from '../../core/module';

import { getDraggableRootBlot, css } from './utils'

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
    this.dropRefRoot = null
    this.activeAnchor = null
    this.draggingHelpLine = this.quill.addContainer('cu-dragging-help-line')

    const parent = this.quill.root.parentNode
    const containerRect = parent.getBoundingClientRect()

    this.quill.root.addEventListener('mouseover', evt => {
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
        this.showDraggableAnchor()
      } else if (!curRoot) {
        this.hideDraggableAnchor()
      }
    }, false)

    this.quill.root.addEventListener('dragover', evt => {
      evt.preventDefault()
      const target = evt.target
      const overBlot = Quill.find(target, true)
      const overRoot = this.getDraggableRootBlot(overBlot, target)
      if (!overRoot) return

      if (overRoot && this.draggingRoot === overRoot) {
        this.resetDraggingHelpLine()
      } else if (overRoot && this.draggingRoot !== overRoot) {
        const overRootRect = overRoot.domNode.getBoundingClientRect()
        const offsetY = evt.clientY - overRootRect.top
        if (offsetY < overRootRect.height / 2) {
          css(this.draggingHelpLine, {
            position: 'absolute',
            width: `${overRootRect.width}px`,
            left: `${overRootRect.left - containerRect.left + parent.scrollLeft}px`,
            top: `${overRootRect.top - containerRect.top + parent.scrollTop - HELP_LINE_HEIGHT}px`,
            zIndex: `${this.options.zIndex || DEFAULT_ZINDEX}`,
            display: 'block'
          })
          this.dropRefRoot = overRoot
        } else {
          css(this.draggingHelpLine, {
            position: 'absolute',
            width: `${overRootRect.width}px`,
            left: `${overRootRect.left - containerRect.left + parent.scrollLeft}px`,
            top: `${overRootRect.top - containerRect.top + parent.scrollTop + overRootRect.height}px`,
            zIndex: `${this.options.zIndex || DEFAULT_ZINDEX}`,
            display: 'block'
          })
          this.dropRefRoot = overRoot.next
        }
      }
    }, false)

    this.quill.root.addEventListener('drop', evt => {
      if (this.draggingRoot !== this.dropRefRoot) {
        if (this.dropRefRoot) {
          this.dropRefRoot.parent.insertBefore(this.draggingRoot, this.dropRefRoot)
        } else {
          this.quill.scroll.insertBefore(this.draggingRoot, this.dropRefRoot)
        }
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
    }, false)
  }

  getDraggableRootBlot (blot, node) {
    if (this.options.getDraggableRootBlot) {
      return this.options.getDraggableRootBlot(blot, node)
    }
    return getDraggableRootBlot(blot, node)
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
    // !!this.draggingRoot && this.draggingRoot.domNode.removeAttribute('draggable')
    this.activeAnchor && this.activeAnchor.remove()
    this.draggingRoot = null
  }

  showDraggableAnchor () {
    if (!this.draggingRoot) return
    this.activeAnchor = this.quill.addContainer('cu-draggable-anchor')
    // this.draggingRoot.domNode.setAttribute('draggable', true)
    const dragIcon = document.createElement('div')
    dragIcon.classList.add('cu-draggable-anchor-icon')
    dragIcon.innerHTML = ICON_DRAG_ANCHOR
    dragIcon.setAttribute('draggable', true)
    this.activeAnchor.appendChild(dragIcon)

    const parent = this.quill.root.parentNode
    const containerRect = parent.getBoundingClientRect()
    const activeRootRect = this.draggingRoot.domNode.getBoundingClientRect()

    css(this.activeAnchor, {
      position: 'absolute',
      width: `${ICON_DRAG_ANCHOR_WIDTH}px`,
      height: `${activeRootRect.height}px`,
      left: `${activeRootRect.left - containerRect.left + parent.scrollLeft - ICON_DRAG_ANCHOR_WIDTH - 2}px`,
      top: `${activeRootRect.top - containerRect.top + parent.scrollTop}px`,
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
    }

    function dragEndHanlder(e) {
      this.dragging = false
      this.resetDraggingHelpLine()
    }
  }
}

export { DragDropBlocks as default }
