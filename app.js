//Level kiválasztása
document.getElementById("game-level").addEventListener("change", racsLetrehozas);

//Ebben a tömbben tároljuk a játékhoz szükséges számokat
var szamok = [];

//A játék végét jelző változó
var gameOver = false;

//segédváltozó (tesztelés, hibakeresési célokra)
//Objektum tömb, amely tárolja az egyes cellák "cím" és érték adatait tartalmazó objektumot
var tarolo = [];

//span elem, ahol megjelenítjük a játék során keletkező kattintások számát
var clicksDisplay = document.getElementById("clickNumber");

//span elem a találatok megjelenítésére
var matchesDisplay = document.getElementById("matches");

//a találatok számolására szolgáló változó
var matches = 0;

//A játék végéhez szükséges találatok száma
var neededMatchesToEnd;

//Objektum tömb, amely tárolja azon cellák adatait, amiken kattintás történt
//ennek segítségével lesz eldönthető, hogy történt-e kattintás két azonos számot tartalmazó cellán 
//tehát van-e találat 
var kattintasTarolo = [];

//span elem az eltelt idő kijelzésére
var timeDisplay = document.getElementById("time");

//A játékidő mérésére szolgáló változó
var elapsedSec; 

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
        
        if (elapsedSec === 0)
            stopper();
        else {
            clearInterval(elapsedTime);
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

    //ha nincs találat, akkor 800 ms múlva "visszazárjuk" a szám megjelenítését
    if(!talalatFigyelo(cellaAdat))

        setTimeout(() => {
            this.classList.remove("opened");
            this.classList.add("closed");
            this.innerHTML = "";
        }, 800);
    
    //ha találat volt, akkor ellenőrizni kell, hogy a játéknak nincs-e vége
    else {
        if (gameOver) {
            clearInterval(elapsedTime);
            alert("Gratulálok! Az időd: " + elapsedSec + " másodperc.");
        }
    }
}


function talalatFigyelo(cellaAdatok) {

    kattintasTarolo.push(cellaAdatok);

    if (kattintasTarolo.length > 1) {
        let lastObj = kattintasTarolo.at(-1);
        let secondlastObj = kattintasTarolo.at(-2);
        
        if (lastObj.value === secondlastObj.value && lastObj.address !== secondlastObj.address) {
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
    }
    console.log(kattintasTarolo);
    clicksDisplay.innerHTML = kattintasTarolo.length;
    return false;
}

//A találat esetén módosítja a cella megjelenítését
function setReady(cellaAddress) {

    let cella = document.querySelector(`[data-index='${cellaAddress}']`);

    let value = cella.getAttribute("data-value");

    cella.innerHTML = value;
    cella.classList.remove("closed");
    cella.classList.add("ready");

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

var elapsedTime;
//A játékidőt mérő függvény
function stopper() {
    elapsedSec = 0;

    elapsedTime = setInterval(()=> {
        elapsedSec++;
        timeDisplay.innerHTML = elapsedSec;
    }, 1000);
}

