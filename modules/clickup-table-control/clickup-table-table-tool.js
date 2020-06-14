import Quill from '../../quill'
import { css } from './utils'
import IconManager from './clickup-icon-manager'
import Dropdown from './clickup-table-table-dropdown'

export const TableToolSize = 12

export default class TableRowControl {
  constructor (table, quill, options) {
    if (!table) return null
    this.table = table
    this.quill = quill
    this.options = options
    this.domNode = null
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
      top: `${tableViewRect.top - containerRect.top - TableToolSize + parent.scrollTop}px`
    })

    this.domNode.addEventListener('click', () => {
      const dropdown = new Dropdown(this)
    }, false)
  }

  destroy () {
    this.domNode.remove()
    return null
  }
}
