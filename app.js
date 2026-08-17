const ADMIN_PASSWORD = "8041";

const defaultReports = [
  {
    id: 1,
    title: "گزارش مراسم محرم",
    reciter: "کربلایی مسعود یوسفی جو",
    speaker: "حجت‌الاسلام سید امیر سید علیخانی",
    style: "روضه",
    event: "عزاداری",
    audio: ""
  },
  {
    id: 2,
    title: "گزارش شب عزاداری",
    reciter: "کربلایی مسعود یوسفی جو",
    speaker: "حجت‌الاسلام سید امیر سید علیخانی",
    style: "شور",
    event: "عزاداری",
    audio: ""
  }
];

let reports =
  JSON.parse(localStorage.getItem("jannat_reports")) ||
  defaultReports;


/* ذخیره */

function saveReports() {
  localStorage.setItem(
    "jannat_reports",
    JSON.stringify(reports)
  );
}


/* جلوگیری از خراب شدن HTML */

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================
   منوی سه خط
========================= */

const menuBtn =
  document.getElementById("menuBtn");

const drawer =
  document.getElementById("drawer");

const closeBtn =
  document.getElementById("close");

const shade =
  document.getElementById("shade");


if (menuBtn) {

  menuBtn.onclick = function () {

    drawer.classList.add("open");

    shade.classList.add("show");

  };

}


function closeMenu() {

  drawer.classList.remove("open");

  shade.classList.remove("show");

}


if (closeBtn) {
  closeBtn.onclick = closeMenu;
}

if (shade) {
  shade.onclick = closeMenu;
}


document
  .querySelectorAll(".drawer a")
  .forEach(function (link) {

    link.addEventListener(
      "click",
      closeMenu
    );

  });


/* =========================
   فیلترها
========================= */

function renderFilters() {

  const reciter =
    document.getElementById("reciter");

  const speaker =
    document.getElementById("speaker");


  if (!reciter || !speaker) {
    return;
  }


  const reciters =
    [...new Set(
      reports
        .map(x => x.reciter)
        .filter(Boolean)
    )];


  const speakers =
    [...new Set(
      reports
        .map(x => x.speaker)
        .filter(Boolean)
    )];


  reciter.innerHTML =
    '<option value="">مداح</option>' +
    reciters.map(
      x => `<option>${escapeHtml(x)}</option>`
    ).join("");


  speaker.innerHTML =
    '<option value="">سخنران</option>' +
    speakers.map(
      x => `<option>${escapeHtml(x)}</option>`
    ).join("");

}


/* =========================
   کارت گزارش
========================= */

function reportCard(report) {

  const audio =
    report.audio

      ? `
        <a
          class="play"
          href="${escapeHtml(report.audio)}"
          target="_blank">
          ▶ پخش صوت
        </a>
      `

      : `
        <span class="meta">
          فایل صوتی هنوز اضافه نشده
        </span>
      `;


  return `

    <article class="card">

      <h4>
        ${escapeHtml(report.title)}
      </h4>

      <div class="meta">
        مداح:
        ${escapeHtml(report.reciter || "-")}
      </div>

      <div class="meta">
        سخنران:
        ${escapeHtml(report.speaker || "-")}
      </div>

      <div class="meta">
        ${escapeHtml(report.style || "-")}
        |
        ${escapeHtml(report.event || "-")}
      </div>

      ${audio}

    </article>

  `;

}


/* =========================
   نمایش آرشیو
========================= */

function render() {

  const grid =
    document.getElementById("grid");

  const latestRow =
    document.getElementById("latestRow");


  const q =
    document.getElementById("q")?.value
      .trim()
      .toLowerCase() || "";


  const style =
    document.getElementById("style")?.value || "";


  const event =
    document.getElementById("event")?.value || "";


  const reciter =
    document.getElementById("reciter")?.value || "";


  const speaker =
    document.getElementById("speaker")?.value || "";


  const filtered =
    reports.filter(function (r) {

      const text =
        `${r.title} ${r.reciter} ${r.speaker}`
          .toLowerCase();


      return (

        (!q || text.includes(q)) &&

        (!style || r.style === style) &&

        (!event || r.event === event) &&

        (!reciter || r.reciter === reciter) &&

        (!speaker || r.speaker === speaker)

      );

    });


  if (grid) {

    grid.innerHTML =
      filtered.length

        ? filtered.map(reportCard).join("")

        : `
          <div class="empty">
            گزارشی پیدا نشد.
          </div>
        `;

  }


  if (latestRow) {

    latestRow.innerHTML =
      reports
        .slice()
        .reverse()
        .slice(0, 3)
        .map(reportCard)
        .join("");

  }

}


