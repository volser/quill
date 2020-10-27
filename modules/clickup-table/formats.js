import Quill from "../../core/quill"
import Delta from "quill-delta"
import { css } from "../clickup-table-control/utils"
import { THE_KEY_FOR_EXPANDED_TOGGLE_LIST } from '../clickup-storage/storage'

const Block = Quill.import("blots/block")
const Container = Quill.import("blots/container")
const Break = Quill.import("blots/break")

const COL_ATTRIBUTES = ["width"]
const COL_DEFAULT = {
  width: 150
}
const CELL_IDENTITY_KEYS = ["row", "cell"]
const CELL_ATTRIBUTES = ["rowspan", "colspan"]
const CELL_DEFAULT = {
  rowspan: 1,
  colspan: 1
}

const WIDE_TABLE_CLASS = 'clickup-table-view_wide';
const WIDE_TABLE_WIDTH = 730;

class TableCellLine extends Block {
  static create(value) {
    const node = super.create(value)

    CELL_IDENTITY_KEYS.forEach(key => {
      let identityMaker = key === 'row'
        ? rowId : cellId
      node.setAttribute(`data-${key}`, value[key] || identityMaker())
    })

    CELL_ATTRIBUTES.forEach(attrName => {
      node.setAttribute(`data-${attrName}`, value[attrName] || CELL_DEFAULT[attrName])
    })

    return node
  }

  static formats(domNode) {
    const formats = {}

    return CELL_ATTRIBUTES.concat(CELL_IDENTITY_KEYS).reduce((formats, attribute) => {
      if (domNode.hasAttribute(`data-${attribute}`)) {
        formats[attribute] = domNode.getAttribute(`data-${attribute}`) || undefined
      }
      return formats
    }, formats)
  }

  format(name, value) {
    if (CELL_ATTRIBUTES.concat(CELL_IDENTITY_KEYS).indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(`data-${name}`, value)
      } else {
        this.domNode.removeAttribute(`data-${name}`)
      }
    } else if (name === 'list') {
      if (typeof value === 'string') {
        const { row, cell, rowspan, colspan } = TableCellLine.formats(this.domNode)
        super.format(name, {
          list: value,
          row,
          cell,
          rowspan,
          colspan
        })
      } else {
        super.format(name, value)
      }
    } else {
      super.format(name, value)
    }
  }

  optimize(context) {
    // cover shadowBlot's wrap call, pass params parentBlot initialize
    // needed
    const cellId = this.domNode.getAttribute('data-cell')
    const rowId = this.domNode.getAttribute('data-row')
    const rowspan = this.domNode.getAttribute('data-rowspan')
    const colspan = this.domNode.getAttribute('data-colspan')
    if (this.statics.requiredContainer &&
      !(this.parent instanceof this.statics.requiredContainer)) {
      this.wrap(this.statics.requiredContainer.blotName, {
        cell: cellId,
        row: rowId,
        colspan,
        rowspan
      })
    } else if (
      this.parent instanceof this.statics.requiredContainer &&
      this.parent.formats().cell !== cellId
    ) {
      this.wrap(this.statics.requiredContainer.blotName, {
        cell: cellId,
        row: rowId,
        colspan,
        rowspan
      })
    }
    super.optimize(context)
  }

  tableCell() {
    return this.parent
  }
}
TableCellLine.blotName = "table-cell-line"
TableCellLine.className = "qlbt-cell-line"
TableCellLine.tagName = "DIV"

class TableCell extends Container {
  checkMerge() {
    if (super.checkMerge() && this.next.children.head != null) {
      const thisHead = this.children.head.formats()[this.children.head.statics.blotName] ||
        this.children.head.formats()
      const thisTail = this.children.tail.formats()[this.children.tail.statics.blotName] ||
        this.children.tail.formats()
      const nextHead = this.next.children.head.formats()[this.next.children.head.statics.blotName] ||
        this.next.children.head.formats()
      const nextTail = this.next.children.tail.formats()[this.next.children.tail.statics.blotName] ||
        this.next.children.tail.formats()

      return (
        thisHead.cell === thisTail.cell &&
        thisHead.cell === nextHead.cell &&
        thisHead.cell === nextTail.cell
      )
    }
    return false
  }

