import 'assets/snow.styl'
import '../styles/style.styl'
import Quill from 'root/quill'
import Delta from 'quill-delta'

import { tableDeltaParser } from '../../modules/clickup-table/utils'

const oldTableDelta = new Delta({
  "ops":[
    {"insert":"234\n3243\n"},
    {"insert":"1\n2\n3\n","attributes":{"table":"row-z2be"}},
    {"attributes":{"table":"row-xdoa"},"insert":"4\n5\n6\n"},
    {"attributes":{"table":"row-5eyr"},"insert":"1\n2\n3\n"},
    {"insert":"\n"}
  ]
})

const oldTableDelta2 = new Delta({
  "ops":[
    {"insert":"234\n3243\n"},
    {"insert":"234\n234234\n","attributes":{"table":"row-z2be"}},
    {"insert":{image: "http://img3.imgtn.bdimg.com/it/u=1267761530,2716523653&fm=26&gp=0.jpg"}},
    {"insert":"234"},
    {"insert":"\n","attributes":{"table":"row-z2be"}},
    {"attributes":{"table":"row-xdoa"},"insert":"234\n234234\n234234\n"},
    {"attributes":{"table":"row-5eyr"},"insert":"23423\n234234\n234234\n"},
    {"insert":"\n"}
  ]
})

window.onload = () => {
  const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
      table: true
    }
  })

  // test parse old table delta to new
  // quill.setContents(tableDeltaParser(oldTableDelta))

  const tableModule = quill.getModule('table')

  document.querySelector('#insert-table')
    .addEventListener('click', () => {
      tableModule.insertTable(3, 3)
    }, false)

  document.querySelector('#get-delta')
    .addEventListener('click', () => {
      console.log(quill.getContents())
    }, false)

  document.getElementById('focus-cell')
    .addEventListener('click', () => {
      console.log(Quill.find(quill.scroll.domNode.querySelector('table')))
    }, false)
}
