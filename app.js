const SUPABASE_URL =
  "https://sykieuggwndbhshvsaqo.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_iXUEv9XZJaoKODkeolKYew_u57cRf8W";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

const BUCKET = "media";
const TABLE = "reports";
const ADMIN_PIN = "8041";

let allReports = [];


/* =========================
   منوی سایت
========================= */

const menuBtn =
  document.getElementById("menuBtn");

const drawer =
  document.getElementById("drawer");

const shade =
  document.getElementById("shade");

const closeBtn =
  document.getElementById("closeBtn");

function openMenu(){
  drawer.classList.add("open");
  shade.classList.add("show");
}

function closeMenu(){
  drawer.classList.remove("open");
  shade.classList.remove("show");
}

menuBtn.addEventListener("click",openMenu);
closeBtn.addEventListener("click",closeMenu);
shade.addEventListener("click",closeMenu);


/* =========================
   راهنما / پنل
========================= */

const guideBtn =
  document.getElementById("guideBtn");

const adminOverlay =
  document.getElementById("adminOverlay");

const adminClose =
  document.getElementById("adminClose");

guideBtn.addEventListener("click",(e)=>{
  e.preventDefault();
  closeMenu();
  adminOverlay.classList.add("show");
});

adminClose.addEventListener("click",()=>{
  adminOverlay.classList.remove("show");
});


/* =========================
   ورود
========================= */

const pinInput =
  document.getElementById("pinInput");

const loginBtn =
  document.getElementById("loginBtn");

const loginError =
  document.getElementById("loginError");

const loginBox =
  document.getElementById("loginBox");

const adminContent =
  document.getElementById("adminContent");

function login(){

  if(pinInput.value === ADMIN_PIN){

    loginBox.classList.add("hidden");
    adminContent.classList.remove("hidden");

    loginError.textContent = "";

    loadManageList();

  }else{

    loginError.textContent =
      "رمز ورود اشتباه است.";

    pinInput.value = "";
  }
}

loginBtn.addEventListener("click",login);

pinInput.addEventListener("keydown",(e)=>{
  if(e.key === "Enter"){
    login();
  }
});


/* =========================
   آرشیو
========================= */

const audioGrid =
  document.getElementById("audioGrid");

const latestRow =
  document.getElementById("latestRow");

const searchInput =
  document.getElementById("searchInput");

const styleFilter =
  document.getElementById("styleFilter");

const typeFilter =
  document.getElementById("typeFilter");


async function loadReports(){

  audioGrid.innerHTML =
    '<div class="loading">در حال دریافت آرشیو...</div>';

  const {data,error} =
    await supabaseClient
      .from(TABLE)
      .select("*")
      .order("created_at",{ascending:false});

  if(error){

    console.error(error);

    audioGrid.innerHTML =
      '<div class="loading">خطا در دریافت آرشیو</div>';

    latestRow.innerHTML =
      '<div class="loading">خطا در دریافت آخرین جلسه</div>';

    return;
  }

  allReports = data || [];

  renderLatest();
  renderReports();
}


function renderLatest(){

  if(!allReports.length){

    latestRow.innerHTML =
      '<div class="loading">هنوز گزارشی ثبت نشده است.</div>';

    return;
  }

  /* چند گزارش آخر به صورت افقی */
  const latest =
    allReports.slice(0,5);

  latestRow.innerHTML = "";

  latest.forEach(item=>{
    latestRow.appendChild(
      createAudioCard(item)
    );
  });
}


function renderReports(){

  const search =
    searchInput.value.trim().toLowerCase();

  const style =
    styleFilter.value;

  const type =
    typeFilter.value;

  const filtered =
    allReports.filter(item=>{

      const text = `
        ${item.title || ""}
        ${item.reciter || ""}
        ${item.speaker || ""}
      `.toLowerCase();

      const searchOK =
        !search || text.includes(search);

      const styleOK =
        !style || item.style === style;

      const typeOK =
        !type || item.event_type === type;

      return searchOK &&
             styleOK &&
             typeOK;
    });


  if(!filtered.length){

    audioGrid.innerHTML =
      '<div class="loading">فایلی در آرشیو پیدا نشد.</div>';

    return;
  }

  audioGrid.innerHTML = "";

  filtered.forEach(item=>{
    audioGrid.appendChild(
      createAudioCard(item)
    );
  });
}


