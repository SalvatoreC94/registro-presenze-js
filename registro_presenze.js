// Registro presenze inizialmente vuoto
let registroPresenze = [];

// Funzione per salvare i dati nel Local Storage
function salvaDati() {
    localStorage.setItem("registroPresenze", JSON.stringify(registroPresenze));
}

// Funzione per caricare i dati dal Local Storage
function caricaDati() {
    const datiSalvati = localStorage.getItem("registroPresenze");
    if (datiSalvati) {
        registroPresenze = JSON.parse(datiSalvati);
        generaTabella();
        aggiornaTotali();
    }
}

// Aggiorna il riepilogo dei totali
function aggiornaTotali() {
    const oreTotali = registroPresenze.length * 8; // Ogni giorno ha 8 ore totali
    const oreFrequentateTotali = registroPresenze.reduce((sum, giorno) => sum + giorno.oreFrequentate, 0);
    const oreAssentiTotali = oreTotali - oreFrequentateTotali;
    const percentualePresenza = registroPresenze.length > 0
        ? ((oreFrequentateTotali / oreTotali) * 100).toFixed(2)
        : 0;

    document.getElementById("totali").innerHTML = `
    Giorni Inseriti: ${registroPresenze.length} | 
    Ore Frequentate Totali: ${oreFrequentateTotali} | 
    Ore Assenti Totali: ${oreAssentiTotali} | 
    Percentuale Presenza: ${percentualePresenza}%
  `;
}

// Genera la tabella
function generaTabella() {
    const registroBody = document.getElementById("registro-body");
    registroBody.innerHTML = "";

    registroPresenze.forEach((giorno, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td>${giorno.data}</td>
      <td>${giorno.oreFrequentate}</td>
      <td>
        <button class="btn btn-warning btn-sm" onclick="modificaData(${index})">Modifica</button>
      </td>
    `;
        registroBody.appendChild(row);
    });
}

// Aggiungi una nuova data al registro
function aggiungiData(event) {
    event.preventDefault();

    const dataInput = document.getElementById("data");
    const oreInput = document.getElementById("ore");

    const data = dataInput.value;
    const oreFrequentate = parseInt(oreInput.value, 10);

    if (!data || isNaN(oreFrequentate) || oreFrequentate < 0 || oreFrequentate > 8) {
        alert("Inserisci una data valida e ore tra 0 e 8.");
        return;
    }

    // Controlla se la data è già presente
    const esiste = registroPresenze.some((giorno) => giorno.data === data);
    if (esiste) {
        alert("La data è già presente nel registro.");
        return;
    }

    // Aggiungi la nuova data al registro
    registroPresenze.push({ data, oreFrequentate });
    registroPresenze.sort((a, b) => new Date(a.data) - new Date(b.data)); // Ordina per data
    salvaDati();
    generaTabella();
    aggiornaTotali();

    // Resetta il form
    dataInput.value = "";
    oreInput.value = "";
}

// Modifica una data esistente
function modificaData(index) {
    const nuovoData = prompt("Inserisci la nuova data (AAAA-MM-GG):", registroPresenze[index].data);
    const nuoveOre = prompt("Inserisci le nuove ore frequentate (0-8):", registroPresenze[index].oreFrequentate);

    if (!nuovoData || isNaN(nuoveOre) || nuoveOre < 0 || nuoveOre > 8) {
        alert("Dati non validi. La modifica non è stata salvata.");
        return;
    }

    registroPresenze[index].data = nuovoData;
    registroPresenze[index].oreFrequentate = parseInt(nuoveOre, 10);
    registroPresenze.sort((a, b) => new Date(a.data) - new Date(b.data)); // Ordina per data
    salvaDati();
    generaTabella();
    aggiornaTotali();
}

// Carica i dati all'avvio
caricaDati();

// Assegna l'evento di submit al form
document.getElementById("form-registro").addEventListener("submit", aggiungiData);x