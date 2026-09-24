const SUPABASE_URL = "https://czmioufbvbdkshsjqofs.supabase.co/rest/v1/";
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
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/bureaux_enregistrement?select=nom,ville,pays,site_web,telephone&actif=eq.true&order=nom.asc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors du chargement des bureaux.");
    }

    bureaux = await response.json();

    filtered = bureaux;
    currentPage = 1;

    renderBureaux();

  } catch (error) {
    console.error(error);

    bureauxList.innerHTML = `
      <tr>
        <td colspan="5" class="empty">
          Impossible de charger les bureaux d'enregistrement.
        </td>
      </tr>
    `;

    counter.textContent = "Erreur de chargement";
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
  const end = start + PAGE_SIZE;

  const paginated = filtered.slice(start, end);

  counter.textContent =
    `${filtered.length} bureau${filtered.length > 1 ? "x" : ""} accrédité${filtered.length > 1 ? "s" : ""}`;

  pageInfo.textContent =
    `Page ${currentPage} / ${totalPages}`;

  previousButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;

  if (paginated.length === 0) {
    bureauxList.innerHTML = `
      <tr>
        <td colspan="5" class="empty">
          Aucun bureau trouvé.
        </td>
      </tr>
    `;
    return;
  }

  bureauxList.innerHTML = paginated.map(bureau => {

    let website = bureau.site_web || "";

    if (website && !website.startsWith("http://") && !website.startsWith("https://")) {
      website = `https://${website}`;
    }

    return `
      <tr>

        <td class="bureau-name">
          ${escapeHtml(bureau.nom || "-")}
        </td>

        <td>
          ${escapeHtml(bureau.ville || "-")}
        </td>

        <td>
          ${escapeHtml(bureau.pays || "-")}
        </td>

        <td>
          ${
            website
              ? `<a
                  href="${escapeAttribute(website)}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="website"
                >
                  Visiter
                </a>`
              : "-"
          }
        </td>

        <td>
          ${escapeHtml(bureau.telephone || "-")}
        </td>

      </tr>
    `;

  }).join("");
}

searchInput.addEventListener("input", function () {

  const query = this.value
    .trim()
    .toLowerCase();

  filtered = bureaux.filter(bureau => {

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

  const totalPages = Math.ceil(
    filtered.length / PAGE_SIZE
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