function createAudioCard(item){

  const card =
    document.createElement("article");

  card.className = "card";

  const tag =
    item.style ||
    item.event_type ||
    "گزارش";

  const performer =
    item.reciter ||
    item.speaker ||
    "";

  card.innerHTML = `

    <span class="tag">
      ${escapeHTML(tag)}
    </span>

    <h4>
      ${escapeHTML(item.title)}
    </h4>

    <div class="meta">
      ${performer
        ? "مداح / سخنران: " +
          escapeHTML(performer)
        : ""}
    </div>

    <audio controls preload="none">
      <source
        src="${item.audio_url}"
        type="audio/mpeg"
      >
    </audio>

    <a
      class="download"
      href="${item.audio_url}"
      download
      target="_blank"
      rel="noopener"
    >
      دانلود فایل MP3
    </a>
  `;

  return card;
}


searchInput.addEventListener(
  "input",
  renderReports
);

styleFilter.addEventListener(
  "change",
  renderReports
);

typeFilter.addEventListener(
  "change",
  renderReports
);


/* =========================
   آپلود MP3
========================= */

const audioFile =
  document.getElementById("audioFile");

const fileName =
  document.getElementById("fileName");

const uploadBtn =
  document.getElementById("uploadBtn");

const uploadStatus =
  document.getElementById("uploadStatus");


audioFile.addEventListener("change",()=>{

  if(!audioFile.files.length){

    fileName.textContent =
      "فایلی انتخاب نشده";

    return;
  }

  const file =
    audioFile.files[0];

  fileName.textContent =
    `${file.name} — ${formatBytes(file.size)}`;
});


uploadBtn.addEventListener(
  "click",
  uploadAudio
);


async function uploadAudio(){

  const file =
    audioFile.files[0];

  const title =
    document
      .getElementById("titleInput")
      .value.trim();

  const performer =
    document
      .getElementById("performerInput")
      .value.trim();

  const style =
    document
      .getElementById("styleInput")
      .value;

  const eventType =
    document
      .getElementById("typeInput")
      .value;


  if(!file){

    setStatus(
      "اول فایل MP3 را انتخاب کن.",
      true
    );

    return;
  }


  if(!file.name.toLowerCase().endsWith(".mp3")){

    setStatus(
      "فقط فایل MP3 قابل آپلود است.",
      true
    );

    return;
  }


  if(!title){

    setStatus(
      "عنوان را وارد کن.",
      true
    );

    return;
  }


  if(!style){

    setStatus(
      "سبک را انتخاب کن.",
      true
    );

    return;
  }


  if(!eventType){

    setStatus(
      "مناسبت را انتخاب کن.",
      true
    );

    return;
  }


  uploadBtn.disabled = true;
  uploadBtn.textContent =
    "در حال آپلود...";

  setStatus(
    "در حال انتقال فایل به سرور..."
  );


  try{

    /*
      نام فایل را انگلیسی می‌کنیم
      تا مشکل حروف فارسی در Storage
      ایجاد نشود.
    */

    const extension = "mp3";

    const randomPart =
      Math.random()
        .toString(36)
        .substring(2,10);

    const filePath =
      `audio/${Date.now()}-${randomPart}.${extension}`;


    /*
      آپلود مستقیم به Storage
    */

    const {error:uploadError} =
      await supabaseClient
        .storage
        .from(BUCKET)
        .upload(
          filePath,
          file,
          {
            cacheControl:"3600",
            upsert:false,
            contentType:"audio/mpeg"
          }
        );


    if(uploadError){

      console.error(
        "Storage upload error:",
        uploadError
      );

      throw new Error(
        "خطای آپلود فایل: " +
        uploadError.message
      );
    }


    /*
      گرفتن لینک عمومی فایل
    */

    const {data:publicData} =
      supabaseClient
        .storage
        .from(BUCKET)
        .getPublicUrl(filePath);


    const audioUrl =
      publicData.publicUrl;


    /*
      چون جدول قبلی ستون reciter دارد،
      نام مداح / سخنران را در همان ستون
      ذخیره می‌کنیم تا لازم نباشد جدول
      قبلی را دوباره بسازیم.
    */

    const {error:dbError} =
      await supabaseClient
        .from(TABLE)
        .insert({
          title:title,
          reciter:performer || null,
          speaker:null,
          style:style,
          event_type:eventType,
          audio_url:audioUrl
        });


    if(dbError){

      console.error(
        "Database error:",
        dbError
      );

      /*
        اگر فایل آپلود شده ولی ثبت اطلاعات
        خطا داد، خود فایل را هم پاک می‌کنیم.
      */

      await supabaseClient
        .storage
        .from(BUCKET)
        .remove([filePath]);

      throw new Error(
        "فایل آپلود شد ولی ثبت اطلاعات انجام نشد: " +
        dbError.message
      );
    }


    setStatus(
      "✅ فایل با موفقیت آپلود و ثبت شد."
    );

    clearForm();

    await loadReports();
    await loadManageList();


  }catch(error){

    console.error(error);

    setStatus(
      error.message ||
      "خطای نامشخص هنگام آپلود",
      true
    );

  }finally{

    uploadBtn.disabled = false;

    uploadBtn.textContent =
      "آپلود فایل";
  }
}


