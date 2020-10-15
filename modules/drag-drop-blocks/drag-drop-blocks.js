import Delta from 'quill-delta';
import Quill from '../../core/quill';
import Module from '../../core/module';
import Break from '../../blots/break'
import Block from '../../blots/block'

import {
  getDraggableRootBlot,
  getDropableRootBlot,
  isInlineRoot,
  css
} from './utils'
import { update } from 'lodash';

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
    // for togglelist placeholder
    this.dragOverPlaceholder = null
    this.draggingBlots = [] // Only existed when user is dragging listItem or multiple blocks(have highlighted content)

    this.quill.root.addEventListener('keydown', evt => {
      this.hideDraggableAnchor()
    })

    this.quill.root.addEventListener('mousemove', evt => {
      if (this.dragging || !this.quill.getSelection()) return
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
        if (
          curRoot &&
          typeof curRoot.formats === 'function' &&
          curRoot.formats() &&
          curRoot.formats().list
        ) {
          const childrenItems = curRoot.getListItemChildren()
          this.draggingBlots = childrenItems.length > 0 ? [curRoot].concat(childrenItems) : []
        }
        // if dragging a listitem
        this.showDraggableAnchor(curBlot, target)
      } else if (!curRoot) {
        this.hideDraggableAnchor()
      }
    }, false)

    this.quill.root.addEventListener('dragover', evt => {
      evt.preventDefault()
      evt.stopPropagation()
      if (!this.dragging) return

      // dragging over the toggle list placeholder
      if (
        evt.target.classList.contains('ql-togglelist-placeholder') &&
        evt.target.parentNode.tagName === 'LI'
      ) {
        const allowDragIntoToggle = typeof this.options.allowDragIntoToggle === 'function'
          ? this.options.allowDragIntoToggle(this.draggingRoot)
          : true
        this.resetDraggingHelpLine()
        const selection = document.getSelection();
        selection.removeAllRanges()
        this.dragOverPlaceholder = evt.target
        if (
          this.draggingBlots.length === 0 &&
          (this.draggingRoot instanceof Block || this.isInlineRoot(this.draggingRoot)) &&
          allowDragIntoToggle
        ) {
          if (
            !this.dragOverPlaceholder.classList.contains('allowed-active') &&
            !this.dragOverPlaceholder.classList.contains('not-allowed-active')
          ) {
            this.dragOverPlaceholder.classList.add('allowed-active')
          }
        } else {
          if (
            !this.dragOverPlaceholder.classList.contains('allowed-active') &&
            !this.dragOverPlaceholder.classList.contains('not-allowed-active')
          ) {
            this.dragOverPlaceholder.classList.add('not-allowed-active')
          }
        }
        this.dragOverRoot = null
        this.dropRefRoot = null
        return;
      } else {
        this.resetDragOverPlaceholder()
      }

      // dragging inline blot
      if (
        this.draggingBlots.length === 0 &&
        this.isInlineRoot(this.draggingRoot)
      ) {
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
      if (
        (this.dragOverRoot && this.draggingRoot === this.dragOverRoot) ||
        (this.draggingBlots.length > 0 && this.draggingBlots.indexOf(this.dragOverRoot) > 0)
      ) {
        this.resetDraggingHelpLine()
        this.dragOverRoot = null
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

      if (
        this.options.dragOverCallback &&
        typeof this.options.dragOverCallback === 'function'
      ) {
        this.options.dragOverCallback(evt, this.dragOverRoot)
      }
    }, false)

    this.quill.root.addEventListener('drop', evt => {
      evt.preventDefault()
      evt.stopPropagation()
      if (!this.dragging || !this.isInlineRoot(this.draggingRoot)) return

      const native = this.getNativeSelection(evt)
      if (!native || this.draggingBlots.length > 0) {
        return;
      }

      const draggingBlotIndex = this.quill.getIndex(this.draggingRoot)
      const draggingBlotLength = this.draggingRoot.length()
      const draggingBlotDelta = this.quill.getContents(draggingBlotIndex, draggingBlotLength)
      let diff;
      let format;
      // drop inline blot into the placeholder of toggle list
      if (this.dragOverPlaceholder) {
        const list = Quill.find(this.dragOverPlaceholder.parentNode, true)
        const listIndex = this.quill.getIndex(list)
        const listFormats = list.formats()
        const listIndent = listFormats.indent || 0

        if (listIndex > draggingBlotIndex) {
          diff = new Delta()
            .retain(draggingBlotIndex)
            .delete(draggingBlotLength)
            .retain(listIndex - draggingBlotIndex - draggingBlotLength + list.length())
            .concat(draggingBlotDelta)
            .insert('\n', {
              list: Object.assign(
                {},
                listFormats.list,
                { list: 'none' }
              ),
              indent: listIndent + 1
            })
        } else {
          diff = new Delta()
            .retain(listIndex + list.length())
            .concat(draggingBlotDelta)
            .insert('\n', {
              list: Object.assign(
                {},
                listFormats.list,
                { list: 'none' }
              ),
              indent: listIndent + 1
            })
            .retain(draggingBlotIndex - listIndex - list.length())
            .delete(draggingBlotLength);
        }

        this.quill.updateContents(diff, Quill.sources.USER);
        return;
      }

      // drop inline blot into any blocks
      const normalized = this.quill.selection.normalizeNative(native);
      const targetRange = this.quill.selection.normalizedToRange(normalized);
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
  
  resetDragOverPlaceholder () {
    if (this.dragOverPlaceholder) {
      this.dragOverPlaceholder.classList.remove('allowed-active')
      this.dragOverPlaceholder.classList.remove('not-allowed-active')
      // this.dragOverPlaceholder.removeAttribute('style')
      this.dragOverPlaceholder = null
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
        typeof this.options.anchorOffsetTop === 'function'
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
    if (typeof anchorOffsetTop !== 'number') {
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

      if (this.draggingBlots.length > 0) {
        this.draggingBlots.forEach(blot => {
          const node = blot && blot.domNode
          if (
            node &&
            node.classList
          ) {
            node.classList.add('ql-dragging-block-active')
          }
        })
      }

      if (
        this.options.dragStartCallback &&
        typeof this.options.dragStartCallback === 'function'
      ) {
        this.options.dragStartCallback(e, this.draggingRoot)
      }
    }

    function dragEndHanlder(e) {
      if (!this.dragging) return
      this.dragging = false
      this.resetDraggingHelpLine()
      if (this.quill.root && this.quill.root.classList) {
        this.quill.root.classList.remove('ql-dragging-blocks')
      }

      const draggingRootIndex = this.quill.getIndex(this.draggingRoot)
      const draggingRootLength = this.draggingRoot.length()
      // drop blocks into toggle list placeholder
      const allowDragIntoToggle = typeof this.options.allowDragIntoToggle === 'function'
        ? this.options.allowDragIntoToggle(this.draggingRoot)
        : true
      if (
        !this.isInlineRoot(this.draggingRoot) &&
        this.draggingRoot instanceof Block &&
        allowDragIntoToggle &&
        this.dragOverPlaceholder &&
        this.draggingBlots.length === 0
      ) {
        const list = Quill.find(this.dragOverPlaceholder.parentNode, true)
        const listIndex = this.quill.getIndex(list)
        const listFormats = list.formats()
        const listIndent = listFormats.indent || 0
        const insertDelta = this.quill.getContents(draggingRootIndex, draggingRootLength)

        let diff
        let format
        if (listIndex > draggingRootIndex) {
          diff = new Delta()
            .retain(draggingRootIndex)
            .delete(draggingRootLength)
            .retain(listIndex - draggingRootIndex - draggingRootLength + list.length())
            .concat(insertDelta);

          format = new Delta()
            .retain(listIndex + list.length() - 1)
            .retain(1, {
              list: Object.assign(
                {},
                listFormats.list,
                { list: 'none' }
              ),
              indent: listIndent + 1
            });
        } else {
          diff = new Delta()
            .retain(listIndex + list.length())
            .concat(insertDelta)
            .retain(draggingRootIndex - listIndex - list.length())
            .delete(draggingRootLength);

          format = new Delta()
            .retain(listIndex + list.length() + draggingRootLength - 1)
            .retain(1, {
              list: Object.assign(
                {},
                listFormats.list,
                { list: 'none' }
              ),
              indent: listIndent + 1
            });
        }
        diff = diff.compose(format)
        this.quill.updateContents(diff, Quill.sources.USER);
      } else if (
        !this.isInlineRoot(this.draggingRoot) &&
        this.draggingRoot !== this.dropRefRoot &&
        this.draggingBlots.length === 0
      ) {
        let targetIndex
        let targetLength
        let updates = new Delta()
        let movedContent = new Delta()

        if (this.dropRefRoot) { // Put draggingContent in front of the target content
          targetIndex = this.quill.getIndex(this.dropRefRoot);
          targetLength = this.dropRefRoot.length();

          if (draggingRootIndex < targetIndex) {
            movedContent = this.quill.getContents(draggingRootIndex, draggingRootLength)

            const deletes = new Delta()
              .retain(draggingRootIndex)
              .delete(draggingRootLength)

            const inserts = new Delta()
              .retain(targetIndex - draggingRootLength)
              .concat(movedContent)

            updates = deletes.compose(inserts)
          } else {
            movedContent = this.quill.getContents(targetIndex, draggingRootIndex - targetIndex);

            const deletes = new Delta()
              .retain(targetIndex)
              .delete(draggingRootIndex - targetIndex)

            const inserts = new Delta()
              .retain(targetIndex + draggingRootLength)
              .concat(movedContent)

            updates = deletes.compose(inserts)
          }
        } else if (this.dragOverRoot) { // Put draggingContnet behind the target content
          targetIndex = this.quill.getIndex(this.dragOverRoot)
          targetLength = this.dragOverRoot.length()
          
          if (draggingRootIndex < targetIndex) {
            movedContent = this.quill.getContents(draggingRootIndex, draggingRootLength)

            const deletes = new Delta()
              .retain(draggingRootIndex)
              .delete(draggingRootLength)

            const inserts = new Delta()
              .retain(targetIndex + targetLength - draggingRootLength)
              .concat(movedContent)

            updates = deletes.compose(inserts)
          } else {
            movedContent = this.quill.getContents(targetIndex + targetLength, draggingRootIndex - targetIndex - targetLength);

            const deletes = new Delta()
              .retain(targetIndex + targetLength)
              .delete(draggingRootIndex - targetIndex - targetLength)

            const inserts = new Delta()
              .retain(targetIndex + targetLength + draggingRootLength)
              .concat(movedContent)

            updates = deletes.compose(inserts)
          }
        }
        this.quill.updateContents(updates, Quill.sources.USER);
      } else if (
        !this.isInlineRoot(this.draggingRoot) &&
        this.draggingBlots.length > 0 &&
        this.draggingBlots.indexOf(this.dragOverRoot) < 0 &&
        this.draggingRoot !== this.dropRefRoot
      ) {
        const draggingBlotsIndex = this.quill.getIndex(this.draggingBlots[0])
        const draggingBlotsLength = this.draggingBlots.reduce((len, blot) => {
          len = len + blot.length()
          return len
        }, 0)
        let targetIndex
        let targetLength
        let updates = new Delta()
        let movedContent = new Delta()

        if (this.dropRefRoot) { // Put draggingContent in front of the target content
          targetIndex = this.quill.getIndex(this.dropRefRoot);
          targetLength = this.dropRefRoot.length();

          if (draggingRootIndex < targetIndex) {
            movedContent = this.quill.getContents(draggingBlotsIndex, draggingBlotsLength)

            const deletes = new Delta()
              .retain(draggingBlotsIndex)
              .delete(draggingBlotsLength)

            const inserts = new Delta()
              .retain(targetIndex - draggingBlotsLength)
              .concat(movedContent)

            updates = deletes.compose(inserts)
          } else {
            movedContent = this.quill.getContents(targetIndex, draggingBlotsIndex - targetIndex);

            const deletes = new Delta()
              .retain(targetIndex)
              .delete(draggingBlotsIndex - targetIndex)

            const inserts = new Delta()
              .retain(targetIndex + draggingBlotsLength)
              .concat(movedContent)

            updates = deletes.compose(inserts)
          }
        } else if (this.dragOverRoot) { // Put draggingContnet behind the target content
          targetIndex = this.quill.getIndex(this.dragOverRoot)
          targetLength = this.dragOverRoot.length()
          
          if (draggingRootIndex < targetIndex) {
            movedContent = this.quill.getContents(draggingBlotsIndex, draggingBlotsLength)

            const deletes = new Delta()
              .retain(draggingBlotsIndex)
              .delete(draggingBlotsLength)

            const inserts = new Delta()
              .retain(targetIndex + targetLength - draggingBlotsLength)
              .concat(movedContent)

            updates = deletes.compose(inserts)
          } else {
            movedContent = this.quill.getContents(targetIndex + targetLength, draggingBlotsIndex - targetIndex - targetLength);

            const deletes = new Delta()
              .retain(targetIndex + targetLength)
              .delete(draggingBlotsIndex - targetIndex - targetLength)

            const inserts = new Delta()
              .retain(targetIndex + targetLength + draggingBlotsLength)
              .concat(movedContent)

            updates = deletes.compose(inserts)
          }
        }
        this.quill.updateContents(updates, Quill.sources.USER);
      }

      const draggingDom = this.draggingRoot && this.draggingRoot.domNode
      if (
        draggingDom &&
        draggingDom.classList
      ) {
        draggingDom.classList.remove('ql-dragging-block-active')
      }

      if (this.draggingBlots.length > 0) {
        this.draggingBlots.forEach(blot => {
          const node = blot && blot.domNode
          if (
            node &&
            node.classList
          ) {
            node.classList.remove('ql-dragging-block-active')
          }
        })
      }

      this.hideDraggableAnchor()
      this.resetDragOverPlaceholder()

      if (
        this.options.dragEndCallback &&
        typeof this.options.dragEndCallback === 'function'
      ) {
        this.options.dragEndCallback(e)
      }

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
