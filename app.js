const SUPABASE_URL =
  "https://sykieuggwndbhshvsaqo.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_iXUEv9XZJaoKODkeolKYew_u57cRf8W";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const BUCKET = "media";
const TABLE = "reports";

/* ---------------- MENU ---------------- */

const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawer");
const shade = document.getElementById("shade");
const closeBtn = document.getElementById("closeBtn");

function openMenu() {
  drawer.classList.add("open");
  shade.classList.add("show");
}

function closeMenu() {
  drawer.classList.remove("open");
  shade.classList.remove("show");
}

menuBtn.addEventListener("click", openMenu);
closeBtn.addEventListener("click", closeMenu);
shade.addEventListener("click", closeMenu);

/* ---------------- ADMIN ---------------- */

const guideBtn = document.getElementById("guideBtn");
const adminOverlay = document.getElementById("adminOverlay");
const adminClose = document.getElementById("adminClose");

guideBtn.addEventListener("click", (e) => {
  e.preventDefault();
  closeMenu();
  adminOverlay.classList.add("show");
});

adminClose.addEventListener("click", () => {
  adminOverlay.classList.remove("show");
});

/* ---------------- AUDIO ARCHIVE ---------------- */

const audioGrid = document.getElementById("audioGrid");
const searchInput = document.getElementById("searchInput");
const styleFilter = document.getElementById("styleFilter");
const typeFilter = document.getElementById("typeFilter");

let allReports = [];

async function loadReports() {

  audioGrid.innerHTML =
    '<div class="loading">در حال دریافت آرشیو...</div>';

  const { data, error } = await supabaseClient
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);

    audioGrid.innerHTML =
      '<div class="loading">خطا در دریافت آرشیو</div>';

    return;
  }

  allReports = data || [];

  renderReports();
}

function renderReports() {

  const search =
    searchInput.value.trim().toLowerCase();

  const style =
    styleFilter.value;

  const type =
    typeFilter.value;

  const filtered = allReports.filter(item => {

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

    return searchOK && styleOK && typeOK;
  });

  if (!filtered.length) {

    audioGrid.innerHTML =
      '<div class="loading">فایلی در آرشیو پیدا نشد.</div>';

    return;
  }

  audioGrid.innerHTML = "";

  filtered.forEach(item => {

    const card = document.createElement("article");
    card.className = "card";

    const tag =
      item.style ||
      item.event_type ||
      "صوت";

    const meta = [];

    if (item.reciter)
      meta.push(`مداح: ${escapeHTML(item.reciter)}`);

    if (item.speaker)
      meta.push(`سخنران: ${escapeHTML(item.speaker)}`);

    card.innerHTML = `
      <span class="tag">${escapeHTML(tag)}</span>

      <h4>${escapeHTML(item.title)}</h4>

      <div class="meta">
        ${meta.join("<br>")}
      </div>

      <audio controls preload="none">
        <source src="${item.audio_url}" type="audio/mpeg">
      </audio>

      <a
        class="download"
        href="${item.audio_url}"
        download
        target="_blank"
      >
        دانلود فایل MP3
      </a>
    `;

    audioGrid.appendChild(card);
  });
}

function escapeHTML(value) {

  if (!value) return "";

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

searchInput.addEventListener("input", renderReports);
styleFilter.addEventListener("change", renderReports);
typeFilter.addEventListener("change", renderReports);

/* ---------------- ADMIN LOGIN ---------------- */

const pinInput = document.getElementById("pinInput");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");
const loginBox = document.getElementById("loginBox");
const adminContent = document.getElementById("adminContent");

const ADMIN_PIN = "8041";

loginBtn.addEventListener("click", login);

pinInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    login();
  }
});

function login() {

  if (pinInput.value === ADMIN_PIN) {

    loginBox.classList.add("hidden");
    adminContent.classList.remove("hidden");

    loginError.textContent = "";

    loadManageList();

  } else {

    loginError.textContent =
      "رمز ورود اشتباه است.";

    pinInput.value = "";
  }
}

/* ---------------- UPLOAD ---------------- */

const audioFile = document.getElementById("audioFile");
const fileName = document.getElementById("fileName");
const uploadBtn = document.getElementById("uploadBtn");
const uploadStatus = document.getElementById("uploadStatus");

audioFile.addEventListener("change", () => {

  if (!audioFile.files.length) {

    fileName.textContent =
      "فایلی انتخاب نشده";

    return;
  }

  const file = audioFile.files[0];

  fileName.textContent =
    `${file.name} — ${formatBytes(file.size)}`;
});

uploadBtn.addEventListener("click", uploadAudio);