function setStatus(message,isError=false){

  uploadStatus.textContent =
    message;

  uploadStatus.style.color =
    isError
      ? "#e57373"
      : "#ffd400";
}


function clearForm(){

  document
    .getElementById("titleInput")
    .value = "";

  document
    .getElementById("performerInput")
    .value = "";

  document
    .getElementById("styleInput")
    .value = "";

  document
    .getElementById("typeInput")
    .value = "";

  audioFile.value = "";

  fileName.textContent =
    "فایلی انتخاب نشده";
}


/* =========================
   مدیریت فایل‌ها
========================= */

const manageList =
  document.getElementById("manageList");


async function loadManageList(){

  const {data,error} =
    await supabaseClient
      .from(TABLE)
      .select("*")
      .order(
        "created_at",
        {ascending:false}
      );


  if(error){

    manageList.innerHTML =
      `<div class="error">
        ${escapeHTML(error.message)}
      </div>`;

    return;
  }


  manageList.innerHTML = "";


  if(!data || !data.length){

    manageList.innerHTML =
      '<div class="loading">هنوز فایلی وجود ندارد.</div>';

    return;
  }


  data.forEach(item=>{

    const div =
      document.createElement("div");

    div.className =
      "manage-item";

    const performer =
      item.reciter ||
      item.speaker ||
      "";

    div.innerHTML = `

      <div class="manage-title">
        <strong>
          ${escapeHTML(item.title)}
        </strong>

        <br>

        ${escapeHTML(
          performer
            ? "مداح / سخنران: " + performer
            : ""
        )}

        <br>

        ${escapeHTML(item.style || "")}
        -
        ${escapeHTML(item.event_type || "")}
      </div>

      <button
        class="delete"
        data-id="${item.id}"
        data-url="${encodeURIComponent(item.audio_url)}"
      >
        حذف
      </button>
    `;

    manageList.appendChild(div);
  });


  document
    .querySelectorAll(".delete")
    .forEach(btn=>{

      btn.addEventListener(
        "click",
        ()=>{
          deleteAudio(
            btn.dataset.id,
            decodeURIComponent(
              btn.dataset.url
            )
          );
        }
      );

    });
}


async function deleteAudio(
  id,
  audioUrl
){

  if(!confirm("این فایل حذف شود؟")){
    return;
  }


  try{

    const marker =
      `/storage/v1/object/public/${BUCKET}/`;

    const index =
      audioUrl.indexOf(marker);


    if(index !== -1){

      const path =
        audioUrl.substring(
          index + marker.length
        );

      const {error:storageError} =
        await supabaseClient
          .storage
          .from(BUCKET)
          .remove([path]);

      if(storageError){
        throw storageError;
      }
    }


    const {error} =
      await supabaseClient
        .from(TABLE)
        .delete()
        .eq("id",id);


    if(error){
      throw error;
    }


    await loadReports();
    await loadManageList();


  }catch(error){

    alert(
      "خطا در حذف فایل: " +
      error.message
    );
  }
}


/* =========================
   ابزارها
========================= */

function escapeHTML(value){

  if(!value){
    return "";
  }

  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}


function formatBytes(bytes){

  if(!bytes){
    return "0 B";
  }

  const units =
    ["B","KB","MB","GB"];

  const i =
    Math.floor(
      Math.log(bytes) /
      Math.log(1024)
    );

  return (
    (bytes /
      Math.pow(1024,i))
      .toFixed(1)
    + " " +
    units[i]
  );
}


/* =========================
   شروع
========================= */

loadReports();
