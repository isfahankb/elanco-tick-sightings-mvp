// ---- SAMPLE SIGHTING DATA ----
// In your README you can say: "This structure can be swapped with real API data."
const sampleSightings = [
  {
    id: 1,
    date: "2025-05-12T10:30:00Z",
    location: "Manchester",
    species: "Ixodes ricinus",
    latinName: "Ixodes ricinus",
    severity: "Medium",
    lat: 53.4808,
    lng: -2.2426
  },
  {
    id: 2,
    date: "2025-06-03T15:00:00Z",
    location: "London",
    species: "Dermacentor reticulatus",
    latinName: "Dermacentor reticulatus",
    severity: "High",
    lat: 51.5074,
    lng: -0.1278
  },
  {
    id: 3,
    date: "2025-04-21T09:15:00Z",
    location: "Edinburgh",
    species: "Ixodes ricinus",
    latinName: "Ixodes ricinus",
    severity: "Low",
    lat: 55.9533,
    lng: -3.1883
  }
];

let allSightings = sampleSightings;
let filteredSightings = sampleSightings;
let activeSighting = sampleSightings[0];

// ---- MAP SETUP ----
const map = L.map("map").setView([54.5, -3], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap"
}).addTo(map);

let markersLayer = L.layerGroup().addTo(map);

// ---- FILTER ELEMENTS ----
const speciesFilter = document.getElementById("speciesFilter");
const locationFilter = document.getElementById("locationFilter");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");

function populateFilterOptions() {
  const speciesSet = new Set();
  const locationSet = new Set();

  allSightings.forEach(s => {
    if (s.species) speciesSet.add(s.species);
    if (s.location) locationSet.add(s.location);
  });

  speciesFilter.innerHTML = '<option value="all">All species</option>';
  locationFilter.innerHTML = '<option value="all">All locations</option>';

  Array.from(speciesSet)
    .sort()
    .forEach(sp => {
      const opt = document.createElement("option");
      opt.value = sp;
      opt.textContent = sp;
      speciesFilter.appendChild(opt);
    });

  Array.from(locationSet)
    .sort()
    .forEach(loc => {
      const opt = document.createElement("option");
      opt.value = loc;
      opt.textContent = loc;
      locationFilter.appendChild(opt);
    });
}

// ---- APPLY FILTERS ----
function applyFilters() {
  const speciesVal = speciesFilter.value;
  const locVal = locationFilter.value;
  const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
  const endDate = endDateInput.value ? new Date(endDateInput.value) : null;

  filteredSightings = allSightings.filter(s => {
    const d = new Date(s.date);

    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    if (speciesVal !== "all" && s.species !== speciesVal) return false;
    if (locVal !== "all" && s.location !== locVal) return false;

    return true;
  });

  activeSighting = filteredSightings.length > 0 ? filteredSightings[0] : null;

  renderMarkers();
  renderSightingDetails();
}

// ---- MARKERS ON MAP ----
function renderMarkers() {
  markersLayer.clearLayers();

  filteredSightings.forEach(s => {
    const marker = L.marker([s.lat, s.lng]).addTo(markersLayer);
    marker.bindPopup(
      `<strong>${s.species}</strong><br>${s.location}<br>${new Date(
        s.date
      ).toLocaleString("en-GB")}`
    );

    marker.on("click", () => {
      activeSighting = s;
      renderSightingDetails();
    });
  });
}

// ---- SIGHTING DETAILS PANEL ----
function renderSightingDetails() {
  const container = document.getElementById("sightingDetails");

  if (!activeSighting) {
    container.innerHTML =
      "<p style='font-size:0.85rem;'>No sightings match the current filters.</p>";
    return;
  }

  const s = activeSighting;

  container.innerHTML = `
    <div class="section-title">Sighting details</div>
    <ul class="details-list">
      <li><strong>Species:</strong> ${s.species} (${s.latinName})</li>
      <li><strong>Location:</strong> ${s.location}</li>
      <li><strong>Date & time:</strong> ${new Date(s.date).toLocaleString("en-GB")}</li>
      <li><strong>Severity:</strong> ${s.severity}</li>
    </ul>
    <div style="margin-top:0.5rem; display:flex; gap:0.4rem; flex-wrap:wrap;">
      <button class="primary">Report a sighting</button>
      <button class="primary" style="background:#145a32;">Get directions</button>
      <button class="primary" style="background:#6c3483;">Share</button>
    </div>
  `;
}

