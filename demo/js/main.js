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

const oldTableDelta2 = new Delta({"ops":[{"insert":"dfusdofdskfjsdkf"},{"attributes":{"list":{"list":"ordered"}},"insert":"\n"},{"insert":"dsfsdfsdfsdf"},{"attributes":{"indent":1,"list":{"list":"ordered"}},"insert":"\n"},{"insert":"sdfsdfsdf"},{"attributes":{"indent":1,"list":{"list":"ordered"}},"insert":"\n"},{"insert":"sdfsdfdsf"},{"attributes":{"indent":1,"list":{"list":"toggled"}},"insert":"\n"},{"insert":"dsfsdf"},{"attributes":{"indent":1,"list":{"list":"toggled"}},"insert":"\n"},{"insert":"sdfsdfs"},{"attributes":{"indent":2,"list":{"list":"bullet"}},"insert":"\n"},{"insert":"sdfsdfs"},{"attributes":{"indent":2,"list":{"list":"bullet"}},"insert":"\n"},{"insert":"sdfsdfsdf"},{"attributes":{"indent":2,"list":{"list":"bullet"}},"insert":"\n"},{"insert":"sdfdsfsfs"},{"attributes":{"indent":3,"list":{"list":"toggled"}},"insert":"\n"},{"insert":"dfsfsfsf"},{"attributes":{"indent":3,"list":{"list":"toggled"}},"insert":"\n"},{"insert":"sdfsfsfsf"},{"attributes":{"indent":4,"list":{"list":"toggled"}},"insert":"\n"},{"insert":"sdfsfsdfsdf"},{"attributes":{"indent":4,"list":{"list":"toggled"}},"insert":"\n"},{"insert":"dsfsdf"},{"attributes":{"indent":4,"list":{"list":"checked"}},"insert":"\n"},{"insert":"dsfdsfsdf"},{"attributes":{"indent":4,"list":{"list":"checked"}},"insert":"\n"}]})
const oldTableDelta3 = new Delta({"ops":[{"insert":"\n\n\n","attributes":{"table-col":{"width":150}}},{"insert":"1.1"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-fg27-1","row":"row-fg27","colspan":"1","rowspan":"1"}}},{"insert":"1.2"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-fg27-2","row":"row-fg27","colspan":"1","rowspan":"1"}}},{"insert":"1.3"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-fg27-3","row":"row-fg27","colspan":"1","rowspan":"1"}}},{"insert":"2.1"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-ifuh-1","row":"row-ifuh","colspan":"1","rowspan":"1"}}},{"insert":"2.2"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-ifuh-2","row":"row-ifuh","colspan":"1","rowspan":"1"}}},{"insert":"2.3"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-ifuh-3","row":"row-ifuh","colspan":"1","rowspan":"1"}}},{"insert":"3.1"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-bc1e-1","row":"row-bc1e","colspan":"1","rowspan":"1"}}},{"insert":"3.2"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-bc1e-2","row":"row-bc1e","colspan":"1","rowspan":"1"}}},{"insert":"3.3"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-bc1e-3","row":"row-bc1e","colspan":"1","rowspan":"1"}}},{"insert":"\n"},{"insert":"\n\n\n","attributes":{"table-col":{"width":150}}},{"insert":"1.1"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-22gt-1","row":"row-22gt","colspan":"1","rowspan":"1"}}},{"insert":"1.2"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-22gt-2","row":"row-22gt","colspan":"1","rowspan":"1"},"align":"center"}},{"insert":"1.3"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-22gt-3","row":"row-22gt","colspan":"1","rowspan":"1"},"align":"right"}},{"insert":"2.1"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-rboe-1","row":"row-rboe","colspan":"1","rowspan":"1"}}},{"insert":"2.2"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-rboe-2","row":"row-rboe","colspan":"1","rowspan":"1"},"align":"center"}},{"insert":"2.3"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-rboe-3","row":"row-rboe","colspan":"1","rowspan":"1"},"align":"right"}},{"insert":"3.1"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-poe7-1","row":"row-poe7","colspan":"1","rowspan":"1"}}},{"insert":"3.2"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-poe7-2","row":"row-poe7","colspan":"1","rowspan":"1"},"align":"center"}},{"insert":"3.3"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-poe7-3","row":"row-poe7","colspan":"1","rowspan":"1"},"align":"right"}},{"insert":"\n"},{"insert":"\n\n\n","attributes":{"table-col":{"width":150}}},{"insert":"1."},{"attributes":{"bold":true},"insert":"1"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-icuc-1","row":"row-icuc","colspan":"1","rowspan":"1"}}},{"insert":"1.2"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-icuc-2","row":"row-icuc","colspan":"1","rowspan":"1"}}},{"insert":"1.3"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-icuc-3","row":"row-icuc","colspan":"1","rowspan":"1"}}},{"insert":"2.1"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-ctzo-1","row":"row-ctzo","colspan":"1","rowspan":"1"}}},{"insert":"2.2"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-ctzo-2","row":"row-ctzo","colspan":"1","rowspan":"1"}}},{"insert":"2.3"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-ctzo-3","row":"row-ctzo","colspan":"1","rowspan":"1"}}},{"insert":"3.1"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-whe3-1","row":"row-whe3","colspan":"1","rowspan":"1"}}},{"insert":"3.2"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-whe3-2","row":"row-whe3","colspan":"1","rowspan":"1"}}},{"insert":"3.3"},{"insert":"\n","attributes":{"table-cell-line":{"cell":"row-whe3-3","row":"row-whe3","colspan":"1","rowspan":"1"}}}]})

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