  static create(value) {
    const node = super.create(value)
    node.setAttribute("data-row", value.row)
    node.setAttribute("data-cell", value.cell)

    CELL_ATTRIBUTES.forEach(attrName => {
      if (value[attrName]) {
        node.setAttribute(attrName, value[attrName])
      }
    })

    return node
  }

  static formats(domNode) {
    const formats = {}

    if (domNode.hasAttribute("data-row")) {
      formats["row"] = domNode.getAttribute("data-row")
    }

    if (domNode.hasAttribute("data-cell")) {
      formats["cell"] = domNode.getAttribute("data-cell")
    }

    return CELL_ATTRIBUTES.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute)
      }

      return formats
    }, formats)
  }

  cellOffset() {
    if (this.parent) {
      return this.parent.children.indexOf(this)
    }
    return -1
  }

  formats() {
    const formats = {}

    if (this.domNode.hasAttribute("data-row")) {
      formats["row"] = this.domNode.getAttribute("data-row")
    }

    if (this.domNode.hasAttribute("data-cell")) {
      formats["cell"] = this.domNode.getAttribute("data-cell")
    }

    return CELL_ATTRIBUTES.reduce((formats, attribute) => {
      if (this.domNode.hasAttribute(attribute)) {
        formats[attribute] = this.domNode.getAttribute(attribute)
      }

      return formats
    }, formats)
  }

  toggleAttribute(name, value) {
    if (value) {
      this.domNode.setAttribute(name, value)
    } else {
      this.domNode.removeAttribute(name)
    }
  }

  formatChildren(name, value) {
    this.children.forEach(child => {
      child.format(name, value)
    })
  }

  format(name, value) {
    if (CELL_ATTRIBUTES.indexOf(name) > -1) {
      this.toggleAttribute(name, value)
      this.formatChildren(name, value)
    } else if (['row'].indexOf(name) > -1) {
      this.toggleAttribute(`data-${name}`, value)
      this.formatChildren(name, value)
    } else {
      super.format(name, value)
    }
  }

  optimize(context) {
    const rowId = this.domNode.getAttribute("data-row")

    if (this.statics.requiredContainer &&
      !(this.parent instanceof this.statics.requiredContainer)) {
      this.wrap(this.statics.requiredContainer.blotName, {
        row: rowId
      })
    } else if (
      this.parent instanceof this.statics.requiredContainer &&
      this.parent.formats().row !== rowId
    ) {
      this.wrap(this.statics.requiredContainer.blotName, {
        row: rowId
      })
    }
    super.optimize(context)
  }

  row() {
    return this.parent
  }

  rowOffset() {
    if (this.row()) {
      return this.row().rowOffset()
    }
    return -1
  }

  table() {
    return this.row() && this.row().table()
  }
}
TableCell.blotName = "table"
TableCell.tagName = "TD"

class TableRow extends Container {
  checkMerge() {
    if (super.checkMerge() && this.next.children.head != null) {
      const thisHead = this.children.head instanceof TableCell && this.children.head.formats()
      const thisTail = this.children.tail instanceof TableCell && this.children.tail.formats()
      const nextHead = this.next.children.head instanceof TableCell && this.next.children.head.formats()
      const nextTail = this.next.children.tail instanceof TableCell && this.next.children.tail.formats()

      return (
        thisHead &&
        thisTail &&
        nextHead &&
        nextTail &&
        thisHead.row === thisTail.row &&
        thisHead.row === nextHead.row &&
        thisHead.row === nextTail.row
      )
    }
    return false
  }

  static create(value) {
    const node = super.create(value)
    node.setAttribute("data-row", value.row)
    return node
  }

  formats() {
    return ["row"].reduce((formats, attrName) => {
      if (this.domNode.hasAttribute(`data-${attrName}`)) {
        formats[attrName] = this.domNode.getAttribute(`data-${attrName}`)
      }
      return formats
    }, {})
  }

