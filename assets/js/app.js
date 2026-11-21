(() => {
  const STORAGE_KEY = 'saimed_analytics_events';
  const $ = (id) => document.getElementById(id);
  const nf = new Intl.NumberFormat('id-ID');
  const colors = ['#1689ed','#35c6a3','#8d76e8','#f0b34d'];
  let trafficChart, deviceChart;
  const linkMeta = [
    {key:'shopee',label:'Shopee',icon:'bi-bag',tone:'orange'},
    {key:'tokopedia',label:'Tokopedia',icon:'bi-shop',tone:'green'},
    {key:'whatsapp',label:'WhatsApp',icon:'bi-whatsapp',tone:'green'},
    {key:'website',label:'Website Resmi',icon:'bi-globe2',tone:'blue'},
    {key:'instagram',label:'Instagram',icon:'bi-instagram',tone:'dark'}
  ];
  const demoEvents = (() => {
    const rows=[]; const now=new Date();
    for(let day=29;day>=0;day--){
      const d=new Date(now); d.setDate(now.getDate()-day);
      const views=22+((day*13+17)%39);
      for(let i=0;i<views;i++){
        const at=new Date(d); at.setHours(7+(i*7)%14,(i*17)%60,0,0);
        rows.push({type:'pageview',timestamp:at.toISOString(),device:['mobile','mobile','mobile','desktop','tablet'][(i+day)%5]});
      }
      const counts={shopee:2+(day*3)%9,tokopedia:1+(day*7)%7,whatsapp:3+(day*5)%12,website:1+(day*2)%6,instagram:1+(day*11)%5};
      Object.entries(counts).forEach(([key,count])=>{for(let i=0;i<count;i++){const at=new Date(d);at.setHours(8+(i*3)%12,(i*11+day)%60,0,0);rows.push({type:'click',link:key,timestamp:at.toISOString(),device:['mobile','mobile','desktop','tablet'][(i+day)%4]});}});
    }
    return rows;
  })();

  function readEvents(){try{const v=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
  function getDataset(){
    const real=readEvents();
    return {events:real.length?real:demoEvents,isDemo:real.length===0};
  }
  function inRange(event,days){
    if(days==='all')return true;
    const start=new Date();start.setHours(0,0,0,0);start.setDate(start.getDate()-Number(days)+1);
    return new Date(event.timestamp)>=start;
  }
  function fmtTime(value){
    const d=new Date(value);if(Number.isNaN(d.getTime()))return 'Baru saja';
    const diff=Math.max(0,Date.now()-d.getTime());
    if(diff<60000)return 'Baru saja';if(diff<3600000)return `${Math.floor(diff/60000)} menit lalu`;
    if(diff<86400000)return `${Math.floor(diff/3600000)} jam lalu`;
    return d.toLocaleDateString('id-ID',{day:'numeric',month:'short'});
  }
  function setTrend(id,text){$(id).innerHTML=`<i class="bi bi-arrow-up-right"></i> ${text}`;}
  function render(){
    const days=$('dateFilter').value;
    const {events,isDemo}=getDataset();
    const filtered=events.filter(e=>inRange(e,days));
    const previous=events.filter(e=>{
      if(days==='all')return false;
      const start=new Date();start.setHours(0,0,0,0);start.setDate(start.getDate()-Number(days)+1);
      const end=new Date(start);end.setDate(end.getDate()+Number(days));
      const d=new Date(e.timestamp);return d<start&&d>=new Date(start.getTime()-Number(days)*86400000);
    });
    const views=filtered.filter(e=>e.type==='pageview').length;
    const clicks=filtered.filter(e=>e.type==='click').length;
    const prevViews=previous.filter(e=>e.type==='pageview').length;
    const prevClicks=previous.filter(e=>e.type==='click').length;
    $('totalViews').textContent=nf.format(views);
    $('totalClicks').textContent=nf.format(clicks);
    $('ctr').textContent=views?`${(clicks/views*100).toFixed(1).replace('.',',')}%`:'0%';
    setTrend('viewsTrend',changeText(views,prevViews));setTrend('clicksTrend',changeText(clicks,prevClicks));
    const counts=Object.fromEntries(linkMeta.map(l=>[l.key,filtered.filter(e=>e.type==='click'&&e.link===l.key).length]));
    const sorted=[...linkMeta].sort((a,b)=>counts[b.key]-counts[a.key]);
    $('topLink').textContent=sorted[0]&&counts[sorted[0].key]?sorted[0].label:'—';
    $('topLinkClicks').textContent=sorted[0]&&counts[sorted[0].key]?`${nf.format(counts[sorted[0].key])} klik tercatat`:'Belum ada klik';
    renderTraffic(filtered,days);renderDevices(filtered);renderLinks(counts,clicks);renderActivity(filtered);
    $('insightTitle').textContent=clicks?`${sorted[0].label} paling diminati`:'Mulai kumpulkan insight';
    $('insightText').textContent=clicks?`${sorted[0].label} menjadi tautan dengan interaksi tertinggi pada periode ini. Gunakan informasi ini untuk menentukan prioritas kanal komunikasi.`:'Pasang tracker pada halaman Digital Link Hub. Setelah pengunjung membuka halaman dan menekan tautan, datanya akan muncul di dashboard.';
    const flag=$('dataMode');if(flag)flag.textContent=isDemo?'DATA DEMO':'DATA AKTUAL';
    document.title=`SAIMED Analytics${isDemo?' · Demo':''}`;
  }
  function changeText(now,prev){if(!prev)return '—';const pct=((now-prev)/prev)*100;return `${pct>=0?'+':''}${pct.toFixed(1).replace('.',',')}%`;}
  function renderTraffic(events,days){
    const n=days==='all'?30:Math.min(Number(days),30);
    const labels=[],views=[],clicks=[];
    for(let i=n-1;i>=0;i--){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-i);labels.push(d.toLocaleDateString('id-ID',{day:'numeric',month:'short'}));const key=d.toDateString();views.push(events.filter(e=>e.type==='pageview'&&new Date(e.timestamp).toDateString()===key).length);clicks.push(events.filter(e=>e.type==='click'&&new Date(e.timestamp).toDateString()===key).length);}
    const ctx=$('trafficChart').getContext('2d');
    if(trafficChart)trafficChart.destroy();
    trafficChart=new Chart(ctx,{type:'line',data:{labels,datasets:[{label:'Kunjungan',data:views,borderColor:'#1689ed',backgroundColor:'rgba(22,137,237,.09)',fill:true,tension:.38,borderWidth:2.5,pointRadius:0,pointHoverRadius:4},{label:'Klik',data:clicks,borderColor:'#35c6a3',backgroundColor:'transparent',tension:.38,borderWidth:2.5,pointRadius:0,pointHoverRadius:4}]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{display:false},tooltip:{backgroundColor:'#17384d',padding:10,titleFont:{family:'DM Sans'},bodyFont:{family:'DM Sans'}}},scales:{x:{grid:{display:false},ticks:{color:'#a0adb8',font:{size:9},maxTicksLimit:7}},y:{beginAtZero:true,grid:{color:'#f0f3f6',drawBorder:false},ticks:{color:'#a0adb8',font:{size:9},precision:0}}}}});
  }
  function renderDevices(events){
    const devices=['mobile','desktop','tablet'];const labels=['Mobile','Desktop','Tablet'];
    const counts=devices.map(d=>events.filter(e=>(e.type==='pageview'||e.type==='click')&&(e.device||'mobile')===d).length);
    const total=counts.reduce((a,b)=>a+b,0);$('deviceTotal').textContent=nf.format(total);
    if(deviceChart)deviceChart.destroy();
    deviceChart=new Chart($('deviceChart'),{type:'doughnut',data:{labels,datasets:[{data:counts,backgroundColor:colors,borderWidth:0,hoverOffset:4}]},options:{responsive:true,maintainAspectRatio:false,cutout:'76%',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.label}: ${nf.format(c.raw)}`}}}}});
    $('deviceLegend').innerHTML=labels.map((label,i)=>`<div><i style="background:${colors[i]}"></i>${label}<b>${total?Math.round(counts[i]/total*100):0}%</b></div>`).join('');
  }
  function renderLinks(counts,total){
    const max=Math.max(1,...Object.values(counts));
    $('linksTable').innerHTML=linkMeta.map(l=>{const c=counts[l.key]||0;const pct=total?c/total*100:0;return `<tr><td><div class="link-name"><span class="link-icon ${l.tone}"><i class="bi ${l.icon}"></i></span>${l.label}</div></td><td><strong>${nf.format(c)}</strong></td><td>${pct.toFixed(1).replace('.',',')}%</td><td class="bar-cell"><div class="mini-progress"><span style="width:${c/max*100}%"></span></div></td></tr>`}).join('');
  }
  function renderActivity(events){
    const latest=[...events].sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)).slice(0,5);
    $('activityList').innerHTML=latest.length?latest.map(e=>{const l=linkMeta.find(x=>x.key===e.link);const isClick=e.type==='click';return `<div class="activity-item"><span class="activity-icon"><i class="bi ${isClick?'bi-cursor':'bi-eye'}"></i></span><div class="activity-copy">${isClick?'Klik pada':'Kunjungan ke'} <strong>${isClick?(l?.label||e.link||'tautan'):'halaman utama'}</strong><br><span>${(e.device||'mobile').toUpperCase()}</span></div><span class="activity-time">${fmtTime(e.timestamp)}</span></div>`}).join(''):'<div class="empty-state">Belum ada aktivitas tercatat.</div>';
  }
  function exportCSV(){
    // Ekspor mengikuti periode filter yang sedang dipilih.
    const selectedDays = $('dateFilter').value;
    const {events} = getDataset();
    const filtered = events
      .filter(e => inRange(e, selectedDays))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const linkLabels = Object.fromEntries(linkMeta.map(item => [item.key, item.label]));
    const deviceLabels = {mobile:'Mobile', desktop:'Desktop', tablet:'Tablet'};
    const typeLabels = {pageview:'Kunjungan halaman', click:'Klik tautan'};

    const rows = [
      ['Waktu', 'Aktivitas', 'Nama tautan', 'Perangkat'],
      ...filtered.map(event => {
        const date = new Date(event.timestamp);
        const timestamp = Number.isNaN(date.getTime())
          ? ''
          : date.toLocaleString('id-ID', {
              year:'numeric', month:'2-digit', day:'2-digit',
              hour:'2-digit', minute:'2-digit', second:'2-digit',
              hour12:false
            });
        return [
          timestamp,
          typeLabels[event.type] || event.type || '',
          linkLabels[event.link] || (event.link === 'other' ? 'Tautan lainnya' : ''),
          deviceLabels[event.device] || 'Tidak diketahui'
        ];
      })
    ];

    // Excel pada banyak konfigurasi regional Indonesia memakai titik koma
    // sebagai pemisah kolom. Baris sep=; membantu Excel mengenalinya.
    const escapeCell = value => {
      let text = String(value ?? '');
      // Cegah nilai tak tepercaya dieksekusi sebagai formula spreadsheet.
      if (/^[=+@]/.test(text) || /^-[^0-9]/.test(text)) text = "'" + text;
      return '"' + text.replace(/"/g, '""') + '"';
    };
    const csv = ['sep=;', ...rows.map(row => row.map(escapeCell).join(';'))].join('\r\n');
    const blob = new Blob(['\ufeff' + csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saimed-analytics-${selectedDays === 'all' ? 'semua-periode' : selectedDays + '-hari'}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`CSV berhasil diunduh (${nf.format(filtered.length)} aktivitas).`);
  }
  function toast(message){$('toastMessage').textContent=message;bootstrap.Toast.getOrCreateInstance($('appToast'),{delay:2600}).show();}
  $('dateFilter').addEventListener('change',render);
  $('refreshBtn').addEventListener('click',()=>{render();toast('Data dashboard diperbarui.')});
  $('exportBtn').addEventListener('click',exportCSV);
  $('menuToggle').addEventListener('click',()=>$('sidebar').classList.toggle('open'));
  document.querySelectorAll('.side-nav a').forEach(a=>a.addEventListener('click',()=>{$('sidebar').classList.remove('open');document.querySelectorAll('.side-nav a').forEach(x=>x.classList.remove('active'));a.classList.add('active')}));
  $('year').textContent=new Date().getFullYear();
  render();
})();