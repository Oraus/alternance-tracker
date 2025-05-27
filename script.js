const form = document.getElementById('form');
const tableau = document.querySelector('#tableau tbody');
const filtre = document.getElementById('filtreStatut');
const inputEntreprise = document.getElementById('entreprise');
const inputStatut = document.getElementById('statut');
const inputEditIndex = document.getElementById('editIndex');
const boutonSubmit = form.querySelector('button[type="submit"]');

// Créer bouton Annuler
const boutonAnnuler = document.createElement("button");
boutonAnnuler.textContent = "Annuler";
boutonAnnuler.type = "button";
boutonAnnuler.style.display = "none";
form.appendChild(boutonAnnuler);

let candidatures = JSON.parse(localStorage.getItem('candidatures')) || [];

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

form.addEventListener('submit', function (e) {
  e.preventDefault();
  const entreprise = inputEntreprise.value.trim();
  const statut = inputStatut.value;
  const now = new Date().toLocaleString();

  if (entreprise) {
    const index = inputEditIndex.value;

    if (index === "") {
      candidatures.push({ entreprise, statut, date: now });
      ajouterMarqueur(entreprise);
    } else {
      candidatures[index] = { entreprise, statut, date: now };
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
    enregistrer();
    afficherCandidatures();
  }

  if (e.target.classList.contains('edit')) {
    const c = candidatures[index];
    inputEntreprise.value = c.entreprise;
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


// =======================
// Carte Leaflet
// =======================

const map = L.map('map').setView([48.8566, 2.3522], 11); // Paris par défaut

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

function ajouterMarqueur(entreprise) {
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(entreprise)}`)
    .then(res => res.json())
    .then(data => {
      if (data && data[0]) {
        const { lat, lon, display_name } = data[0];
        L.marker([lat, lon]).addTo(map)
          .bindPopup(`<strong>${entreprise}</strong><br>${display_name}`)
          .openPopup();
        map.setView([lat, lon], 13);
      }
    })
    .catch(err => {
      console.error("Erreur de géocodage :", err);
    });
}