// ---- EDUCATION SECTION ----
function renderEducationSection() {
  const container = document.getElementById("educationSection");

  container.innerHTML = `
    <div class="section-title">Education & prevention</div>
    <div class="education-tabs">
      <button data-tab="species" class="active">Species</button>
      <button data-tab="prevention">Prevention</button>
      <button data-tab="seasonal">Seasonal</button>
    </div>
    <div id="educationContent" style="font-size:0.8rem;"></div>
  `;

  const content = document.getElementById("educationContent");
  const tabs = container.querySelectorAll(".education-tabs button");

  function setTab(tab) {
    tabs.forEach(btn =>
      btn.classList.toggle("active", btn.dataset.tab === tab)
    );

    if (tab === "species") {
      content.innerHTML = `
        <strong>Tick species:</strong> Different tick species prefer different habitats and hosts.
        <br/><br/>
        <strong>Ixodes ricinus</strong> is common in the UK and frequently found on dogs, cats and people
        after walking through long grass or woodland.
      `;
    } else if (tab === "prevention") {
      content.innerHTML = `
        <ul class="details-list">
          <li>Check pets after walks, especially ears, neck, armpits and paws.</li>
          <li>Use veterinary-approved tick preventatives on a regular schedule.</li>
          <li>Keep grass short in gardens and avoid long grass in peak season.</li>
          <li>Remove ticks using a proper tick remover; avoid squeezing the body.</li>
        </ul>
      `;
    } else if (tab === "seasonal") {
      content.innerHTML = `
        Tick activity often increases in warmer, humid months.
        <br/><br/>
        Combining this map with a data dashboard helps identify which months and
        regions see the most activity so vets and owners can plan preventatives in advance.
      `;
    }
  }

  tabs.forEach(btn =>
    btn.addEventListener("click", () => setTab(btn.dataset.tab))
  );

  setTab("species");
}

// ---- REPORT FORM ----
function renderReportForm() {
  const container = document.getElementById("reportFormSection");

  container.innerHTML = `
    <div class="section-title">Report a new sighting</div>
    <form id="reportForm" class="report-form" novalidate>
      <input type="date" id="reportDate" required />
      <input type="time" id="reportTime" required />
      <input type="text" id="reportLocation" placeholder="Location (e.g. Liverpool park)" required />
      <input type="text" id="reportSpecies" placeholder="Tick species (if known)" required />
      <textarea id="reportNotes" rows="2" placeholder="Additional notes (optional)"></textarea>
      <button type="submit" class="primary">Submit sighting</button>
      <div id="reportFeedback" class="feedback"></div>
    </form>
  `;

  const form = document.getElementById("reportForm");
  const feedback = document.getElementById("reportFeedback");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    feedback.textContent = "";
    feedback.className = "feedback";

    const date = document.getElementById("reportDate").value;
    const time = document.getElementById("reportTime").value;
    const location = document.getElementById("reportLocation").value.trim();
    const species = document.getElementById("reportSpecies").value.trim();
    const notes = document.getElementById("reportNotes").value.trim();

    if (!date || !time || !location || !species) {
      feedback.textContent = "Please fill in date, time, location and species.";
      feedback.classList.add("error");
      return;
    }

    // Here you would POST to your own backend.
    console.log("New sighting submitted:", {
      date,
      time,
      location,
      species,
      notes
    });

    feedback.textContent = "Thank you – your tick sighting has been recorded.";
    feedback.classList.add("success");

    form.reset();
  });
}

// ---- INITIAL PAGE LOAD ----
function init() {
  populateFilterOptions();
  renderMarkers();
  renderSightingDetails();
  renderEducationSection();
  renderReportForm();

  applyFiltersBtn.addEventListener("click", applyFilters);
}

init();