  optimize(context) {
    // optimize function of ShadowBlot
    if (
      this.statics.requiredContainer &&
      !(this.parent instanceof this.statics.requiredContainer)
    ) {
      this.wrap(this.statics.requiredContainer.blotName)
    }

    super.optimize(context)
  }

  rowOffset() {
    if (this.parent) {
      return this.parent.children.indexOf(this)
    }
    return -1
  }

  table() {
    return this.parent && this.parent.parent
  }
}
TableRow.blotName = "table-row"
TableRow.tagName = "TR"

class TableBody extends Container { }
TableBody.blotName = "table-body"
TableBody.tagName = "TBODY"

class TableCol extends Block {
  static create(value) {
    let node = super.create(value)
    COL_ATTRIBUTES.forEach(attrName => {
      node.setAttribute(`${attrName}`, value[attrName] || COL_DEFAULT[attrName])
    })
    return node
  }

  static formats(domNode) {
    return COL_ATTRIBUTES.reduce((formats, attribute) => {
      if (domNode.hasAttribute(`${attribute}`)) {
        formats[attribute] =
          domNode.getAttribute(`${attribute}`) || undefined
      }
      return formats
    }, {})
  }

  format(name, value) {
    if (COL_ATTRIBUTES.indexOf(name) > -1) {
      this.domNode.setAttribute(`${name}`, value || COL_DEFAULT[name])
    } else if (
      name === TableCol.blotName ||
      name === TableCellLine.blotName
    ) {
      super.format(name, value)
    }
  }

  html() {
    return this.domNode.outerHTML
  }
}
TableCol.blotName = "table-col"
TableCol.tagName = "col"

class TableColGroup extends Container { }
TableColGroup.blotName = "table-col-group"
TableColGroup.tagName = "colgroup"

class TableContainer extends Container {
  static create() {
    let node = super.create()
    return node
  }

  constructor(scroll, domNode) {
    super(scroll, domNode)
    this.updateTableWidth()
  }

  balanceCells() {
    if (this.descendants(TableCell).length <= 0) {
      this.remove()
      return false
    }

    setTimeout(() => {
      this.rebuildWholeTable()
      this.updateTableWidth()
    }, 0)
  }

  // call this when a table was broken
  rebuildWholeTable() {
    let colGroup = this.colGroup()
    const [body] = this.descendants(TableBody)
    const rows = this.descendants(TableRow);
    const maxColumns = rows.reduce((max, row) => {
      return Math.max(row.children.length, max);
    }, 0);

    // rebuild table column group
    if (!colGroup) {
      colGroup = this.scroll.create(TableColGroup.blotName, true)
      new Array(maxColumns).fill(0).forEach(() => {
        const tableCol = this.scroll.create(TableCol.blotName, true)
        colGroup.appendChild(tableCol)
        tableCol.optimize()
      })
      this.insertBefore(colGroup, body)
    } else {
      const differ = maxColumns - colGroup.children.length
      if (differ > 0) {
        new Array(differ).fill(0).forEach(() => {
          const tableCol = this.scroll.create(TableCol.blotName, true)
          colGroup.appendChild(tableCol)
          tableCol.optimize()
        })
      } else if (differ < 0) {
        new Array(Math.abs(differ)).fill(0).forEach(() => {
          colGroup.children.tail.remove()
        })
      }

      // workaround: fix table col missed child break node when a block dragged above the table,
      // throw error: leaf.position is not a function.
      colGroup.children.forEach(child => {
        if (child.children.length === 0) {
          child.optimize()
        }
      })
    }

    // rebuild missing table cells
    rows.forEach(row => {
      new Array(maxColumns - row.children.length).fill(0).forEach(() => {
        const cell = cellId()
        const tableCell = this.scroll.create(
          TableCell.blotName,
          Object.assign({}, CELL_DEFAULT, {
            row: row.formats().row,
            cell
          })
        )
        const cellLine = this.scroll.create(
          TableCellLine.blotName,
          Object.assign({}, CELL_DEFAULT, {
            row: row.formats().row,
            cell
          })
        )
        tableCell.appendChild(cellLine)
        row.appendChild(tableCell)
        cellLine.optimize()
      });
    });
  }

