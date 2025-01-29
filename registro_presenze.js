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
    const oreMinutiTotali = registroPresenze.reduce((sum, giorno) => {
        sum.ore += giorno.oreFrequentate;
        sum.minuti += giorno.minutiFrequentati;
        return sum;
    }, { ore: 0, minuti: 0 });

    // Converti i minuti in ore
    oreMinutiTotali.ore += Math.floor(oreMinutiTotali.minuti / 60);
    oreMinutiTotali.minuti %= 60;

    const giorniTotali = registroPresenze.length;
    const oreTotali = giorniTotali * 8;
    const minutiTotali = giorniTotali * 480; // 8 ore = 480 minuti
    const minutiAssentiTotali = minutiTotali - (oreMinutiTotali.ore * 60 + oreMinutiTotali.minuti);
    const percentualePresenza = giorniTotali > 0
        ? (((oreMinutiTotali.ore * 60 + oreMinutiTotali.minuti) / minutiTotali) * 100).toFixed(2)
        : 0;

    document.getElementById("totali").innerHTML = `
        Giorni Inseriti: ${giorniTotali} |
        Ore Frequentate Totali: ${oreMinutiTotali.ore}h ${oreMinutiTotali.minuti}m |
        Ore Assenti Totali: ${Math.floor(minutiAssentiTotali / 60)}h ${minutiAssentiTotali % 60}m su 72 |
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
            <td>${giorno.oreFrequentate}h ${giorno.minutiFrequentati}m</td>
            <td>
                <button class="btn btn-warning btn-sm me-2" onclick="modificaData(${index})">Modifica</button>
                <button class="btn btn-danger btn-sm" onclick="cancellaData(${index})">Cancella</button>
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
    const minutiInput = document.getElementById("minuti");

    const data = dataInput.value;
    const oreFrequentate = parseInt(oreInput.value, 10);
    const minutiFrequentati = parseInt(minutiInput.value, 10);

    if (!data || isNaN(oreFrequentate) || isNaN(minutiFrequentati) || oreFrequentate < 0 || oreFrequentate > 8 || minutiFrequentati < 0 || minutiFrequentati > 59) {
        alert("Inserisci una data valida e ore tra 0 e 8, minuti tra 0 e 59.");
        return;
    }

    // Controlla se la data è già presente
    const esiste = registroPresenze.some((giorno) => giorno.data === data);
    if (esiste) {
        alert("La data è già presente nel registro.");
        return;
    }

    // Aggiungi la nuova data al registro
    registroPresenze.push({ data, oreFrequentate, minutiFrequentati });
    registroPresenze.sort((a, b) => new Date(a.data) - new Date(b.data)); // Ordina per data
    salvaDati();
    generaTabella();
    aggiornaTotali();

    // Resetta il form
    dataInput.value = "";
    oreInput.value = "";
    minutiInput.value = "";
}

// Modifica una data esistente
function modificaData(index) {
    const giorno = registroPresenze[index];
    document.getElementById("modificaData").value = giorno.data;
    document.getElementById("modificaOre").value = giorno.oreFrequentate;
    document.getElementById("modificaMinuti").value = giorno.minutiFrequentati;
    document.getElementById("indiceModifica").value = index;

    // Mostra la modale
    const modale = new bootstrap.Modal(document.getElementById("modaleModifica"));
    modale.show();
}

// Salva le modifiche effettuate nella modale
function salvaModifica() {
    const indice = parseInt(document.getElementById("indiceModifica").value, 10);
    const nuovaData = document.getElementById("modificaData").value;
    const nuoveOre = parseInt(document.getElementById("modificaOre").value, 10);
    const nuoviMinuti = parseInt(document.getElementById("modificaMinuti").value, 10);

    if (!nuovaData || isNaN(nuoveOre) || isNaN(nuoviMinuti) || nuoveOre < 0 || nuoveOre > 8 || nuoviMinuti < 0 || nuoviMinuti > 59) {
        alert("Dati non validi. La modifica non è stata salvata.");
        return;
    }

    registroPresenze[indice].data = nuovaData;
    registroPresenze[indice].oreFrequentate = nuoveOre;
    registroPresenze[indice].minutiFrequentati = nuoviMinuti;

    registroPresenze.sort((a, b) => new Date(a.data) - new Date(b.data)); // Ordina per data
    salvaDati();
    generaTabella();
    aggiornaTotali();

    // Chiudi la modale
    const modale = bootstrap.Modal.getInstance(document.getElementById("modaleModifica"));
    modale.hide();
}
let indiceCancellazione = null;

function cancellaData(index) {
    indiceCancellazione = index;
    const modale = new bootstrap.Modal(document.getElementById("modaleConfermaCancellazione"));
    modale.show();
}

document.getElementById("btnConfermaCancellazione").addEventListener("click", function () {
    if (indiceCancellazione !== null) {
        registroPresenze.splice(indiceCancellazione, 1);
        salvaDati();
        generaTabella();
        aggiornaTotali();
    }

    const modale = bootstrap.Modal.getInstance(document.getElementById("modaleConfermaCancellazione"));
    modale.hide();
});


// Carica i dati all'avvio
caricaDati();

// Assegna l'evento di submit al form
document.getElementById("form-registro").addEventListener("submit", aggiungiData);
