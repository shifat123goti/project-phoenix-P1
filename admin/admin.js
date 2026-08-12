'use strict';
const $=id=>document.getElementById(id);
let S={users:JSON.parse(localStorage.phoenixUsers||'[]'),rewards:+(localStorage.phoenixRewards||0),refs:+(localStorage.phoenixRefs||0),refCoins:+(localStorage.phoenixRefCoins||0),missions:JSON.parse(localStorage.phoenixMissions||'[]'),settings:JSON.parse(localStorage.phoenixSettings||'{}')};
const save=()=>{localStorage.phoenixUsers=JSON.stringify(S.users);localStorage.phoenixRewards=S.rewards;localStorage.phoenixRefs=S.refs;localStorage.phoenixRefCoins=S.refCoins;localStorage.phoenixMissions=JSON.stringify(S.missions);localStorage.phoenixSettings=JSON.stringify(S.settings)};
const toast=m=>{let t=$('toast');t.textContent=m;t.classList.add('show');clearTimeout(window.tt);window.tt=setTimeout(()=>t.classList.remove('show'),2200)};
function page(n){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));$(n).classList.add('active');document.querySelectorAll('[data-page]').forEach(x=>x.classList.toggle('active',x.dataset.page===n));$('title').textContent=n[0].toUpperCase()+n.slice(1);if(n==='users')renderUsers();if(n==='missions')renderMissions();$('sidebar')?.classList.remove('open')}
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>page(b.dataset.page));
$('menu').onclick=()=>document.querySelector('.sidebar').classList.toggle('open');
function render(){let coins=S.users.reduce((a,u)=>a+(+u.coins||0),0);$('usersCount').textContent=S.users.length.toLocaleString();$('coinsCount').textContent=coins.toLocaleString();$('rewardsCount').textContent=S.rewards.toLocaleString();$('refsCount').textContent=S.refs.toLocaleString();$('refCount').textContent=S.refs.toLocaleString();$('refCoins').textContent=S.refCoins.toLocaleString();renderUsers();renderMissions()}
function renderUsers(){let t=$('userTable');if(!S.users.length){t.innerHTML='<tr><td colspan="5">No users available.</td></tr>';return}t.innerHTML=S.users.map((u,i)=>`<tr><td>${esc(u.name)}</td><td>${u.level}</td><td>🪙 ${(+u.coins).toLocaleString()}</td><td>${u.xp}</td><td><button onclick="delUser(${i})">Delete</button></td></tr>`).join('')}
function renderMissions(){let m=$('missionsList');m.innerHTML=S.missions.length?S.missions.map((x,i)=>`<div class="mission"><b>🎯 ${esc(x.name)} — 🪙 ${x.reward}</b><button onclick="delMission(${i})">Delete</button></div>`).join(''):'<div class="panel" style="margin-top:15px">No missions created.</div>'}
function esc(x){return String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}
window.delUser=i=>{if(confirm('Delete this user?')){S.users.splice(i,1);save();render();toast('🗑️ User deleted')}};
window.delMission=i=>{S.missions.splice(i,1);save();render();toast('🗑️ Mission deleted')};
$('addUser').onclick=()=>{let n=prompt('Player name:');if(!n)return;let c=+prompt('Coins:','0')||0,l=+prompt('Level:','1')||1,x=+prompt('XP:','0')||0;S.users.push({name:n.trim(),coins:Math.max(0,c),level:Math.max(1,l),xp:Math.max(0,x)});save();render();toast('👤 User added')};
$('giveCoins').onclick=()=>{if(!S.users.length)return toast('❌ Add a user first');let n=prompt('Exact player name:');let u=S.users.find(x=>x.name.toLowerCase()===String(n).toLowerCase());if(!u)return toast('❌ User not found');let a=+prompt('Coins:','100');if(!(a>0))return;u.coins+=a;S.rewards+=a;save();render();toast('🪙 Coins given')};
$('reward').onclick=()=>{let a=+prompt('Reward coins:','500');if(a>0){S.rewards+=a;save();render();toast('🎁 Reward created')}};
$('addMission').onclick=()=>{let n=prompt('Mission name:');if(!n)return;let r=+prompt('Reward coins:','100');if(r>0){S.missions.push({name:n.trim(),reward:r});save();render();toast('🎯 Mission added')}};
$('save').onclick=()=>{S.settings={adminName:$('adminName').value.trim()||'Administrator',apiUrl:$('apiUrl').value.trim()};$('adminNameTop').textContent=S.settings.adminName;save();toast('💾 Settings saved')};
$('logout').onclick=()=>toast('👋 Logout ready');
$('adminName').value=S.settings.adminName||'Administrator';$('apiUrl').value=S.settings.apiUrl||'http://localhost:3000';$('adminNameTop').textContent=$('adminName').value;render();

