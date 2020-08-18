import Quill from '../core/quill';
import Block from '../blots/block';
import Container from '../blots/container';

export class BlockquoteContainer extends Container {}
BlockquoteContainer.blotName = 'blockquote-container';
BlockquoteContainer.className = 'ql-blockquote-container';
BlockquoteContainer.tagName = 'DIV';

class Blockquote extends Block {
  static register() {
    Quill.register(BlockquoteContainer);
  }
}
Blockquote.blotName = 'blockquote';
Blockquote.tagName = 'blockquote';

BlockquoteContainer.allowedChildren = [Blockquote];
Blockquote.requiredContainer = BlockquoteContainer;

export default Blockquote;