const testDelta3 = new Delta({"ops":[{"insert":"sfsfsdfsdfs"},{"insert":{"image":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKoAAABACAYAAACKqexmAAAELUlEQVR4Ae2bPXIiMRCFOZxzyMkhx7kPQO4DQM4ByDkAzn0A5z7AbD12HyVkSdNMIS1tPVW5en66h6fXX83v7mzQkAMOHJg50CiJcmAQqILAhQMC1UWbJFKgigEXDghUF22SSIEqBlw4IFBdtEkiBaoYcOGAQHXRJokUqGLAhQMC1UWbJFKgigEXDghUF22SSIEqBlw4IFBdtEkiBaoYcOGAQHXRJokUqGLAhQMC1UWbJFKgigEXDghUF22SSIEqBlw4IFBdtEkiuwP1dDoN6/V6WC6XA5atY2qd9fiPypuq83g8Xjy515dH6R47TnegohEvLy+XPwBrHVPrrMd/VN5UnVPrHqV77DjdgUpIGccM4n7mM3L7s0XqY7TqYz6jta5VnkA1Os0GMhrLmqdRH6NVAPMZrXWt8gSq0Wk2kNFY1jyN+hitApjPaK1rlSdQjU6zgYzGsuZp1MdoFcB8RmtdqzyBanSaDWQ0ljVPoz5GqwDmM1rrWuXN8Fqip8FGMFrnznxGa13rPOpjtP4+8xlLdefzefj4+Bi+v79LaQ/dN4OwnmBlIxitbjKfMVWHxr2+vk56/ZU63pRt1MdoPQbzGeM6wInXedzPiPl+fX3F6Q9fv4CKH+0FVhrMaHWU+YxxHSBNNTLOq71OfYzW32M+Y1gHNrg9FReLRfWz6xVUCLjnS004EU/LKaOnbAvn/Pn5OaBZqeOEeS2WUxqmbKNWzM1SjzNrzXEDKr5O/PZhMd2SQ59wJs1BiuO0HhbtlhzqxvxWq9UV1re3t8vVd7vdXrfxeKypEQXqv8+pNNsa2Qw0cj6fX5sWLuNYrYdV/1heqBtzfH9//3HFjeeK+9ha4wZUXfr//huAsSbGAOLyiKahmZvN5gptnFerieFxLdotOeExU8upKwm21RpXUPUwVbY4bm4u+9lAzemMt1vnhzo85ccPjph3zXEBtRdIYeQ9DQmNt9b9dlBx1U3dk9e87KMPeuEf0lhYFqjDkHqAgi8tTnT6hFqAM9zVO6gpSPGWCPfnLYZANbrcM6i73e7HLRMeHGs+PMVtEaixI5n1XkFNPd3/j7dDAjUDZry5BOrhcBj2+/3lL/wvHajhdsQWZ6CSznhO4XquLv58ivmFcwqXa37zF6hhtwrLuUaiOfG+3HrtJ2PIj3+7MKWbXbm61GU/zuU6cmuN7kANz3j4NGgdubpnAzWnc2yeuTqBOuZcpf24vwKgaMw991qlOjwR4/1p6Q/fyGteGmlXSSdzUjFXh6d6aC/NDfuQU/MNQHdn1FSTtO35HRCoz98jKcSXKbkgBzw4IFA9dEkadUYVAz4c0BnVR5+6VylQu0fAhwEC1UefulcpULtHwIcBAtVHn7pXKVC7R8CHAQLVR5+6VylQu0fAhwEC1UefulcpULtHwIcBAtVHn7pX+QfrtZt2Ck13iwAAAABJRU5ErkJggg=="}},{"insert":"dfsdf\nsdfsdfdsfdsfds\n"}]})

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike', 'link'],        // toggled buttons
  ['blockquote', 'code-block'],

  [{ 'header': 1 }, { 'header': 2 }],               // custom button values
  [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'unchecked' }, { 'list': 'toggled' }, { 'list': 'none' }],
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
      dragDropBlocks: {
        anchorOffsetLeft: () => 1,
        anchorAlignCenter: () => true
      },
      table: {
        tableTools: {
          zIndex: 100
        }
      }
    }
  })

  const config = {
    app: 'quilljs',
    username: (Math.random() * 1000).toFixed(0),
    autoStart: true,
    showUI: false,
    showCursor: true,
    cursorAlwaysOn: true,
    editor: quill,
    docId: 'id'
  };
  const codox = new Codox();
  codox.start(config);

  // quill.on('text-change', (newDelta, oldContents, source) => {
  //   console.log(newDelta)
  // })

  window.quill = quill
  // test parse old table delta to new
  quill.setContents(tableDeltaParser(testDelta3))

  const tableModule = quill.getModule('table')

  document.querySelector('#insert-table')
    .addEventListener('click', () => {
      tableModule.insertTable(3, 3)
    }, false)

  document.querySelector('#get-delta')
    .addEventListener('click', () => {
      console.log(quill.getContents())
    }, false)

  document.getElementById('import-tables')
    .addEventListener('click', () => {
      const index = quill.getLength();
      const [line] = quill.getLine(index - 1)
      const lineFormats = line.formats()

      quill.updateContents(
        new Delta().retain(index - 1).insert('\n', lineFormats).concat(tableDeltaParser(oldTableDelta3).delete(1).insert('\n')),
        Quill.sources.USER
      )
    }, false)
}
