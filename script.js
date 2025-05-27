const form = document.getElementById('form');
const tableau = document.querySelector('#tableau tbody');
const filtre = document.getElementById('filtreStatut');
const inputEntreprise = document.getElementById('entreprise');
const inputAdresse = document.getElementById('adresse');
const inputStatut = document.getElementById('statut');
const inputEditIndex = document.getElementById('editIndex');
const boutonSubmit = form.querySelector('button[type="submit"]');
const boutonAnnuler = document.createElement("button");

boutonAnnuler.textContent = "Annuler";
boutonAnnuler.type = "button";
boutonAnnuler.style.display = "none";
form.appendChild(boutonAnnuler);

let candidatures = JSON.parse(localStorage.getItem('candidatures')) || [];
let marqueurs = JSON.parse(localStorage.getItem('marqueurs')) || [];

const map = L.map('map').setView([48.8566, 2.3522], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 🔁 Marqueurs persistants
function afficherMarqueurs() {
  marqueurs.forEach(({ entreprise, lat, lon, adresse }) => {
    L.marker([lat, lon]).addTo(map)
      .bindPopup(`<strong>${entreprise}</strong><br>${adresse}`);
  });

  if (marqueurs.length > 0) {
    const last = marqueurs[marqueurs.length - 1];
    map.setView([last.lat, last.lon], 13);
  }
}

function enregistrer() {
  localStorage.setItem('candidatures', JSON.stringify(candidatures));
  localStorage.setItem('marqueurs', JSON.stringify(marqueurs));
}

function afficherCandidatures() {
  tableau.innerHTML = '';
  const statutFiltre = filtre.value;

  candidatures.forEach((c, index) => {
    if (!c.date) {
      c.date = new Date().toLocaleString();
      enregistrer();
    }

    if (statutFiltre === 'Tous' || c.statut === statutFiltre) {
      const ligne = document.createElement('tr');
      ligne.innerHTML = `
        <td>${c.entreprise}</td>
        <td>${c.statut}</td>
        <td>${c.date}</td>
        <td>
          <button class="edit" data-index="${index}">Modifier</button>
          <button class="delete" data-index="${index}">Supprimer</button>
        </td>
      `;
      tableau.appendChild(ligne);
    }
  });
}

form.addEventListener('submit', function (e) {
  e.preventDefault();
  const entreprise = inputEntreprise.value.trim();
  const adresse = inputAdresse.value.trim();
  const statut = inputStatut.value;
  const now = new Date().toLocaleString();

  if (entreprise && adresse) {
    const index = inputEditIndex.value;

    if (index === "") {
      candidatures.push({ entreprise, adresse, statut, date: now });
      geocoder(entreprise, adresse);
    } else {
      candidatures[index] = { entreprise, adresse, statut, date: now };
    }

    enregistrer();
    afficherCandidatures();
    form.reset();
    inputEditIndex.value = "";
    boutonSubmit.textContent = "Ajouter";
    boutonAnnuler.style.display = "none";
  }
});

tableau.addEventListener('click', function (e) {
  const index = e.target.getAttribute('data-index');

  if (e.target.classList.contains('delete')) {
    candidatures.splice(index, 1);
    marqueurs.splice(index, 1);
    enregistrer();
    afficherCandidatures();
    location.reload(); // recharge la carte avec les bons marqueurs
  }

  if (e.target.classList.contains('edit')) {
    const c = candidatures[index];
    inputEntreprise.value = c.entreprise;
    inputAdresse.value = c.adresse;
    inputStatut.value = c.statut;
    inputEditIndex.value = index;
    boutonSubmit.textContent = "Mettre à jour";
    boutonAnnuler.style.display = "inline-block";
  }
});

boutonAnnuler.addEventListener('click', () => {
  form.reset();
  inputEditIndex.value = "";
  boutonSubmit.textContent = "Ajouter";
  boutonAnnuler.style.display = "none";
});

filtre.addEventListener('change', afficherCandidatures);

afficherCandidatures();
afficherMarqueurs();

function geocoder(entreprise, adresse) {
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}`)
    .then(res => res.json())
    .then(data => {
      if (data && data[0]) {
        const { lat, lon, display_name } = data[0];
        L.marker([lat, lon]).addTo(map)
          .bindPopup(`<strong>${entreprise}</strong><br>${display_name}`)
          .openPopup();
        map.setView([lat, lon], 13);
        marqueurs.push({ entreprise, adresse: display_name, lat, lon });
        enregistrer();
      }
    })
    .catch(err => console.error("Erreur géocodage :", err));
}
