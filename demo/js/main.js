import 'assets/snow.styl'
import '../styles/style.styl'
import Quill from 'root/quill'

window.onload = () => {
  const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
      table: true
    }
  })

  const tableModule = quill.getModule('table')

  document.querySelector('#insert-table')
    .addEventListener('click', () => {
      tableModule.insertTable(3, 3)
    }, false)
}
