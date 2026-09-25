const SUPABASE_URL = "https://czmioufbvbdkshsjqofs.supabase.co";
const SUPABASE_KEY = "sb_publishable_hInH0saQtu0BVbdVglaPmw_Ze8DqZuf";

const PAGE_SIZE = 10;

let bureaux = [];
let filtered = [];
let currentPage = 1;

const searchInput = document.getElementById("search");
const bureauxList = document.getElementById("bureaux-list");
const counter = document.getElementById("counter");
const previousButton = document.getElementById("previous");
const nextButton = document.getElementById("next");
const pageInfo = document.getElementById("page-info");

async function loadBureaux() {
  try {
    const url =
      `${SUPABASE_URL}/rest/v1/bureaux_enregistrement` +
      `?select=nom,ville,pays,site_web,telephone` +
      `&actif=eq.true` +
      `&order=nom.asc`;

    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase HTTP ${response.status}`);
    }

    bureaux = await response.json();
    filtered = bureaux;
    currentPage = 1;

    renderBureaux();

  } catch (error) {
    console.error("Erreur bureaux :", error);

    if (bureauxList) {
      bureauxList.innerHTML = `
        <div class="empty">
          Impossible de charger les bureaux d'enregistrement.
        </div>
      `;
    }

    if (counter) {
      counter.textContent = "Erreur de chargement";
    }
  }
}

function renderBureaux() {
  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const start = (currentPage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);

  counter.textContent =
    `${filtered.length} bureau${filtered.length > 1 ? "x" : ""} accrédité${filtered.length > 1 ? "s" : ""}`;

  pageInfo.textContent =
    `Page ${currentPage} / ${totalPages}`;

  previousButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;

  if (paginated.length === 0) {
    bureauxList.innerHTML = `
      <div class="empty">
        Aucun bureau trouvé.
      </div>
    `;
    return;
  }

  bureauxList.innerHTML = paginated.map(function (bureau) {

    let website = bureau.site_web || "";

    if (
      website &&
      !website.startsWith("http://") &&
      !website.startsWith("https://")
    ) {
      website = `https://${website}`;
    }

    return `
      <article class="bureau-card">

        <h2 class="bureau-card-name">
          ${escapeHtml(bureau.nom || "-")}
        </h2>

        <div class="bureau-card-info">

          <div class="info-row">
            <span class="info-label">Ville</span>
            <span class="info-value">
              ${escapeHtml(bureau.ville || "-")}
            </span>
          </div>

          <div class="info-row">

  <span class="info-label">
    Téléphone
  </span>

  <span class="info-value">

    ${
      bureau.telephone
        ? `
          <a
            href="tel:${escapeAttribute(bureau.telephone)}"
            class="phone-link"
          >
            ${escapeHtml(bureau.telephone)}
          </a>
        `
        : "-"
    }

  </span>

</div>

          <div class="info-row">
            <span class="info-label">Site Web</span>
            <span class="info-value">
              ${
                website
                  ? `<a
                      href="${escapeAttribute(website)}"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="website"
                    >Visiter le site</a>`
                  : "-"
              }
            </span>
          </div>

          <div class="info-row">
            <span class="info-label">Téléphone</span>
            <span class="info-value">
              ${escapeHtml(bureau.telephone || "-")}
            </span>
          </div>

        </div>

      </article>
    `;

  }).join("");
}

searchInput.addEventListener("input", function () {
  const query = this.value.trim().toLowerCase();

  filtered = bureaux.filter(function (bureau) {

    const nom = (bureau.nom || "").toLowerCase();
    const ville = (bureau.ville || "").toLowerCase();
    const pays = (bureau.pays || "").toLowerCase();

    return (
      nom.includes(query) ||
      ville.includes(query) ||
      pays.includes(query)
    );
  });

  currentPage = 1;
  renderBureaux();
});

previousButton.addEventListener("click", function () {
  if (currentPage > 1) {
    currentPage--;
    renderBureaux();
  }
});

nextButton.addEventListener("click", function () {
  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );

  if (currentPage < totalPages) {
    currentPage++;
    renderBureaux();
  }
});

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return String(value)
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

loadBureaux();
