import 'assets/snow.styl'
import Quill from 'root/quill'

window.onload = () => {
  const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
      table: true
    }
  })
}
