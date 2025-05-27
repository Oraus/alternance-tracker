const form = document.getElementById('form');
const tableau = document.querySelector('#tableau tbody');
const filtre = document.getElementById('filtreStatut');
const inputEntreprise = document.getElementById('entreprise');
const inputStatut = document.getElementById('statut');
const inputEditIndex = document.getElementById('editIndex');

let candidatures = JSON.parse(localStorage.getItem('candidatures')) || [];

function enregistrer() {
  localStorage.setItem('candidatures', JSON.stringify(candidatures));
}

function afficherCandidatures() {
  tableau.innerHTML = '';
  const statutFiltre = filtre.value;

  candidatures.forEach((c, index) => {
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
    } else {
      candidatures[index] = { entreprise, statut, date: now };
    }

    enregistrer();
    afficherCandidatures();
    form.reset();
    inputEditIndex.value = "";
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
  }
});

filtre.addEventListener('change', afficherCandidatures);

afficherCandidatures();
