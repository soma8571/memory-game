//Level kiválasztása
document.getElementById("game-level").addEventListener("change", racsLetrehozas);

//Ebben a tömbben tároljuk a játékhoz szükséges számokat
var szamok = [];

function szamsorLetrehozas(hossz) {

    let szamok1 = [];
    let fele = hossz/2;

    //első tömb feltöltése
    for (let i = 0; i < fele; i++) {
       szamok1[i] = i + 1;   
    }

    //második tömb létrehozása
    let szamok2 = szamok1;

    //Tömbök összeadása - Spread operátorral
    szamok = [...szamok1, ...szamok2];
}

function kever(szamTomb) {
    let k = szamTomb.length;
    let temp;
    for (let i=0; i < k; i++) {
        temp = szamTomb[i];
        let newIndex = Math.floor(Math.random() * 16);
        szamTomb[i] = szamTomb[newIndex];
        szamTomb[newIndex] = temp;
    }

}


function racsLetrehozas() {

    let meret = this.value;
    let sorok = Math.sqrt(meret);
    let oszlopok = sorok;

    szamsorLetrehozas(meret);
    kever(szamok);

    console.log(szamok);

    
    let tombIndex = 0;
    let table = "<table class='memory'>";

    for (let i = 0; i < sorok; i++) {
        table += "<tr>";
        for (let j = 0; j < oszlopok; j++) {
            table += `<td class='closed' data-index=${i}${j} data-value=${szamok[tombIndex]}></td>`;
            tombIndex++;
        }
        table += "</tr>";
    }
    table += "</table>";

    let div = document.getElementById("game-grid");
    div.innerHTML = table;

    let cellak = document.querySelectorAll("td");
    cellak.forEach(aktualisCella => aktualisCella.addEventListener("click", openUp));

    stopper();

}


//Az adott cellára való kattintás esetén felfedi annak számtartalmát 800 ms-ra

function openUp() {
    let value = this.getAttribute('data-value');
    //alert ( this.getAttribute('data-index') )
    
    this.innerHTML = value;
    this.classList.remove("closed");
    this.classList.add("opened");

    talalatFigyelo(value);

    setTimeout(() => {
        this.classList.remove("opened");
        this.classList.add("closed");
        this.innerHTML = "";
    }, 800);
}

var tarolo = [];
var clicksDisplay = document.getElementById("clickNumber");
var matchesDisplay = document.getElementById("matches");
var matches = 0;

function talalatFigyelo(aktualisErtek) {
    tarolo.push(aktualisErtek);

    if (tarolo.length > 1) {
        if (tarolo.at(-1) === tarolo.at(-2)) {
            //alert("Találat");
            matches++;
            matchesDisplay.innerHTML = matches;
        }
    }
    console.log(tarolo);
    clicksDisplay.innerHTML = tarolo.length;
}


    
function openAll() {
    cellak.forEach(aktualisCella => {
        let value = aktualisCella.getAttribute('data-cont');
        aktualisCella.innerHTML = value;
        aktualisCella.classList.remove("closed");
        aktualisCella.classList.add("opened");
    });
}

function closeAll() {
    cellak.forEach(aktualisCella => {
        aktualisCella.innerHTML = "";
        aktualisCella.classList.remove("opened");
        aktualisCella.classList.add("closed");
    });
}

var timeDisplay = document.getElementById("time");
var elapsedSec = 0; 

function stopper() {
    setInterval(()=> {
        elapsedSec++;
        timeDisplay.innerHTML = elapsedSec;
    }, 1000);
}