  updateTableWidth() {
    setTimeout(() => {
      const colGroup = this.colGroup()
      if (!colGroup || !this.domNode.parentNode) return
      const tableWidth = colGroup.children.reduce((sumWidth, col) => {
        sumWidth = sumWidth + parseInt(col.formats()[TableCol.blotName].width, 10)
        return sumWidth
      }, 0)
      this.domNode.style.width = `${tableWidth}px`
      if (tableWidth > WIDE_TABLE_WIDTH) {
        this.domNode.parentNode.classList.add(WIDE_TABLE_CLASS);
      } else {
        this.domNode.parentNode.classList.remove(WIDE_TABLE_CLASS);
      }
      // reposition table tools
      const editorElem = this.scroll.domNode
      if (editorElem) {
        const editorStyles = window.getComputedStyle(editorElem, null)
        const pl = parseInt(editorStyles.getPropertyValue('padding-left'), 10)
        const pr = parseInt(editorStyles.getPropertyValue('padding-right'), 10)
        const editorWidth = parseInt(editorStyles.getPropertyValue('width'), 10)

        if (tableWidth <= WIDE_TABLE_WIDTH) {
          this.domNode.parentNode.style.maxWidth = ''
        } else if (
          tableWidth < editorWidth - pl - pr &&
          tableWidth > WIDE_TABLE_WIDTH
        ) {
          this.domNode.parentNode.style.maxWidth = `${tableWidth + 1}px`
        } else {
          this.domNode.parentNode.style.maxWidth = `100%`
        }

        const quill = Quill.find(editorElem.parentNode)
        const tableModule = quill.getModule('table')
        if (tableModule && tableModule.table) {
          tableModule.columnTool && tableModule.columnTool.reposition()
          tableModule.rowTool && tableModule.rowTool.reposition()
          tableModule.tableTool && tableModule.tableTool.reposition()
        }
      }
    }, 0)
  }

  remove() {
    const quill = Quill.find(this.scroll.domNode.parentNode)
    const tableModule = quill.getModule('table')
    tableModule.hideTableTools()
    super.remove()
  }

  cells(column) {
    return this.rows().map(row => row.children.at(column))
  }

  colGroup() {
    return (
      this.children.head instanceof TableColGroup &&
      this.children.head
    ) || null
  }

  rows() {
    const body = this.children.tail
    if (body == null) return []
    return body.children.map(row => row)
  }

  insertColumn(index, isRight = true) {
    const quill = Quill.find(this.scroll.domNode.parentNode)
    const [body] = this.descendants(TableBody)
    const [colGroup] = this.descendants(TableColGroup)
    if (
      body == null ||
      body.children.head == null ||
      colGroup == null
    ) {
      return;
    }

    // insert tableCol at first
    const thisCol = colGroup.children.at(index)
    const thisColIndex = quill.getIndex(thisCol)
    const thisColLength = thisCol.length()
    const insertNewColDelta = new Delta()
    if (isRight) {
      insertNewColDelta.retain(thisColIndex + thisColLength)
        .insert('\n', { [TableCol.blotName]: true })
    } else {
      insertNewColDelta.retain(thisColIndex)
      .insert('\n', { [TableCol.blotName]: true })
    }

    let insertNewCellsDelta = new Delta()
      .retain(quill.getLength())
      .compose(insertNewColDelta)

    let rowIndex = 0
    body.children.forEach(row => {
      const rowFormats = row.formats()
      const curCell = row.children.at(index);
      const curCellIndex = quill.getIndex(curCell)
      const curCellLength = curCell.length()
      const insertDelta = new Delta()

      if (isRight) {
        insertDelta
          .retain(curCellIndex + curCellLength + rowIndex + 1)
          .insert(
            '\n',
            {
              [TableCellLine.blotName]: Object.assign(
                {},
                CELL_DEFAULT,
                {
                  row: rowFormats.row,
                  cell: cellId()
                }
              )
            }
          )
      } else {
        insertDelta
          .retain(curCellIndex + rowIndex + 1)
          .insert(
            '\n',
            {
              [TableCellLine.blotName]: Object.assign(
                {},
                CELL_DEFAULT,
                {
                  row: rowFormats.row,
                  cell: cellId()
                }
              )
            }
          )
      }

      insertNewCellsDelta = insertNewCellsDelta.compose(insertDelta)
      rowIndex += 1
    })

    quill.updateContents(insertNewCellsDelta, Quill.sources.USER);
  }