/* فیلترها */

[
  "q",
  "style",
  "event",
  "year",
  "reciter",
  "speaker"

].forEach(function (id) {

  const element =
    document.getElementById(id);


  if (!element) {
    return;
  }


  element.addEventListener(
    "input",
    render
  );


  element.addEventListener(
    "change",
    render
  );

});


/* دکمه‌های آخرین گزارش‌ها */

const latestRow =
  document.getElementById("latestRow");

const prev =
  document.getElementById("prev");

const next =
  document.getElementById("next");


if (prev && latestRow) {

  prev.onclick = function () {

    latestRow.scrollBy({
      left: -300,
      behavior: "smooth"
    });

  };

}


if (next && latestRow) {

  next.onclick = function () {

    latestRow.scrollBy({
      left: 300,
      behavior: "smooth"
    });

  };

}


/* =========================
   ورود مدیریت
========================= */

const loginBtn =
  document.getElementById("loginBtn");

const password =
  document.getElementById("adminPassword");

const loginError =
  document.getElementById("loginError");

const loginBox =
  document.getElementById("loginBox");

const panelBox =
  document.getElementById("panelBox");

const logoutBtn =
  document.getElementById("logoutBtn");


function showAdmin() {

  loginBox.classList.add("hidden");

  panelBox.classList.remove("hidden");

  renderManage();

}


function showLogin() {

  panelBox.classList.add("hidden");

  loginBox.classList.remove("hidden");

}


if (loginBtn) {

  loginBtn.onclick = function () {

    if (password.value === ADMIN_PASSWORD) {

      sessionStorage.setItem(
        "admin_logged",
        "yes"
      );

      loginError.textContent = "";

      showAdmin();

    }

    else {

      loginError.textContent =
        "رمز مدیریت اشتباه است.";

    }

  };

}


if (password) {

  password.addEventListener(
    "keydown",
    function (e) {

      if (e.key === "Enter") {
        loginBtn.click();
      }

    }
  );

}


if (
  sessionStorage.getItem(
    "admin_logged"
  ) === "yes"
) {

  showAdmin();

}


if (logoutBtn) {

  logoutBtn.onclick = function () {

    sessionStorage.removeItem(
      "admin_logged"
    );

    showLogin();

  };

}


/* =========================
   افزودن گزارش
========================= */

const addReport =
  document.getElementById("addReport");


if (addReport) {

  addReport.onclick = function () {

    const title =
      document
        .getElementById("newTitle")
        .value
        .trim();


    if (!title) {

      alert(
        "لطفاً عنوان گزارش را وارد کنید."
      );

      return;

    }


    reports.push({

      id: Date.now(),

      title: title,

      reciter:
        document
          .getElementById("newReciter")
          .value
          .trim(),

      speaker:
        document
          .getElementById("newSpeaker")
          .value
          .trim(),

      style:
        document
          .getElementById("newStyle")
          .value,

      event:
        document
          .getElementById("newEvent")
          .value,

      audio:
        document
          .getElementById("newAudio")
          .value
          .trim()

    });


    saveReports();

    renderFilters();

    render();

    renderManage();


    [
      "newTitle",
      "newReciter",
      "newSpeaker",
      "newStyle",
      "newEvent",
      "newAudio"

    ].forEach(function (id) {

      document.getElementById(id).value = "";

    });


    alert(
      "گزارش با موفقیت اضافه شد."
    );

  };

}


/* =========================
   لیست مدیریت
========================= */

function renderManage() {

  const list =
    document.getElementById("manageList");


  if (!list) {
    return;
  }


  if (reports.length === 0) {

    list.innerHTML =
      `
        <p class="empty">
          گزارشی وجود ندارد.
        </p>
      `;

    return;

  }


  list.innerHTML =
    reports.map(function (r) {

      return `

        <div class="manage-item">

          <div>

            <strong>
              ${escapeHtml(r.title)}
            </strong>

            <div class="meta">
              ${escapeHtml(r.reciter || "-")}
            </div>

          </div>

          <button
            class="delete"
            onclick="deleteReport(${r.id})">

            حذف

          </button>

        </div>

      `;

    }).join("");

}


/* حذف */

window.deleteReport =
  function (id) {

    if (
      !confirm(
        "این گزارش حذف شود؟"
      )
    ) {
      return;
    }


    reports =
      reports.filter(
        r => r.id !== id
      );


    saveReports();

    renderFilters();

    render();

    renderManage();

  };


/* اجرا */

renderFilters();

render();
