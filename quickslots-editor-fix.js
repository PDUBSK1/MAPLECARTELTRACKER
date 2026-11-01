/* Editor navigation fix only: original quickslot reading and expense logic unchanged. */
(()=>{
  function setup(){
    const dialog=document.getElementById('monopolySlotsDialog');
    const editor=document.getElementById('quickslotItems');
    const mount=document.getElementById('monoSlotsHome');
    const close=document.getElementById('monoSlotsClose');
    if(!dialog||!editor||!mount)return;
    const home=editor.parentNode;
    const anchor=document.createComment('Quickslots original placement');
    home.insertBefore(anchor,editor);
    function restore(){if(anchor.parentNode&&editor.parentNode!==home)anchor.parentNode.insertBefore(editor,anchor.nextSibling);}
    function open(event){
      event.preventDefault();event.stopImmediatePropagation();
      if(editor.parentNode!==mount)mount.appendChild(editor);
      try{if(!dialog.open)dialog.showModal();}catch(e){dialog.setAttribute('open','');}
    }
    for(const id of ['defaultSlots','monoSlots']){
      const button=document.getElementById(id);
      if(button){button.type='button';button.addEventListener('click',open,true);}
    }
    close?.addEventListener('click',(e)=>{e.preventDefault();e.stopImmediatePropagation();if(dialog.open)dialog.close();else{dialog.removeAttribute('open');restore();}},true);
    dialog.addEventListener('close',restore);
    dialog.addEventListener('cancel',()=>queueMicrotask(restore));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