  deleteColumn(index) {
    const [body] = this.descendants(TableBody)
    const [colGroup] = this.descendants(TableColGroup)
    if (colGroup.children.length === 1) {
      this.remove()
    } else {
      colGroup.children.at(index).remove()
      body.children.forEach(tableRow => {
        tableRow.children.at(index).remove()
      })
      this.updateTableWidth()
    }
  }

  insertRow(index, isBottom) {
    const [tableBody] = this.descendants(TableBody)
    const thisRow = tableBody.children.at(index)
    const cellNumber = thisRow.children.length
    const ref = isBottom ? thisRow.next : thisRow
    const newRowId = rowId()

    const tableRow = this.scroll.create(TableRow.blotName, {
      row: newRowId
    })

    let tableCell
    let cellLine
    let empty
    new Array(cellNumber).fill(0).forEach(() => {
      const cell = cellId()
      tableCell = this.scroll.create(
        TableCell.blotName,
        Object.assign({}, CELL_DEFAULT, {
          row: newRowId,
          cell
        })
      )
      cellLine = this.scroll.create(
        TableCellLine.blotName,
        Object.assign({}, CELL_DEFAULT, {
          row: newRowId,
          cell
        })
      )
      empty = this.scroll.create(Break.blotName)

      cellLine.appendChild(empty)
      tableCell.appendChild(cellLine)
      tableRow.appendChild(tableCell)
    })

    if (ref) {
      tableBody.insertBefore(tableRow, ref)
    } else {
      tableBody.appendChild(tableRow)
    }
  }

  deleteRow(index) {
    const [body] = this.descendants(TableBody)
    if (body.children.length === 1) {
      this.remove()
    } else {
      body.children.at(index).remove()
    }
  }
}
TableContainer.blotName = "table-container"
TableContainer.className = "clickup-table"
TableContainer.tagName = "TABLE"

class TableView extends Container {
  constructor(scroll, domNode) {
    super(scroll, domNode)
    const quill = Quill.find(scroll.domNode.parentNode)
    domNode.addEventListener('scroll', (e) => {
      const tableModule = quill.getModule('table')
      if (tableModule.columnTool) {
        tableModule.columnTool.domNode.scrollLeft = e.target.scrollLeft

        if (tableModule.columnTool.activeDropdown) {
          tableModule.columnTool.activeDropdown.destroy()
        }
      }
    }, false)
  }

  table() {
    return this.children.head
  }
}
TableView.blotName = "table-view"
TableView.className = "clickup-table-view"
TableView.tagName = "DIV"

// Blots of List
class ListContainer extends Container {
  static create(value) {
    const node = super.create(value)

    CELL_ATTRIBUTES
      .concat(CELL_IDENTITY_KEYS)
      .concat(['list'])
      .forEach(attrName => {
        if (value[attrName]) {
          node.setAttribute(`data-${attrName}`, value[attrName])
        }
      })

    return node
  }

  static formats(domNode) {
    const formats = {}

    return CELL_ATTRIBUTES.concat(CELL_IDENTITY_KEYS)
      .concat(['list'])
      .reduce((formats, attribute) => {
        if (domNode.hasAttribute(`data-${attribute}`)) {
          formats[attribute] = domNode.getAttribute(`data-${attribute}`) || undefined
        }
        return formats
      }, formats)
  }

