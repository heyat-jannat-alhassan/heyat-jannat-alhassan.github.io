const reports=[
 {title:"گزارش شور محرم",date:"۱۵ محرم ۱۴۰۵",audio:"شور",event:"عزاداری",person:"کربلایی مسعود یوسفی جو",duration:"نمونه",file:""},
 {title:"گزارش روضه محرم",date:"۱۴ محرم ۱۴۰۵",audio:"روضه",event:"عزاداری",person:"کربلایی مسعود یوسفی جو",duration:"نمونه",file:""},
 {title:"گزارش زمینه",date:"۱۲ محرم ۱۴۰۵",audio:"زمینه",event:"عزاداری",person:"کربلایی مسعود یوسفی جو",duration:"نمونه",file:""},
 {title:"سخنرانی مراسم",date:"۱۰ محرم ۱۴۰۵",audio:"سخنرانی",event:"عزاداری",person:"حجت‌الاسلام سید امیر سید علیخانی",duration:"نمونه",file:""}
];
const card=r=>`<article class="card"><span class="tag">${r.audio}</span><h4>${r.title}</h4><div class="meta">📅 ${r.date}<br>🎤 ${r.person}<br>🏴 ${r.event}</div>${r.file?`<audio class="player" controls preload="metadata" src="${r.file}"></audio><a class="download" href="${r.file}" download>⬇️ دانلود مستقیم صوت</a>`:`<div class="meta" style="margin-top:14px">فایل نمونه هنوز بارگذاری نشده</div>`}</article>`;
const latest=document.getElementById("latestRow"),grid=document.getElementById("archiveGrid");
latest.innerHTML=reports.map(card).join(""); grid.innerHTML=reports.map(card).join("");
document.getElementById("next").onclick=()=>latest.scrollBy({left:-320,behavior:"smooth"});
document.getElementById("prev").onclick=()=>latest.scrollBy({left:320,behavior:"smooth"});
function filter(){let q=document.getElementById("search").value.trim();let a=document.getElementById("audioType").value,e=document.getElementById("eventType").value,y=document.getElementById("year").value,p=document.getElementById("person").value;
let out=reports.filter(r=>(!q||[r.title,r.person,r.date].join(" ").includes(q))&&(!a||r.audio===a)&&(!e||r.event===e)&&(!y||r.date.includes(y))&&(!p||r.person===p));grid.innerHTML=out.length?out.map(card).join(""):`<div class="meta">گزارشی با این مشخصات پیدا نشد.</div>`;
}
document.querySelectorAll(".filters input,.filters select").forEach(x=>x.addEventListener("input",filter));
