const { md } = require('./markdown-renderer');

const saveChanges = (editor, filename, btn) => {
  const content = editor.value().split('\n').map(l => l.trimEnd()).join('\n');
  const originalContent = editor._rendered.value.split('\n').map(l => l.trimEnd()).join('\n');

  // If nothing has changed, just return
  if (content == originalContent) {
    Wiki.alert('No file changes detected..', 'warning', 3e3);
    btn.classList.remove('disabled');
    btn.innerText = 'Save Changes';
    return;
  }
}

const createMarkDownEditor =  (elementID, filename) => {
  // No element specified
  if (!elementID || !filename) return;

  const element = document.getElementById(elementID);

  let mde;
  mde = new SimpleMDE({
    element,
    previewRender: (input) => md.render(input),
    placeholder: "Type here...",
    toolbar: [
      'bold', 'italic', 'heading', '|',
      'quote', 'unordered-list', 'ordered-list', '|',
      'link', 'image', 'table', 'horizontal-rule', '|',
      'preview', 'side-by-side', 'fullscreen',
    ],
    hideIcons: ['guide'],
    insertTexts: {
      image: ['[[File:', '|50px]]'],
      link: [`[[`, ']]'],
    },
    status: [
      'lines', 'words',
      {
        className: 'filename',
        defaultValue: (el) => {
          el.innerHTML = `Filename: <a class="text-decoration-none" target="_BLANK" href="https://github.com/pokeclicker/pokeclicker-wiki/tree/main/${filename}"><code>"${filename}"</code></a>`;
        },
      },
      {
        className: 'github',
        defaultValue: (el) => {
          const btn = document.createElement('div');
          btn.classList.add('btn', 'btn-success', 'btn-sm');
          btn.innerText = 'Save Changes';
          btn.onclick = () => {
            btn.classList.add('disabled');
            btn.innerHTML = `<div class="spinner-border spinner-border-sm text-bg-success" role="status"></div> Saving...`;
            saveChanges(mde, filename, btn);
          }
          el.append(btn);
        },
      }
    ]
  });

  return mde;
}

module.exports = {
  createMarkDownEditor,
}