  formats() {
    const formats = {}

    return CELL_ATTRIBUTES.concat(CELL_IDENTITY_KEYS)
      .reduce((formats, attribute) => {
        if (this.domNode.hasAttribute(`data-${attribute}`)) {
          formats[attribute] = this.domNode.getAttribute(`data-${attribute}`) || undefined
        }
        return formats
      }, formats)
  }

  optimize(context) {
    const { row, cell, rowspan, colspan } = ListContainer.formats(this.domNode)
    if (
      row &&
      !(this.parent instanceof TableCell)
    ) {
      this.wrap(TableCell.blotName, {
        row,
        cell,
        colspan,
        rowspan
      })
    }

    super.optimize(context)
  }
}
ListContainer.blotName = 'list-container';
ListContainer.tagName = 'OL';

class ListItem extends Block {
  static create(value) {
    if (typeof value === 'string') {
      value = { list: value }
    }

    const node = super.create(value);
    CELL_IDENTITY_KEYS
      .concat(CELL_ATTRIBUTES)
      .concat(['list'])
      .forEach(key => {
        if (value[key]) node.setAttribute(`data-${key}`, value[key])
      })
    
    if (value.list === 'toggled') {
      node.setAttribute('data-toggle-id', value['toggle-id'] ? value['toggle-id'] : toggleListId())
    }

    return node;
  }

  static formats(domNode) {
    const formats = {}
    return CELL_ATTRIBUTES.concat(CELL_IDENTITY_KEYS)
      .concat(['list', 'toggle-id'])
      .reduce((formats, attribute) => {
        if (domNode.hasAttribute(`data-${attribute}`)) {
          formats[attribute] = domNode.getAttribute(`data-${attribute}`) || undefined
        }
        return formats
      }, formats)
  }

  constructor(scroll, domNode) {
    super(scroll, domNode);
    const ui = domNode.ownerDocument.createElement('span');
    const format = this.statics.formats(domNode, scroll);
    const quill = Quill.find(scroll.domNode.parentNode)
    let uiPlaceHolder  = null

    if (this.isToggleListItem()) {
      uiPlaceHolder = domNode.ownerDocument.createElement('span')
      uiPlaceHolder.innerText = ListItem.DEFAULT_TOGGLE_PLACEHOLDER
    }

    const placeholderClickHandler = e => {
      if (!scroll.isEnabled()) return;
      const index = quill.getIndex(this)
      const listFormats = this.formats()
      const newLineIndent = listFormats.indent ? (listFormats.indent + 1 ): 1
      const newLineFormats = {
        ...listFormats,
        indent: newLineIndent,
        list: Object.assign(
          {},
          listFormats.list,
          { list: 'none' }
        )
      }

      const delta = new Delta()
        .retain(index + this.length())
        .insert('\n', newLineFormats);
      quill.updateContents(delta, Quill.sources.USER);
      quill.setSelection(index + this.length(), Quill.sources.SILENT);
    }

    const storageModule = quill.getModule('storage')
    const listEventHandler = e => {
      if (!scroll.isEnabled()) return;
      const format = this.statics.formats(domNode, scroll);
      if (format.list === 'checked') {
        this.format('list', 'unchecked');
        e.preventDefault();
      } else if (format.list === 'unchecked') {
        this.format('list', 'checked');
        e.preventDefault();
      } else if (format.list === 'toggled') {
        const isExpanded = this.isThisItemExpanded()
        if (isExpanded) {
          this.collapseItem()
          if (storageModule) {
            storageModule.removeCollapsedToggleList(format['toggle-id'])
          }
        } else {
          this.expandItem()
          if (storageModule) {
            storageModule.addExpandedToggleList(format['toggle-id'])
          }
        }
        // update height of table row tool if this list was in a table
        const editorElem = scroll.domNode
        if (quill && editorElem) {
          const tableModule = quill.getModule('table')
          if (tableModule && tableModule.table && tableModule.rowTool) {
            window.setTimeout(tableModule.rowTool.updateToolCells(), 0)
          }
        }
      }
    };
    
    ui.addEventListener('click', listEventHandler);
    this.attachUI(ui);

    if (uiPlaceHolder) {
      uiPlaceHolder.addEventListener('click', placeholderClickHandler);
      this.attachUiPlaceHolder(uiPlaceHolder)
    }
  }

