/* Theme UI only. Always show the original Default theme on page load.
   This script never edits session, EXP, capture, or potion logic. */
(()=>{
  document.documentElement.dataset.cartelTheme='street';
  document.addEventListener('DOMContentLoaded',()=>{
    const picker=document.getElementById('cartelTheme');
    if(!picker)return;
    picker.value='street';
    picker.addEventListener('change',()=>{
      document.documentElement.dataset.cartelTheme = picker.value==='monopoly' ? 'monopoly' : 'street';
    });
  });
})();
