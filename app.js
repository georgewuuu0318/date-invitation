'use strict';
const config = window.INVITATION;
const $ = id => document.getElementById(id);
const pages = ['invite', 'date-page', 'activity-page', 'done'];
let selectedDate = '', selectedActivity = null, escapes = 0;
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
let viewedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
function localDate(date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
function formattedDate() { return new Date(`${selectedDate}T12:00:00`).toLocaleDateString('zh-TW', {year:'numeric',month:'long',day:'numeric',weekday:'long'}); }
function activityName() { return selectedActivity?.custom ? $('other-activity').value.trim() : selectedActivity?.name || ''; }
function showPage(index) {
  pages.forEach((id,i) => { $(id).hidden = i !== index; });
  document.querySelectorAll('[data-step]').forEach(el => {el.classList.toggle('active', Number(el.dataset.step) === Math.min(index, 2)); if(Number(el.dataset.step) === Math.min(index,2)) el.setAttribute('aria-current','step'); else el.removeAttribute('aria-current');});
  $('window-title').textContent = ['一封給你的邀請.exe','選個見面的日子.exe','我們的約會計畫.exe','心動約定已儲存.exe'][index];
  $('status-text').textContent = ['一點點勇氣，和很多很多喜歡。','把期待，圈進日曆裡。','每一種日常，都想和你一起。','約定好了，那天見 ♡'][index];
  const heading = $(pages[index]).querySelector('h2'); heading.tabIndex = -1; heading.focus({preventScroll:true});
}
$('recipient').textContent = config.recipient;
$('sender').textContent = config.sender;
$('invite-title').textContent = config.title;
$('invite-copy').textContent = config.message;
$('letter-to').textContent = `親愛的 ${config.recipient}：`;
$('letter-title').textContent = config.letterTitle;
$('letter-body').textContent = config.letter;
$('letter-sign').textContent = config.signature;
document.title = `給${config.recipient}的約會邀請 ♡`;
function moveNo() {
  const button = $('no'), arena = $('no-arena');
  const width = arena.clientWidth - button.offsetWidth;
  // Keep both choices usable; the NO button moves within its own lower lane.
  button.style.position = 'absolute';
  button.style.left = `${Math.round(Math.random() * Math.max(0, width))}px`;
  button.style.top = `${56 + Math.round(Math.random() * 8)}px`;
  arena.style.height = '111px';
  escapes++;
  $('no-hint').textContent = ['哎呀，它害羞地跑走了 ♡','再靠近一點點，它又害羞了！','不急，讓心動慢慢發生 ♡'][Math.min(escapes - 1, 2)];
}
$('no').addEventListener('pointerenter', e => {if(e.pointerType !== 'touch') moveNo();});
$('no').addEventListener('pointerdown', e => {e.preventDefault();moveNo();});
$('no').addEventListener('click', e => {if(e.detail === 0) moveNo();});
window.addEventListener('resize',()=>{if(escapes) $('no').style.left='0px';});
$('yes').addEventListener('click',()=>{renderCalendar();showPage(1);});
document.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click',()=>showPage(Number(button.dataset.back))));
function renderCalendar() {
  $('month-label').textContent = viewedMonth.toLocaleDateString('zh-TW',{year:'numeric',month:'long'});
  $('prev-month').disabled = viewedMonth.getFullYear() === today.getFullYear() && viewedMonth.getMonth() === today.getMonth();
  $('days').replaceChildren();
  for(let i=0;i<viewedMonth.getDay();i++) $('days').append(document.createElement('span'));
  const count = new Date(viewedMonth.getFullYear(),viewedMonth.getMonth()+1,0).getDate();
  for(let day=1;day<=count;day++) {
    const date = new Date(viewedMonth.getFullYear(),viewedMonth.getMonth(),day), key=localDate(date);
    const button = document.createElement('button'); button.type='button';button.textContent=day;button.disabled=date<today;
    button.setAttribute('aria-label',date.toLocaleDateString('zh-TW',{year:'numeric',month:'long',day:'numeric',weekday:'long'}));
    button.setAttribute('aria-pressed',String(key===selectedDate));button.classList.toggle('selected',key===selectedDate);button.classList.toggle('today',key===localDate(today));
    button.addEventListener('click',()=>{selectedDate=key;$('date-status').textContent=`已選擇：${formattedDate()} ♡`;$('date-next').disabled=false;renderCalendar();const selected=$('days').querySelector('.selected');selected?.focus({preventScroll:true});});
    $('days').append(button);
  }
}
$('prev-month').addEventListener('click',()=>{viewedMonth=new Date(viewedMonth.getFullYear(),viewedMonth.getMonth()-1,1);renderCalendar();});
$('next-month').addEventListener('click',()=>{viewedMonth=new Date(viewedMonth.getFullYear(),viewedMonth.getMonth()+1,1);renderCalendar();});
$('date-next').addEventListener('click',()=>{if(selectedDate) showPage(2);});
config.activities.forEach(activity=>{
  const button = document.createElement('button');button.type='button';button.className='activity';button.setAttribute('aria-pressed','false');
  const icon=document.createElement('span');icon.className='icon';icon.textContent=activity.icon;icon.setAttribute('aria-hidden','true');
  const name=document.createElement('strong');name.textContent=activity.name;
  const detail=document.createElement('small');detail.textContent=activity.detail;button.append(icon,name,detail);
  button.addEventListener('click',()=>{
    selectedActivity=activity;
    [...$('activities').children].forEach(el=>{el.classList.toggle('selected',el===button);el.setAttribute('aria-pressed',String(el===button));});
    $('other-label').hidden=!activity.custom;validateActivity();if(activity.custom) $('other-activity').focus();
  });$('activities').append(button);
});
function validateActivity(){const valid=Boolean(activityName());$('finish').disabled=!valid;$('activity-status').textContent=valid?`小計畫：${activityName()} ♡`:'寫下你想一起做的事 ♡';}
$('other-activity').addEventListener('input',validateActivity);
function summaryText(){return `${config.recipient} 與 ${config.sender}\n${formattedDate()}\n活動：${activityName()}`;}
$('finish').addEventListener('click',()=>{if(!selectedDate||!activityName())return;$('summary').textContent=summaryText();showPage(3);$('letter-dialog').showModal();});
$('open-letter').addEventListener('click',()=>$('letter-dialog').showModal());
$('close-letter').addEventListener('click',()=>$('letter-dialog').close());
$('letter-ok').addEventListener('click',()=>$('letter-dialog').close());
$('letter-dialog').addEventListener('click',e=>{if(e.target===$('letter-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(`約會確定！♡\n${summaryText()}`);$('copy-status').textContent='已複製！可以貼上傳給邀請你的人 ♡';}catch{$('copy-status').textContent='瀏覽器未允許複製，請長按或選取上方約會資訊。';}});
function escapeICS(value){return String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');}
$('download').addEventListener('click',()=>{
  const next=new Date(`${selectedDate}T12:00:00`);next.setDate(next.getDate()+1);
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Love OS//Date invitation//ZH','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:${selectedDate}-${Date.now()}@love-os.local`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z/,'Z')}`,`DTSTART;VALUE=DATE:${selectedDate.replace(/-/g,'')}`,`DTEND;VALUE=DATE:${localDate(next).replace(/-/g,'')}`,`SUMMARY:${escapeICS(`與${config.recipient}的約會：${activityName()}`)}`,`DESCRIPTION:${escapeICS(summaryText())}`,'END:VEVENT','END:VCALENDAR'];
  const url=URL.createObjectURL(new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='我們的約會.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
function updateClock(){$('clock').textContent=new Date().toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',hour12:false});}updateClock();setInterval(updateClock,60000);
