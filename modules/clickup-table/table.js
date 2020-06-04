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
  rowId,
  cellId
} from './formats';

import {
  matchTableCell,
  matchTableHeader,
  matchTable
} from './node-matchers'

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
  }

  constructor(quill, options) {
    super(quill, options);

    quill.clipboard.addMatcher('td', matchTableCell)
    quill.clipboard.addMatcher('th', matchTableHeader)
    quill.clipboard.addMatcher('table', matchTable)
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
