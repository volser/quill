import Quill from '../../core/quill';
import Module from '../../core/module';
import { filter } from 'lodash';

export const THE_KEY_FOR_EXPANDED_TOGGLE_LIST = 'Quill_Expanded_Toggle_Lists'
const STORED_KEYS = [
  THE_KEY_FOR_EXPANDED_TOGGLE_LIST
]

const fakeStorage = {
  [THE_KEY_FOR_EXPANDED_TOGGLE_LIST]: '[]',
  getItem(key) {
    return fakeStorage[key]
  },
  setItem(key, value) {
    fakeStorage[key] = value
  },
  removeItem(key) {
    fakeStorage[key] = ''
  },
  clear() {
    STORED_KEYS.forEach(key => {
      fakeStorage[key] = ''
    })
  }
}

const isSupportLocalStorage = storage => {
  if(!!storage){
      try {
        storage.setItem('cu_storage_test', 'test');
        storage.removeItem('cu_storage_test');
          return true;
      } catch(e){
        return false;
      }
  }else{
      return false;
  }
}

export default class QuillStorage extends Module {
  constructor(...args) {
    super(...args)
    this.enable = isSupportLocalStorage(window.localStorage)
    if (this.enable) {
      this.storageRef = window.localStorage
    } else {
      this.storageRef = fakeStorage
    }
  }

  getItem(key) {
    return JSON.parse(this.storageRef.getItem(key))
  }

  setItem(key, val) {
    this.storageRef.setItem(key, JSON.stringify(val))
  }

  addExpandedToggleList(listItemId) {
    const lists = this.getItem(THE_KEY_FOR_EXPANDED_TOGGLE_LIST) || []
    lists.push({
      id: listItemId,
      time: new Date().getTime()
    })
    this.setItem(THE_KEY_FOR_EXPANDED_TOGGLE_LIST, lists)
  }

  removeCollapsedToggleList(listItemId) {
    let lists = this.getItem(THE_KEY_FOR_EXPANDED_TOGGLE_LIST) || []
    lists = filter(lists, item => item.id !== listItemId)
    this.setItem(THE_KEY_FOR_EXPANDED_TOGGLE_LIST, lists)
  }
}