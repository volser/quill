import Quill from '../../core/quill';

export const getDraggableRootBlot = (curBlot, node) => {
  let blotName
  if (curBlot) {
    blotName = curBlot.statics.blotName
  } else {
    if (node.classList.contains('ql-ui') && node.parentNode.tagName === 'LI') {
      curBlot = Quill.find(node.parentNode, true)
      blotName = curBlot.statics.blotName
    }
  }
  if (!blotName) return null
  switch (blotName) {
    case 'table-cell-line':
      return curBlot.tableCell() &&
        curBlot.tableCell().table() &&
        curBlot.tableCell().table().parent
    case 'table':
      return curBlot.table() &&
        curBlot.table().parent
    case 'list':
      return curBlot
    case 'block':
      return curBlot
    default:
      return null
  }
}

export function css (domNode, rules) {
  if (typeof rules === 'object') {
    for (let prop in rules) {
      domNode.style[prop] = rules[prop]
    }
  }
}
