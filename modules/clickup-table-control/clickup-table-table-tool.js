import Quill from '../../quill'
import { css } from './utils'
import IconManager from './clickup-icon-manager'
import Dropdown from './clickup-table-table-dropdown'

export const TableToolSize = 12

export default class TableTableControl {
  constructor (table, quill, options) {
    if (!table) return null
    this.table = table
    this.quill = quill
    this.options = options.tableTools || {}
    this.domNode = null
    this.activeDropdown = null
    this.helpRect = null
    this.iconManager = new IconManager()

    this.initTableTool()
  }

  initTableTool () {
    const parent = this.quill.root.parentNode
    const containerRect = parent.getBoundingClientRect()
    const tableViewRect = this.table.parentNode.getBoundingClientRect()

    this.domNode = document.createElement('div')
    this.domNode.classList.add('cu-table-tool')
    parent.appendChild(this.domNode)
    css(this.domNode, {
      width: `${TableToolSize}px`,
      height: `${TableToolSize}px`,
      left: `${tableViewRect.left - containerRect.left + parent.scrollLeft - TableToolSize}px`,
      top: `${tableViewRect.top - containerRect.top - TableToolSize + parent.scrollTop}px`,
      zIndex: `${this.options.zIndex || 100}`
    })

    this.domNode.addEventListener('click', e => {
      const tableModule = this.quill.getModule('table')
      tableModule.closeToolsDropdown()

      this.activeDropdown = new Dropdown(this)
      this.setCellToActive()
    }, false)
  }

  setCellToActive() {
    this.domNode.classList.add('active')
    const tableViewRect = this.table.parentNode.getBoundingClientRect()
    const tableRect = this.table.getBoundingClientRect()
    this.helpRect = document.createElement('div')
    this.helpRect.classList.add('cu-help-rect')
    css(this.helpRect, {
      position: 'fixed',
      width: `${Math.min(tableRect.width, tableViewRect.width)}px`,
      height: `${tableViewRect.height}px`,
      top: `${tableViewRect.top}px`,
      left: `${tableViewRect.left}px`,
      zIndex: `${this.options.zIndex || 100}`
    })
    document.body.appendChild(this.helpRect)
  }

  setCellToInActive() {
    this.domNode.classList.remove('active')
    this.helpRect && this.helpRect.remove()
    this.helpRect = null
  }

  destroy () {
    this.domNode.remove()
    return null
  }
}