  attachUiPlaceHolder(node) {
    if (this.placeholder != null) {
      this.placeholder.remove();
    }
    this.placeholder = node;
    this.placeholder.classList.add('ql-togglelist-placeholder');
    this.placeholder.setAttribute('contenteditable', 'false');
    this.domNode.insertBefore(this.placeholder, null);
  }

  format(name, value) {
    const curFormats = ListItem.formats(this.domNode)
    const { row, cell, rowspan, colspan } = curFormats

    if (name === ListItem.blotName) {
      if (value) {
        if (typeof value === 'object') {
          super.format(name, {
            list: value.list,
            row,
            cell,
            rowspan,
            colspan,
            'toggle-id': value['toggle-id']
          })
        } else {
          super.format(name, {
            list: value,
            row,
            cell,
            rowspan,
            colspan
          })
        }
      } else {
        if (row && cell) {
          this.replaceWith(TableCellLine.blotName, {
            row,
            cell,
            rowspan,
            colspan
          })
        } else {
          super.format(name, value)
        }
      }
    } else if (name === TableCellLine.blotName) {
      if (value) {
        this.replaceWith(TableCellLine.blotName, value)
      } else {
        super.format(name, value)
      }
    } else {
      super.format(name, value)
    }
  }

  getListItemChildren() {
    const children = []
    const curFormat = this.formats();
    const curIndent = curFormat.indent || 0
    let next = this.next
    let nextFormat = next && next.formats()
    let nextIndent = nextFormat && nextFormat.indent || 0
    while (
      next &&
      next.statics.blotName === ListItem.blotName
    ) {
      if (nextIndent - curIndent > 0) {
        children.push(next)
        next = next.next
        nextFormat = next && next.formats()
        nextIndent = nextFormat && nextFormat.indent || 0
      } else {
        next = null
      }
    }
    return children
  }

  isToggleListItem() {
    const formats = this.formats()
    return formats && formats.list && formats.list.list === 'toggled'
  }

  isThisItemExpanded() {
    return this.isToggleListItem() &&
      !!this.domNode.getAttribute('data-list-toggle')
  }

  hasToggleChildren() {
    const curIndent = this.formats()['indent'] || 0

    if (this.next) {
      const nextFormats = this.next.formats()
      return nextFormats &&
        nextFormats.list &&
        nextFormats.indent &&
        nextFormats.indent > curIndent
    } else {
      return false
    }
  }

  expandItem() {
    if (this.isToggleListItem()) {
      this.domNode.setAttribute('data-list-toggle', true)
      this.toggleChildren()
    }
  }

  collapseItem() {
    if (this.isToggleListItem()) {
      this.domNode.removeAttribute('data-list-toggle')
      this.toggleChildren()
    }
  }

  getToggleListItemChildren() {
    if (!this.isToggleListItem()) return []
    const children = []
    const curFormat = this.formats();
    const curIndent = curFormat.indent || 0
    let next = this.next
    let nextFormat = next && next.formats()
    let nextIndent = nextFormat && nextFormat.indent || 0
    while (
      next &&
      next.statics.blotName === ListItem.blotName
    ) {
      if (nextIndent - curIndent > 0) {
        children.push(next)
        next = next.next
        nextFormat = next && next.formats()
        nextIndent = nextFormat && nextFormat.indent || 0
      } else {
        next = null
      }
    }
    return children
  }

  toggleChildren() {
    const curFormat = this.formats();
    const curIndent = curFormat.indent || 0
    if (curFormat.list.list === 'toggled') {
      let next = this.next
      let nextFormat = next && next.formats()
      let nextIndent = nextFormat && nextFormat.indent || 0
      while (
        next &&
        next.statics.blotName === ListItem.blotName
      ) {
        if (nextIndent - curIndent > 0) {
          next.optimize()
          next = next.next
          nextFormat = next && next.formats()
          nextIndent = nextFormat && nextFormat.indent || 0
        } else {
          next = null
        }
      }
    }
  }

