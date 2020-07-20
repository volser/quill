import 'assets/snow.styl'
import '../styles/style.styl'
import Quill from 'root/quill'
import Delta from 'quill-delta'

import { tableDeltaParser } from '../../modules/clickup-table/utils'

const oldTableDelta = new Delta({
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

const oldTableDelta2 = new Delta({"ops":[{"insert":"sdfsdfsdf\ndfdsf\nSomeText"},{"attributes":{"table":"row-z838"},"insert":"\n"},{"insert":"SomeText"},{"attributes":{"table":"row-z838"},"insert":"\n"},{"insert":"SomeText"},{"attributes":{"table":"row-z838"},"insert":"\n"},{"insert":"SomeText"},{"attributes":{"table":"row-agrc"},"insert":"\n"},{"insert":"SomeText"},{"attributes":{"table":"row-agrc"},"insert":"\n"},{"insert":"SomeText"},{"attributes":{"table":"row-agrc"},"insert":"\n"},{"insert":"dsfsdf\ndsfsdf\ntext"},{"attributes":{"table":"row-d9sh"},"insert":"\n"},{"insert":"text"},{"attributes":{"table":"row-d9sh"},"insert":"\n"},{"insert":"text"},{"attributes":{"table":"row-n6jv"},"insert":"\n"},{"insert":"text"},{"attributes":{"table":"row-n6jv"},"insert":"\n"},{"insert":"sdfsdf\nsdfsdf\n"}]})
const oldTableDelta3 = new Delta({"ops":[{"insert":"sdfsdfsdf\ndfdsf\n"},{"insert":{image: "http://img3.imgtn.bdimg.com/it/u=1267761530,2716523653&fm=26&gp=0.jpg"}},{"insert":"SomeText"},{"attributes":{"table":"row-z838"},"insert":"\n"},{"insert":"SomeText"},{"attributes":{"table":"row-z838"},"insert":"\n"},{"insert":"SomeText"},{"attributes":{"table":"row-z838"},"insert":"\n"},{"insert":"SomeText"},{"attributes":{"table":"row-agrc"},"insert":"\n"},{"insert":"SomeText"},{"attributes":{"table":"row-agrc"},"insert":"\n"},{"insert":"SomeText"},{"attributes":{"table":"row-agrc"},"insert":"\n"},{"insert":"dsfsdf\ndsfsdf\ntext"},{"attributes":{"table":"row-d9sh"},"insert":"\n"},{"insert":"text"},{"attributes":{"table":"row-d9sh"},"insert":"\n"},{"insert":"text"},{"attributes":{"table":"row-n6jv"},"insert":"\n"},{"insert":"text"},{"attributes":{"table":"row-n6jv"},"insert":"\n"},{"insert":"sdfsdf\nsdfsdf\n"}]})

const oldListDelta = new Delta({
  "ops": [
    {insert: "sdsdfsdfsdf\nsdfdsfsf"},
    {attributes: { list: "ordered" }, insert: "\n"},
    {insert: "34324234234"},
    {attributes: { list: "ordered" }, insert: "\n"},
    {insert: "234324234"},
    {attributes: { list: "ordered" }, insert: "\n"},
    {insert: "234234234"},
    {attributes: { list: "ordered" }, insert: "\n"},
    {insert: "234234234234"},
    {attributes: { list: "ordered" }, insert: "\n"}
  ]
})

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
  ['blockquote', 'code-block'],

  [{ 'header': 1 }, { 'header': 2 }],               // custom button values
  [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'unchecked' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
  [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
  [{ 'direction': 'rtl' }],                         // text direction

  [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

  [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
  [{ 'font': [] }],
  [{ 'align': [] }],

  ['clean']                                         // remove formatting button
]

window.onload = () => {
  const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
      toolbar: toolbarOptions,
      table: {
        tableTools: {
          zIndex: 1000
        }
      }
    }
  })

  // const config = {
  //   app: 'quilljs',
  //   username: (Math.random() * 1000).toFixed(0),
  //   autoStart: true,
  //   showUI: false,
  //   showCursor: true,
  //   cursorAlwaysOn: true,
  //   editor: quill,
  //   docId: 'id'
  // };
  // const codox = new Codox();
  // codox.start(config);

  // quill.on('text-change', (newDelta, oldContents, source) => {
  //   console.log(newDelta)
  // })

  window.quill = quill
  // test parse old table delta to new
  // quill.setContents(tableDeltaParser(oldTableDelta2))

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
