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

const map = L.map('map').setView([48.8566, 2.3522], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

function enregistrer() {
  localStorage.setItem('candidatures', JSON.stringify(candidatures));
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

function afficherMarqueurs() {
  candidatures.forEach(c => {
    if (c.lat && c.lon) {
      L.marker([c.lat, c.lon])
        .addTo(map)
        .bindPopup(`<strong>${c.entreprise}</strong><br>${c.adresse}`);
    }
  });
}

function geocoderEtAjouterMarqueur(index) {
  const c = candidatures[index];

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(c.adresse)}`)
    .then(res => res.json())
    .then(data => {
      if (data && data[0]) {
        const { lat, lon, display_name } = data[0];
        c.lat = parseFloat(lat);
        c.lon = parseFloat(lon);
        c.adresse = display_name;

        L.marker([c.lat, c.lon])
          .addTo(map)
          .bindPopup(`<strong>${c.entreprise}</strong><br>${display_name}`)
          .openPopup();

        map.setView([c.lat, c.lon], 13);
        enregistrer();
      }
    })
    .catch(err => console.error("Erreur géocodage :", err));
}

form.addEventListener('submit', function (e) {
  e.preventDefault();
  const entreprise = inputEntreprise.value.trim();
  const adresse = inputAdresse.value.trim();
  const statut = inputStatut.value;
  const now = new Date().toLocaleString();
  const index = inputEditIndex.value;

  if (entreprise && adresse) {
    if (index === "") {
      candidatures.push({ entreprise, adresse, statut, date: now });
      enregistrer();
      geocoderEtAjouterMarqueur(candidatures.length - 1);
    } else {
      const c = candidatures[index];
      c.entreprise = entreprise;
      c.adresse = adresse;
      c.statut = statut;
      c.date = now;
      delete c.lat;
      delete c.lon;
      enregistrer();
      geocoderEtAjouterMarqueur(index);
    }

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
    enregistrer();
    afficherCandidatures();
    location.reload();
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