  getToggleParents() {
    let prev = this.prev
    let prevFormat = prev && prev.formats()
    let prevIndent = prevFormat && prevFormat.indent || 0
    let parent = this
    let parentFormat = parent && parent.formats()
    let parentIndent = parentFormat && parentFormat.indent || 0
    const parents = []
    while (
      prev &&
      prev.statics.blotName === ListItem.blotName
    ) {
      if (parentIndent - prevIndent > 0) {
        parent = prev
        parentFormat = prevFormat
        parentIndent = prevIndent
        parents.push(prev)
      }

      prev = prev.prev
      prevFormat = prev && prev.formats()
      prevIndent = prevFormat && prevFormat.indent || 0
    }
    return parents
  }

  optimize(context) {
    const { row, cell, rowspan, colspan } = ListItem.formats(this.domNode)
    if (this.statics.requiredContainer &&
      !(this.parent instanceof this.statics.requiredContainer)) {
      this.wrap(this.statics.requiredContainer.blotName, {
        row,
        cell,
        colspan,
        rowspan
      })
    }

    // set own visibility
    const parents = this.getToggleParents()
    const isExpanded = parents.every(parent => {
      return parent.domNode.getAttribute('data-list-toggle') ||
        (
          parent.formats() && parent.formats().list &&
          parent.formats().list.list !== 'toggled'
        )
    })

    css(this.domNode, {
      display: `${isExpanded ? 'block' : 'none'}`
    })
    css(this.uiNode, {
      opacity: `${ (!this.isToggleListItem() || this.hasToggleChildren()) ? '1' : '0.5' }`
    })
    
    // set placeholder visibility
    if (this.placeholder) {
      const lineHeight = window.getComputedStyle(this.domNode)
        .getPropertyValue('line-height')

      css(this.domNode, {
        marginBottom: `${
          this.isToggleListItem() &&
          !this.hasToggleChildren() &&
          this.isThisItemExpanded() ? lineHeight : ''
        }`
      })

      css(this.placeholder, {
        display: `${
          this.isToggleListItem() &&
          !this.hasToggleChildren() &&
          this.isThisItemExpanded() ? 'block' : 'none'
        }`
      })
    }

    super.optimize(context)
  }
}
ListItem.blotName = 'list';
ListItem.tagName = 'LI';
ListItem.DEFAULT_TOGGLE_PLACEHOLDER = 'Empty. Click or drag text/images inside'

ListContainer.allowedChildren = [ListItem];
ListItem.requiredContainer = ListContainer;

TableView.allowedChildren = [TableContainer]
TableContainer.requiredContainer = TableView

TableContainer.allowedChildren = [TableBody, TableColGroup]
TableBody.requiredContainer = TableContainer

TableBody.allowedChildren = [TableRow]
TableRow.requiredContainer = TableBody

TableRow.allowedChildren = [TableCell]
TableCell.requiredContainer = TableRow

TableCell.allowedChildren = [TableCellLine, ListContainer]
TableCellLine.requiredContainer = TableCell

TableColGroup.allowedChildren = [TableCol]
TableColGroup.requiredContainer = TableContainer

TableCol.requiredContainer = TableColGroup


function rowId() {
  const id = Math.random()
    .toString(36)
    .slice(2, 8)
  return `row-${id}`
}

function cellId() {
  const id = Math.random()
    .toString(36)
    .slice(2, 8)
  return `cell-${id}`
}

function toggleListId() {
  const id = Math.random()
    .toString(36)
    .slice(2, 8)
  return `list-${id}`
}

export {
  // blots
  TableCol,
  TableColGroup,
  TableCellLine,
  TableCell,
  TableRow,
  TableBody,
  TableContainer,
  TableView,

  ListItem,
  ListContainer,

  // identity getters
  rowId,
  cellId,
  toggleListId,

  // attributes
  CELL_IDENTITY_KEYS,
  CELL_ATTRIBUTES
}

