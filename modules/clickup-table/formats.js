import Quill from "../../core/quill"

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
    }
    super.optimize(context)
  }

  tableCell() {
    return this.parent
  }
}
TableCellLine.blotName = "table-cell-line"
TableCellLine.className = "qlbt-cell-line"
TableCellLine.tagName = "P"

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

  toggleAttribute (name, value) {
    if (value) {
      this.domNode.setAttribute(name, value)
    } else {
      this.domNode.removeAttribute(name)
    }
  }

  formatChildren (name, value) {
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
      const thisHead = this.children.head.formats()
      const thisTail = this.children.tail.formats()
      const nextHead = this.next.children.head.formats()
      const nextTail = this.next.children.tail.formats()

      return (
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

  optimize (context) {
    // optimize function of ShadowBlot
    if (
      this.statics.requiredContainer &&
      !(this.parent instanceof this.statics.requiredContainer)
    ) {
      this.wrap(this.statics.requiredContainer.blotName)
    }

    // optimize function of ParentBlot
    // note: modified this optimize function because
    // TableRow should not be removed when the length of its children was 0
    this.enforceAllowedChildren()
    if (this.uiNode != null && this.uiNode !== this.domNode.firstChild) {
      this.domNode.insertBefore(this.uiNode, this.domNode.firstChild)
    }

    // optimize function of ContainerBlot
    if (this.children.length > 0 && this.next != null && this.checkMerge()) {
      this.next.moveChildren(this)
      this.next.remove()
    }
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

class TableBody extends Container {}
TableBody.blotName = "table-body"
TableBody.tagName = "TBODY"

class TableCol extends Block {
  static create (value) {
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
    } else {
      super.format(name, value)
    }
  }

  html () {
    return this.domNode.outerHTML
  }
}
TableCol.blotName = "table-col"
TableCol.tagName = "col"

class TableColGroup extends Container {}
TableColGroup.blotName = "table-col-group"
TableColGroup.tagName = "colgroup"

class TableContainer extends Container {
  static create() {
    let node = super.create()
    return node
  }

  constructor (scroll, domNode) {
    super(scroll, domNode)
    this.updateTableWidth()
  }

  balanceCells () {
    this.descendants(TableCell).forEach(parentCell => {
      const parentCellId = parentCell.formats().cell
      const cellChildren = parentCell.children
      let hasDifferentCellIdChild = false
      cellChildren.forEach(child => {
        const childFormats = child.formats()[child.statics.blotName] || child.formats()
        if (childFormats.cell !== parentCellId) hasDifferentCellIdChild = true
      })

      if (hasDifferentCellIdChild) {
        parentCell.unwrap()
      }
    })

    this.descendants(TableRow).forEach(parentRow => {
      const parentRowId = parentRow.formats().row
      const rowChildren = parentRow.children
      let hasDifferentRowIdChild = false
      rowChildren.forEach(child => {
        const childFormats = child.formats()[child.statics.blotName] || child.formats()
        if (childFormats.row !== parentRowId) hasDifferentRowIdChild = true
      })

      if (hasDifferentRowIdChild) {
        parentRow.unwrap()
      }
    })

    this.updateTableWidth()
  }

  updateTableWidth () {
    setTimeout(() => {
      const colGroup = this.colGroup()
      if (!colGroup) return
      const tableWidth = colGroup.children.reduce((sumWidth, col) => {
        sumWidth = sumWidth + parseInt(col.formats()[TableCol.blotName].width, 10)
        return sumWidth
      }, 0)
      this.domNode.style.width = `${tableWidth}px`
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

  colGroup () {
    return this.children.head
  }

  rows() {
    const body = this.children.tail
    if (body == null) return []
    return body.children.map(row => row)
  }

  insertColumn(index, isRight = true) {
    const [body] = this.descendants(TableBody)
    const [colGroup] = this.descendants(TableColGroup)
    if (body == null || body.children.head == null ||
      colGroup == null) return;
    // insert tableCol at first
    const tableCol = this.scroll.create(TableCol.blotName, true)
    const thisCol = colGroup.children.at(index)
    const refCol = isRight ? thisCol.next : thisCol
    if (refCol) {
      colGroup.insertBefore(tableCol, refCol)
    } else {
      colGroup.appendChild(tableCol)
    }


    body.children.forEach(tableRow => {
      const { row } = tableRow.formats()
      const cell = cellId()
      const thisCell = tableRow.children.at(index)
      const ref = isRight ? thisCell.next : thisCell

      const tableCell = this.scroll.create(
        TableCell.blotName,
        Object.assign({}, CELL_DEFAULT, {
          row,
          cell
        })
      )
      const cellLine = this.scroll.create(
        TableCellLine.blotName,
        Object.assign({}, CELL_DEFAULT, {
          row,
          cell
        })
      )
      tableCell.appendChild(cellLine)

      if (ref) {
        tableRow.insertBefore(tableCell, ref)
      } else {
        tableRow.appendChild(tableCell)
      }
    })

    this.updateTableWidth()
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
  constructor (scroll, domNode) {
    super(scroll, domNode)
    const quill = Quill.find(scroll.domNode.parentNode)
    domNode.addEventListener('scroll', (e) => {
      const tableModule = quill.getModule('table')
      if (tableModule.columnTool) {
        tableModule.columnTool.domNode.scrollLeft = e.target.scrollLeft
      }
    }, false)
  }

  table () {
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

    // ShadowBlot optimize
    this.enforceAllowedChildren();
    if (this.uiNode != null && this.uiNode !== this.domNode.firstChild) {
      this.domNode.insertBefore(this.uiNode, this.domNode.firstChild);
    }
    if (this.children.length === 0) {
      if (this.statics.defaultChild != null) {
        const child = this.scroll.create(this.statics.defaultChild.blotName);
        this.appendChild(child);
        // TODO double check if necessary
        // child.optimize(context);
      } else {
        this.remove();
      }
    }
    // Block optimize
    this.cache = {};
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

    return node;
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

  // formats () {
  //   const formats = {}

  //   return CELL_ATTRIBUTES.concat(CELL_IDENTITY_KEYS)
  //     .concat(['list'])
  //     .reduce((formats, attribute) => {
  //       if (this.domNode.hasAttribute(`data-${attribute}`)) {
  //         formats[attribute] = this.domNode.getAttribute(`data-${attribute}`) || undefined
  //       }
  //       return formats
  //     }, formats)
  // }

  constructor(scroll, domNode) {
    super(scroll, domNode);
    const ui = domNode.ownerDocument.createElement('span');
    const listEventHandler = e => {
      if (!scroll.isEnabled()) return;
      const format = this.statics.formats(domNode, scroll);
      if (format.list === 'checked') {
        this.format('list', 'unchecked');
        e.preventDefault();
      } else if (format.list === 'unchecked') {
        this.format('list', 'checked');
        e.preventDefault();
      }
    };
    ui.addEventListener('mousedown', listEventHandler);
    ui.addEventListener('touchstart', listEventHandler);
    this.attachUI(ui);
  }

  format(name, value) {
    const { row, cell, rowspan, colspan, list } = ListItem.formats(this.domNode)
    if (name === ListItem.blotName) {
      if (value) {
        super.format(name, {
          list: value,
          row, cell, rowspan, colspan
        })
      } else {
        if(row && cell) {
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
      console.log(cell)
    } else {
      super.format(name, value)
    }
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
    super.optimize(context)
  }
}
ListItem.blotName = 'list';
ListItem.tagName = 'LI';

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

  // attributes
  CELL_IDENTITY_KEYS,
  CELL_ATTRIBUTES
}

