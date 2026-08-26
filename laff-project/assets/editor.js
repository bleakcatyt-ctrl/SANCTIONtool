/* WYSIWYG Editor */
class LaffEditor {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.placeholder = options.placeholder || 'Напишите что-нибудь...';
    this.onChange = options.onChange || (()=>{});
    this.init();
  }

  init(){
    this.container.innerHTML = `
      <div class="editor-wrapper">
        <div class="editor-toolbar">
          <button data-cmd="bold" title="Жирный (Ctrl+B)"><i class="fa-solid fa-bold"></i></button>
          <button data-cmd="italic" title="Курсив (Ctrl+I)"><i class="fa-solid fa-italic"></i></button>
          <button data-cmd="underline" title="Подчеркнутый"><i class="fa-solid fa-underline"></i></button>
          <button data-cmd="strikeThrough" title="Зачеркнутый"><i class="fa-solid fa-strikethrough"></i></button>
          <div class="sep"></div>
          <button data-cmd="quote" title="Цитата"><i class="fa-solid fa-quote-left"></i></button>
          <button data-cmd="code" title="Код"><i class="fa-solid fa-code"></i></button>
          <button data-cmd="link" title="Ссылка"><i class="fa-solid fa-link"></i></button>
          <button data-cmd="image" title="Изображение"><i class="fa-solid fa-image"></i></button>
          <div class="sep"></div>
          <button data-cmd="insertUnorderedList" title="Список"><i class="fa-solid fa-list-ul"></i></button>
          <button data-cmd="insertOrderedList" title="Нумерованный список"><i class="fa-solid fa-list-ol"></i></button>
          <div class="sep"></div>
          <button data-cmd="undo" title="Отменить"><i class="fa-solid fa-rotate-left"></i></button>
          <button data-cmd="redo" title="Повторить"><i class="fa-solid fa-rotate-right"></i></button>
        </div>
        <div class="editor-content" contenteditable="true" data-placeholder="${this.placeholder}"></div>
        <div class="editor-footer">
          <span><i class="fa-solid fa-circle-info"></i> Поддерживается BBCode, Markdown, ссылки и изображения</span>
          <span class="char-count">0 символов</span>
        </div>
      </div>
    `;

    this.contentEl = this.container.querySelector('.editor-content');
    this.charCountEl = this.container.querySelector('.char-count');

    this.container.querySelectorAll('[data-cmd]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cmd = btn.getAttribute('data-cmd');
        this.exec(cmd);
      });
    });

    this.contentEl.addEventListener('input', () => {
      this.updateCount();
      this.onChange(this.getHTML(), this.getText());
    });

    this.contentEl.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'b') { e.preventDefault(); this.exec('bold'); }
        if (e.key === 'i') { e.preventDefault(); this.exec('italic'); }
      }
    });
  }

  exec(cmd){
    this.contentEl.focus();
    switch(cmd){
      case 'quote':
        document.execCommand('formatBlock', false, 'blockquote');
        break;
      case 'code':
        document.execCommand('formatBlock', false, 'pre');
        break;
      case 'link':
        const url = prompt('Введите URL:');
        if (url) document.execCommand('createLink', false, url);
        break;
      case 'image':
        const img = prompt('URL изображения:');
        if (img) document.execCommand('insertImage', false, img);
        break;
      default:
        document.execCommand(cmd, false, null);
    }
    this.updateCount();
  }

  getHTML(){ return this.contentEl.innerHTML; }
  getText(){ return this.contentEl.innerText; }
  setHTML(html){ this.contentEl.innerHTML = html; this.updateCount(); }
  clear(){ this.contentEl.innerHTML = ''; this.updateCount(); }
  updateCount(){
    if (this.charCountEl) this.charCountEl.textContent = `${this.getText().length} символов`;
  }
}

window.LaffEditor = LaffEditor;
