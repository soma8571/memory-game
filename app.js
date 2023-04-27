//Eseménykezelő a nehézségi szint kiválasztására szolgáló select change eseményére
//Itt indul a játék
let levelSelect = document.getElementById("game-level");
levelSelect.addEventListener("change", racsLetrehozas);

//Ebben a tömbben tároljuk a játékhoz szükséges számokat
let szamok = [];

//A játék végét jelző változó
let gameOver = false;

//segédváltozó (tesztelés, hibakeresési célokra)
//Objektum tömb, amely tárolja az egyes cellák "cím" és érték adatait tartalmazó objektumot
let tarolo = [];

//span elem, ahol megjelenítjük a játék során keletkező kattintások számát
const clicksDisplay = document.getElementById("clickNumber");

//span elem a találatok megjelenítésére
const matchesDisplay = document.getElementById("matches");

//span elem az eltelt idő kijelzésére
const timeDisplay = document.getElementById("time");

//az eredmény megjelenítésére hivatott di
const resultDiv = document.querySelector(".result");

//a találatok számolására szolgáló változó
let matches = 0;

//A játék végéhez szükséges találatok száma
let neededMatchesToEnd;

//Objektum tömb, amely tárolja azon cellák adatait, amiken kattintás történt
//ennek segítségével lesz eldönthető, hogy történt-e kattintás két azonos számot tartalmazó cellán 
//tehát van-e találat 
let kattintasTarolo = [];

//A játékidő mérésére szolgáló változó
let playTime = 0;

//a cella "nyitvatartási" időzítője (setTimeout)
let cellOpenTimer;

//az időmérő setInterval változója
let timeCounter;

//Létrehoz egy - a kiválasztatott nehézségi szinttől függő hosszúságú - számsort
//A számsort aztán lemásolja, majd az így létrejött két azonos számtömböt Spread operátorral összefűzi
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


//A függvény összekeveri a paraméterben kapott számtömb elemeit
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


//Létrehozza a játékhoz szükséges felületet, ami egy n x n -es táblázat, ahol 
//"n" a választott nehézségi szinttől függ
function racsLetrehozas() {

    let meret = this.value;

    if (meret > 0) {

        neededMatchesToEnd = meret/2;

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
                let address = String(i) + String(j); 
                let cellaAdat = { "address": address, 
                                    "value": szamok[tombIndex] };
                tarolo.push(cellaAdat);
                tombIndex++;
            }
            table += "</tr>";
        }
        table += "</table>";

        let div = document.getElementById("game-grid");
        div.innerHTML = table;

        //Kijelöljük a táblázat össze celláját és kattintás eseményükhöz hozzárendeljük
        //az openUp() fgv-t.
        let cellak = document.querySelectorAll("td");
        cellak.forEach(aktualisCella => aktualisCella.addEventListener("click", openUp));

        console.log(tarolo);
        
        if (playTime === 0)
            stopper();
        else {
            clearInterval(timeCounter);
            stopper();
        }
    }

}


//Az adott cellára való kattintás esetén felfedi annak számtartalmát 800 ms-ra
function openUp() {
    let address = this.getAttribute('data-index');
    let value = this.getAttribute('data-value');
    //alert ( this.getAttribute('data-index') )
    let cellaAdat = { "address": address, "value": value };
    
    this.innerHTML = value;
    this.classList.remove("closed");
    this.classList.add("opened");

    //800 ms múlva "visszazárjuk" a szám megjelenítését
    cellOpenTimer = setTimeout(() => {
        this.classList.remove("opened");
        this.classList.add("closed");
        this.innerHTML = "";
    }, 800);

    talalatFigyelo(cellaAdat);

    if (gameOver) {
        clearInterval(timeCounter);
        resultDiv.style.display = "block";
        resultDiv.innerHTML = `Gratulálok, a játékot sikeresen megoldottad! 
                                A megfejtéshez ${playTime} másodpercre volt szükséged.`;
        resultDiv.innerHTML += "<div><button onclick='playAgain()'>új játék</button></div>";
            
    }

}


function talalatFigyelo(cellaAdatok) {

    kattintasTarolo.push(cellaAdatok);
    //Csak a működés ellenőrzéséhez
    //console.log(kattintasTarolo);
    clicksDisplay.innerHTML = kattintasTarolo.length;

    if (kattintasTarolo.length > 1) {
        let lastObj = kattintasTarolo.at(-1);
        let secondlastObj = kattintasTarolo.at(-2);
        
        //Akkor van érvényes találat, ha a legutóbbi két kattintás eltérő "címen" történt 
        //(tehát nem ugyanazon a cellán) ÉS a cellák értékei viszont azonosak voltak
        if (lastObj.value === secondlastObj.value && lastObj.address !== secondlastObj.address) {
            clearTimeout(cellOpenTimer);
            matches++;
            matchesDisplay.innerHTML = matches;
            setReady(secondlastObj.address);
            setReady(lastObj.address);

            //ha a találatok száma egyezik a játék végéhez szükséges találatok számával
            //akkor a játéknak vége van
            if (matches === neededMatchesToEnd)
                gameOver = true;
            return true;
        } else
            return false;
    } else 
        return false;
}

//A találat esetén módosítja a cella megjelenítését
function setReady(cellaAddress) {

    let cella = document.querySelector(`[data-index='${cellaAddress}']`);

    let value = cella.getAttribute("data-value");

    cella.classList.remove("closed");
    cella.classList.add("ready");
    cella.innerHTML = value;

    //a cellához rendelt eseménykezelő törlése, ergo többé nem nyitható fel
    cella.removeEventListener("click", openUp);
}


/*
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
*/

//A játékidőt mérő függvény
function stopper() {
    playTime = 0;

    timeCounter = setInterval(()=> {
        timeDisplay.innerHTML = playTime + " másodperc";
        playTime++;
    }, 1000);
}


function playAgain() {

    resultDiv.innerHTML = "";
    resultDiv.style.display = "none";
    gameOver = false;
    matches = 0;
    //a kattintásokat tároló tömb ürítése
    kattintasTarolo.splice(0, kattintasTarolo.length);
    tarolo.splice(0, tarolo.length);
    clicksDisplay.innerHTML = 0;
    matchesDisplay.innerHTML = 0;

    let changeEvent = new Event("change");
    levelSelect.dispatchEvent(changeEvent);

}
