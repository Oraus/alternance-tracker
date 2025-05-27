const form = document.getElementById('form');
const tableau = document.querySelector('#tableau tbody');
const filtre = document.getElementById('filtreStatut');

let candidatures = JSON.parse(localStorage.getItem('candidatures')) || [];

function enregistrer() {
  localStorage.setItem('candidatures', JSON.stringify(candidatures));
}

function afficherCandidatures() {
  tableau.innerHTML = '';
  const statutFiltre = filtre.value;
  candidatures.forEach((candidature, index) => {
    if (statutFiltre === 'Tous' || candidature.statut === statutFiltre) {
      const ligne = document.createElement('tr');
      ligne.innerHTML = `
        <td>${candidature.entreprise}</td>
        <td>${candidature.statut}</td>
        <td><button class="delete" data-index="${index}">Supprimer</button></td>
      `;
      tableau.appendChild(ligne);
    }
  });
}

form.addEventListener('submit', function (e) {
  e.preventDefault();
  const entreprise = document.getElementById('entreprise').value.trim();
  const statut = document.getElementById('statut').value;

  if (entreprise) {
    candidatures.push({ entreprise, statut });
    enregistrer();
    afficherCandidatures();
    form.reset();
  }
});

tableau.addEventListener('click', function (e) {
  if (e.target.classList.contains('delete')) {
    const index = e.target.getAttribute('data-index');
    candidatures.splice(index, 1);
    enregistrer();
    afficherCandidatures();
  }
});

filtre.addEventListener('change', afficherCandidatures);

afficherCandidatures();