async function uploadAudio() {

  const file = audioFile.files[0];

  const title =
    document.getElementById("titleInput").value.trim();

  const reciter =
    document.getElementById("reciterInput").value.trim();

  const speaker =
    document.getElementById("speakerInput").value.trim();

  const style =
    document.getElementById("styleInput").value;

  const eventType =
    document.getElementById("typeInput").value;

  if (!file) {
    uploadStatus.textContent =
      "اول فایل MP3 را انتخاب کن.";
    return;
  }

  if (!file.name.toLowerCase().endsWith(".mp3")) {
    uploadStatus.textContent =
      "فقط فایل MP3 قابل آپلود است.";
    return;
  }

  if (!title) {
    uploadStatus.textContent =
      "عنوان فایل را وارد کن.";
    return;
  }

  uploadBtn.disabled = true;
  uploadBtn.textContent = "در حال آپلود...";
  uploadStatus.textContent = "لطفاً صبر کن...";

  try {

    const safeName =
      file.name
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .toLowerCase();

    const filePath =
      `audio/${Date.now()}-${safeName}`;

    const { error: uploadError } =
      await supabaseClient
        .storage
        .from(BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: "audio/mpeg"
        });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicData } =
      supabaseClient
        .storage
        .from(BUCKET)
        .getPublicUrl(filePath);

    const audioUrl =
      publicData.publicUrl;

    const { error: dbError } =
      await supabaseClient
        .from(TABLE)
        .insert({
          title,
          reciter: reciter || null,
          speaker: speaker || null,
          style: style || null,
          event_type: eventType || null,
          audio_url: audioUrl
        });

    if (dbError) {
      throw dbError;
    }

    uploadStatus.textContent =
      "فایل با موفقیت آپلود شد.";

    clearForm();

    await loadReports();
    await loadManageList();

  } catch (error) {

    console.error(error);

    uploadStatus.textContent =
      "خطا در آپلود: " +
      (error.message || "خطای نامشخص");

  } finally {

    uploadBtn.disabled = false;
    uploadBtn.textContent = "آپلود فایل";
  }
}

function clearForm() {

  document.getElementById("titleInput").value = "";
  document.getElementById("reciterInput").value = "";
  document.getElementById("speakerInput").value = "";
  document.getElementById("styleInput").value = "";
  document.getElementById("typeInput").value = "";

  audioFile.value = "";

  fileName.textContent =
    "فایلی انتخاب نشده";
}

/* ---------------- MANAGE ---------------- */

const manageList =
  document.getElementById("manageList");

async function loadManageList() {

  const { data, error } =
    await supabaseClient
      .from(TABLE)
      .select("*")
      .order("created_at", {
        ascending: false
      });

  if (error) {

    manageList.innerHTML =
      `<div class="error">${escapeHTML(error.message)}</div>`;

    return;
  }

  manageList.innerHTML = "";

  if (!data || !data.length) {

    manageList.innerHTML =
      '<div class="loading">هنوز فایلی وجود ندارد.</div>';

    return;
  }

  data.forEach(item => {

    const div =
      document.createElement("div");

    div.className =
      "manage-item";

    div.innerHTML = `
      <div class="manage-title">
        ${escapeHTML(item.title)}
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
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => deleteAudio(
          btn.dataset.id,
          decodeURIComponent(btn.dataset.url)
        )
      );

    });
}

async function deleteAudio(id, audioUrl) {

  if (!confirm("این فایل حذف شود؟")) {
    return;
  }

  try {

    const marker =
      `/storage/v1/object/public/${BUCKET}/`;

    const index =
      audioUrl.indexOf(marker);

    if (index !== -1) {

      const path =
        audioUrl.substring(
          index + marker.length
        );

      await supabaseClient
        .storage
        .from(BUCKET)
        .remove([path]);
    }

    const { error } =
      await supabaseClient
        .from(TABLE)
        .delete()
        .eq("id", id);

    if (error) {
      throw error;
    }

    await loadReports();
    await loadManageList();

  } catch (error) {

    alert(
      "خطا در حذف فایل: " +
      error.message
    );
  }
}

/* ---------------- HELPERS ---------------- */

function formatBytes(bytes) {

  if (!bytes) return "0 B";

  const units = [
    "B",
    "KB",
    "MB",
    "GB"
  ];

  const i =
    Math.floor(
      Math.log(bytes) /
      Math.log(1024)
    );

  return (
    (bytes / Math.pow(1024, i))
      .toFixed(1) +
    " " +
    units[i]
  );
}

/* شروع سایت */

loadReports();
