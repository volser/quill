import Delta from 'quill-delta';
import Quill from '../../core/quill';
import Module from '../../core/module';
import {
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
  rowId,
  cellId
} from './formats';

import {
  matchTableCell,
  matchTableHeader,
  matchTable
} from './node-matchers'

import { getEventComposedPath } from '../clickup-table-control/utils'
import TableColumnTool from '../clickup-table-control/clickup-table-column-tool'
import TableRowTool from '../clickup-table-control/clickup-table-row-tool'
import TableTableTool from '../clickup-table-control/clickup-table-table-tool'

class Table extends Module {
  static register() {
    Quill.register(TableCol, true);
    Quill.register(TableColGroup, true);
    Quill.register(TableCellLine, true);
    Quill.register(TableCell, true);
    Quill.register(TableRow, true);
    Quill.register(TableBody, true);
    Quill.register(TableContainer, true);
    Quill.register(TableView, true);
    // List must be registered in TableModule
    // or TDZ references error
    Quill.register(ListItem, true);
    Quill.register(ListContainer, true)
  }

  constructor(quill, options) {
    super(quill, options)

    this.quill.on("text-change", range => {
      if (this.rowTool && this.table) {
        let tableRect = this.rowTool.table.getBoundingClientRect()
        let rowToolRect = this.rowTool.domNode.getBoundingClientRect()
        let delta = tableRect.height - rowToolRect.height
        if (delta > 4 || delta < -4) {
          window.setTimeout(this.rowTool.updateToolCells(), 0)
        }
      }
    })

    this.quill.root.addEventListener('click', (evt) => {
      const path = getEventComposedPath(evt)

      if (!path || path.length <= 0) return

      const tableNode = path.filter(node => {
        return node.tagName &&
          node.tagName.toUpperCase() === 'TABLE' &&
          node.classList.contains('clickup-table')
      })[0]

      if (tableNode) {
        // current table clicked
        if (this.table === tableNode) return
        // other table clicked
        if (this.table) this.hideTableTools()
        this.showTableTools(tableNode, quill, options)
      } else if (this.table) {
        // other clicked
        this.hideTableTools()
      }
    }, false)

    quill.clipboard.addMatcher('td', matchTableCell)
    quill.clipboard.addMatcher('th', matchTableHeader)
    quill.clipboard.addMatcher('table', matchTable)
  }

  showTableTools (table, quill, options) {
    this.table = table
    this.columnTool = new TableColumnTool(table, quill, options)
    this.rowTool = new TableRowTool(table, quill, options)
    this.tableTool = new TableTableTool(table, quill, options)
  }

  hideTableTools () {
    this.columnTool && this.columnTool.destroy()
    this.rowTool && this.rowTool.destroy()
    this.tableTool && this.tableTool.destroy()
    this.columnTool = null
    this.rowTool = null
    this.tableTool = null
    this.table = null
  }

  deleteTable() {
    const [table] = this.getTable();
    if (table == null) return;
    const offset = table.offset();
    table.remove();
    this.quill.update(Quill.sources.USER);
    this.quill.setSelection(offset, Quill.sources.SILENT);
  }

  getTable(range = this.quill.getSelection()) {
    if (range == null) return [null, null, null, -1];
    const [cell, offset] = this.quill.getLine(range.index);
    if (cell == null || cell.statics.blotName !== TableCell.blotName) {
      return [null, null, null, -1];
    }
    const row = cell.parent;
    const table = row.parent.parent;
    return [table, row, cell, offset];
  }

  insertTable(rows, columns) {
    const range = this.quill.getSelection(true)
    if (range == null) return
    let currentBlot = this.quill.getLeaf(range.index)[0]
    let delta = new Delta().retain(range.index)

    if (isInTableCell(currentBlot)) {
      console.warn(`Can not insert table into a table cell.`)
      return;
    }

    delta.insert('\n')
    // insert table column
    delta = new Array(columns).fill('\n').reduce((memo, text) => {
      memo.insert(text, { 'table-col': true })
      return memo
    }, delta)
    // insert table cell line with empty line
    delta = new Array(rows).fill(0).reduce(memo => {
      let tableRowId = rowId()
      return new Array(columns).fill('\n').reduce((memo, text) => {
        memo.insert(text, { 'table-cell-line': {row: tableRowId, cell: cellId()} });
        return memo
      }, memo)
    }, delta)

    this.quill.updateContents(delta, Quill.sources.USER)
    this.quill.setSelection(range.index + columns + 1, Quill.sources.API)
  }
}

function isTableCell (blot) {
  return blot.statics.blotName === TableCell.blotName
}

function isInTableCell (current) {
  return current && current.parent
    ? isTableCell(current.parent)
      ? true
      : isInTableCell(current.parent)
    : false
}

export default Table;
