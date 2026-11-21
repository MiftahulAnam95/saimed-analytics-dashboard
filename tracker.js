/*
 * SAIMED DIGITAL LINK HUB — CLICK TRACKER
 * Pasang file ini pada halaman link hub, setelah elemen tautan tersedia.
 * Dashboard dan link hub harus memakai domain/origin yang sama agar
 * localStorage dapat dibaca bersama. Untuk analytics lintas perangkat,
 * gunakan backend/database atau layanan analytics.
 */
(() => {
  const KEY = 'saimed_analytics_events';
  function deviceType(){
    const ua=navigator.userAgent||'';
    if(/ipad|tablet|playbook|silk/i.test(ua))return 'tablet';
    if(/mobile|iphone|ipod|android/i.test(ua))return 'mobile';
    return 'desktop';
  }
  function save(event){
    try{
      const events=JSON.parse(localStorage.getItem(KEY)||'[]');
      events.push({...event,timestamp:new Date().toISOString(),device:deviceType()});
      // Batasi ukuran penyimpanan browser agar tidak tumbuh tanpa batas.
      localStorage.setItem(KEY,JSON.stringify(events.slice(-5000)));
    }catch(error){console.warn('SAIMED tracker:',error);}
  }
  save({type:'pageview'});
  document.addEventListener('click',(event)=>{
    const anchor=event.target.closest('a');
    if(!anchor)return;
    const href=anchor.getAttribute('href')||'';
    if(!href||href.startsWith('#')||href.startsWith('javascript:'))return;
    const label=(anchor.dataset.track||anchor.innerText||anchor.getAttribute('aria-label')||'').toLowerCase();
    let link='other';
    if(/shopee/.test(label+' '+href))link='shopee';
    else if(/tokopedia/.test(label+' '+href))link='tokopedia';
    else if(/whatsapp|wa\.me/.test(label+' '+href))link='whatsapp';
    else if(/instagram/.test(label+' '+href))link='instagram';
    else if(/website|resmi|saimed/.test(label+' '+href))link='website';
    save({type:'click',link});
  },true);
})();