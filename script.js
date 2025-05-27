// script.js complet avec carte, sauvegarde, modification et couleurs de marqueurs

const entreprises = [
  { nom: "Entreprise A", secteur: "Informatique", salaries: 120, lat: 48.860, lon: 2.340 },
  { nom: "Entreprise B", secteur: "Ingénierie", salaries: 50, lat: 48.853, lon: 2.370 },
  { nom: "Entreprise C", secteur: "Marketing", salaries: 30, lat: 48.870, lon: 2.310 }
];

let map = L.map('map').setView([48.8566, 2.3522], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let cercleDomicile = null;
let markers = [];

function toRadians(deg) {
  return deg * Math.PI / 180;
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const form = document.getElementById('form');
const tableau = document.querySelector('#tableau tbody');
let candidatures = JSON.parse(localStorage.getItem('candidatures')) || [];
let editIndex = null;

function clearMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}

document.getElementById("traceCercle").addEventListener("click", () => {
  const adresse = document.getElementById("domicile").value;
  const rayonKm = parseFloat(document.getElementById("rayon").value);
  if (!adresse || isNaN(rayonKm)) return;

  localStorage.setItem("zoneDomicile", JSON.stringify({ adresse, rayonKm }));

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}`)
    .then(res => res.json())
    .then(data => {
      if (data && data[0]) {
        const latUser = parseFloat(data[0].lat);
        const lonUser = parseFloat(data[0].lon);

        if (cercleDomicile) map.removeLayer(cercleDomicile);
        cercleDomicile = L.circle([latUser, lonUser], {
          radius: rayonKm * 1000,
          color: 'deepskyblue',
          fillColor: 'skyblue',
          fillOpacity: 0.2
        }).addTo(map);
        map.setView([latUser, lonUser], 12);

        const container = document.getElementById("resultatsAide");
        container.innerHTML = "";

        clearMarkers();
        afficherMarqueursCandidatures();

        entreprises.forEach(ent => {
          const distance = getDistance(latUser, lonUser, ent.lat, ent.lon);
          if (distance <= rayonKm) {
            const div = document.createElement("div");
            div.className = "aide-item";
            div.innerHTML = `<strong>${ent.nom}</strong><br>Secteur : ${ent.secteur}<br>Salariés : ${ent.salaries}<br>Distance : ${distance.toFixed(2)} km`;
            container.appendChild(div);

            const marker = L.marker([ent.lat, ent.lon], {
              icon: L.icon({
                iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png',
                iconSize: [32, 32],
                iconAnchor: [16, 32]
              })
            }).addTo(map).bindPopup(`<strong>${ent.nom}</strong><br>${ent.secteur}`);
            markers.push(marker);
          }
        });
      }
    });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const entreprise = document.getElementById('entreprise').value.trim();
  const adresse = document.getElementById('adresse').value.trim();
  const statut = document.getElementById('statut').value;
  const date = new Date().toLocaleDateString();

  if (!entreprise || !adresse) return;

  if (editIndex === null) {
    candidatures.push({ entreprise, adresse, statut, date });
  } else {
    candidatures[editIndex] = { entreprise, adresse, statut, date };
    editIndex = null;
  }

  localStorage.setItem('candidatures', JSON.stringify(candidatures));
  form.reset();
  afficherCandidatures();
  afficherMarqueursCandidatures();
});

function afficherCandidatures() {
  tableau.innerHTML = '';
  candidatures.forEach((c, i) => {
    const ligne = document.createElement('tr');
    ligne.innerHTML = `
      <td>${c.entreprise}</td>
      <td>${c.statut}</td>
      <td>${c.date}</td>
      <td>
        <button onclick="modifier(${i})">Modifier</button>
        <button onclick="supprimer(${i})">Supprimer</button>
      </td>
    `;
    tableau.appendChild(ligne);
  });
}

function afficherMarqueursCandidatures() {
  candidatures.forEach(c => {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(c.adresse)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data[0]) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);

          const marker = L.marker([lat, lon], {
            icon: L.icon({
              iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png',
              iconSize: [32, 32],
              iconAnchor: [16, 32]
            })
          }).addTo(map).bindPopup(`<strong>${c.entreprise}</strong><br>${c.statut}`);
          markers.push(marker);
        }
      });
  });
}

function modifier(i) {
  const c = candidatures[i];
  document.getElementById('entreprise').value = c.entreprise;
  document.getElementById('adresse').value = c.adresse;
  document.getElementById('statut').value = c.statut;
  editIndex = i;
}

function supprimer(i) {
  if (confirm("Supprimer cette candidature ?")) {
    candidatures.splice(i, 1);
    localStorage.setItem('candidatures', JSON.stringify(candidatures));
    afficherCandidatures();
    afficherMarqueursCandidatures();
  }
}

function chargerZoneDepuisLocalStorage() {
  const zone = JSON.parse(localStorage.getItem("zoneDomicile"));
  if (!zone) return;
  document.getElementById("domicile").value = zone.adresse;
  document.getElementById("rayon").value = zone.rayonKm;
  document.getElementById("traceCercle").click();
}

afficherCandidatures();
afficherMarqueursCandidatures();
chargerZoneDepuisLocalStorage();
