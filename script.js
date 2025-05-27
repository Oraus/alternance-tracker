const entreprises = [
  { nom: "Entreprise A", secteur: "Informatique", salaries: 120, lat: 48.860, lon: 2.340 },
  { nom: "Entreprise B", secteur: "Ingénierie", salaries: 50, lat: 48.853, lon: 2.370 },
  { nom: "Entreprise C", secteur: "Marketing", salaries: 30, lat: 48.870, lon: 2.310 }
];

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

document.getElementById("traceCercle").addEventListener("click", () => {
  const adresse = document.getElementById("domicile").value;
  const rayonKm = parseFloat(document.getElementById("rayon").value);
  if (!adresse || isNaN(rayonKm)) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}`)
    .then(res => res.json())
    .then(data => {
      if (data && data[0]) {
        const latUser = parseFloat(data[0].lat);
        const lonUser = parseFloat(data[0].lon);
        const container = document.getElementById("resultatsAide");
        container.innerHTML = "";
        entreprises.forEach(ent => {
          const distance = getDistance(latUser, lonUser, ent.lat, ent.lon);
          if (distance <= rayonKm) {
            const div = document.createElement("div");
            div.className = "aide-item";
            div.innerHTML = `<strong>${ent.nom}</strong><br>Secteur : ${ent.secteur}<br>Salariés : ${ent.salaries}<br>Distance : ${distance.toFixed(2)} km`;
            container.appendChild(div);
          }
        });
      }
    });
});

// Suivi de candidatures
const tableau = document.querySelector('#tableau tbody');
const form = document.getElementById('form');
let candidatures = [];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const entreprise = document.getElementById('entreprise').value.trim();
  const adresse = document.getElementById('adresse').value.trim();
  const statut = document.getElementById('statut').value;
  const date = new Date().toLocaleDateString();
  if (entreprise && adresse) {
    candidatures.push({ entreprise, statut, date });
    afficherCandidatures();
    form.reset();
  }
});

function afficherCandidatures() {
  tableau.innerHTML = '';
  candidatures.forEach((c, i) => {
    const ligne = document.createElement('tr');
    ligne.innerHTML = `<td>${c.entreprise}</td><td>${c.statut}</td><td>${c.date}</td><td><button onclick="supprimer(${i})">Supprimer</button></td>`;
    tableau.appendChild(ligne);
  });
}

function supprimer(i) {
  candidatures.splice(i, 1);
  afficherCandidatures();
}
