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


function saveReports() {
  localStorage.setItem(
    "jannat_reports",
    JSON.stringify(reports)
  );
}


function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================
   صفحه اصلی
========================= */

function initHome() {

  const menuBtn = document.getElementById("menuBtn");
  const drawer = document.getElementById("drawer");
  const closeBtn = document.getElementById("close");
  const shade = document.getElementById("shade");

  if (menuBtn && drawer) {

    menuBtn.onclick = function () {
      drawer.classList.add("open");

      if (shade) {
        shade.classList.add("show");
      }
    };

  }

  function closeMenu() {

    if (drawer) {
      drawer.classList.remove("open");
    }

    if (shade) {
      shade.classList.remove("show");
    }

  }

  if (closeBtn) {
    closeBtn.onclick = closeMenu;
  }

  if (shade) {
    shade.onclick = closeMenu;
  }


  document
    .querySelectorAll(".drawer a")
    .forEach(function (a) {

      a.addEventListener(
        "click",
        closeMenu
      );

    });


  renderFilters();
  render();


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


  const prev =
    document.getElementById("prev");

  const next =
    document.getElementById("next");

  const latestRow =
    document.getElementById("latestRow");


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

}


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


  const reciters = [
    ...new Set(
      reports
        .map(x => x.reciter)
        .filter(Boolean)
    )
  ];


  const speakers = [
    ...new Set(
      reports
        .map(x => x.speaker)
        .filter(Boolean)
    )
  ];


  reciter.innerHTML =
    '<option value="">مداح</option>' +
    reciters
      .map(
        x =>
          `<option>${escapeHtml(x)}</option>`
      )
      .join("");


  speaker.innerHTML =
    '<option value="">سخنران</option>' +
    speakers
      .map(
        x =>
          `<option>${escapeHtml(x)}</option>`
      )
      .join("");

}


/* =========================
   کارت گزارش
========================= */

function reportCard(report) {

  let audio = "";

  if (report.audio) {

    audio =
      `<a
        class="play"
        href="${escapeHtml(report.audio)}"
        target="_blank"
      >
        ▶ پخش صوت
      </a>`;

  } else {

    audio =
      `<span class="meta">
        فایل صوتی هنوز اضافه نشده
      </span>`;

  }


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


  if (!grid && !latestRow) {
    return;
  }


  const qElement =
    document.getElementById("q");

  const styleElement =
    document.getElementById("style");

  const eventElement =
    document.getElementById("event");

  const reciterElement =
    document.getElementById("reciter");

  const speakerElement =
    document.getElementById("speaker");


  const q =
    qElement
      ? qElement.value.trim().toLowerCase()
      : "";

  const style =
    styleElement
      ? styleElement.value
      : "";

  const event =
    eventElement
      ? eventElement.value
      : "";

  const reciter =
    reciterElement
      ? reciterElement.value
      : "";

  const speaker =
    speakerElement
      ? speakerElement.value
      : "";


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
        : `<div class="empty">
             گزارشی پیدا نشد.
           </div>`;

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


/* =========================
   پنل مدیریت
========================= */

function initAdminPanel() {

  const loginBox =
    document.getElementById("loginBox");

  const panelBox =
    document.getElementById("panelBox");

  const loginBtn =
    document.getElementById("loginBtn");

  const logoutBtn =
    document.getElementById("logoutBtn");

  const password =
    document.getElementById("adminPassword");

  const loginError =
    document.getElementById("loginError");


  if (
    !loginBox ||
    !panelBox ||
    !loginBtn ||
    !password
  ) {

    return;

  }


  function showAdmin() {

    loginBox.classList.add("hidden");

    panelBox.classList.remove("hidden");

    renderManage();

  }


  function showLogin() {

    loginBox.classList.remove("hidden");

    panelBox.classList.add("hidden");

    password.value = "";

  }


  if (
    sessionStorage.getItem(
      "admin_logged"
    ) === "yes"
  ) {

    showAdmin();

  }


  loginBtn.onclick =
    function () {

      if (
        password.value ===
        ADMIN_PASSWORD
      ) {

        sessionStorage.setItem(
          "admin_logged",
          "yes"
        );

        loginError.textContent = "";

        showAdmin();

      } else {

        loginError.textContent =
          "رمز مدیریت اشتباه است.";

      }

    };


  password.addEventListener(
    "keydown",
    function (e) {

      if (e.key === "Enter") {
        loginBtn.click();
      }

    }
  );


  if (logoutBtn) {

    logoutBtn.onclick =
      function () {

        sessionStorage.removeItem(
          "admin_logged"
        );

        showLogin();

      };

  }


  const addReport =
    document.getElementById(
      "addReport"
    );


  if (addReport) {

    addReport.onclick =
      function () {

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

        [
          "newTitle",
          "newReciter",
          "newSpeaker",
          "newStyle",
          "newEvent",
          "newAudio"
        ].forEach(function (id) {

          const element =
            document.getElementById(id);

          if (element) {
            element.value = "";
          }

        });


        render();

        renderManage();

        alert(
          "گزارش با موفقیت اضافه شد."
        );

      };

  }

}


/* =========================
   لیست مدیریت
========================= */

function renderManage() {

  const list =
    document.getElementById(
      "manageList"
    );


  if (!list) {
    return;
  }


  if (reports.length === 0) {

    list.innerHTML =
      `<p class="empty">
        گزارشی وجود ندارد.
      </p>`;

    return;

  }


  list.innerHTML =
    reports
      .map(function (r) {

        return `
          <div class="manage-item">

            <div>

              <strong>
                ${escapeHtml(r.title)}
              </strong>

              <div class="meta">
                ${escapeHtml(
                  r.reciter || "-"
                )}
              </div>

            </div>

            <button
              class="delete"
              onclick="deleteReport(${r.id})"
            >
              حذف
            </button>

          </div>
        `;

      })
      .join("");

}


/* =========================
   حذف گزارش
========================= */

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

    render();

    renderManage();

  };


/* اجرای صفحه */
if (
  document.getElementById("menuBtn")
) {

  initHome();

}
