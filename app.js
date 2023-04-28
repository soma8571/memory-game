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

//az megoldáshoz szükséges összes kattintásszámot tárolja
let osszesKattintas = 0;

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

    osszesKattintas = 0;
    let meret = this.value;

    if (meret > 0) {

        neededMatchesToEnd = meret/2;

        let sorok = Math.sqrt(meret);
        let oszlopok = sorok;

        szamsorLetrehozas(meret);
        kever(szamok);

        //console.log(szamok);

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

        //console.log(tarolo);
        
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

    osszesKattintas++;
    clicksDisplay.innerHTML = osszesKattintas;
    kattintasTarolo.push(cellaAdat);
    
    //minden 2. cellakattintás esetén vizsgáljuk, hogy van-e egyezés
    if (kattintasTarolo.length % 2 === 0) {
        //megvizsgálni, hogy van-e találat
        if (vanTalalat()) {
            
            setReady();

            if (gameOver) {
                clearInterval(timeCounter);
                resultDiv.style.display = "block";
                resultDiv.innerHTML = `Gratulálok, a játékot sikeresen megoldottad! 
                                        A megfejtéshez ${playTime} másodpercre volt szükséged.`;
                resultDiv.innerHTML += "<div><button onclick='playAgain()'>Új játék</button></div>";
                    
            }
        } 
            
        else //ha nem volt találat akkor 800 ms után "visszacsukjuk" a cellákat 
            setTimeout(closeBack, 800);
        
    } 

}


//a cellák "visszacsukását" végző fgv, nincs találat esetén
function closeBack() {

    //végigmegyünk a kételemű kattintasTarolo tömbön (mindig a legutóbbi két kattintást tárolja csupán)
    for (let i = 0; i < kattintasTarolo.length; i++) {
        
        let address = kattintasTarolo[i]['address'];

        let cella = document.querySelector(`[data-index='${address}']`);

        let value = kattintasTarolo[i]['value'];

        cella.classList.remove("opened");
        cella.classList.add("closed");
        cella.innerHTML = "";

    }

    //ürítjük a kattintástárolót
    kattintasTarolo.splice(0, kattintasTarolo.length);
    
}


//Találatokat vizsgáló fgv
function vanTalalat(cellaAdatok) {

    if (kattintasTarolo.length > 1) {
        let lastObj = kattintasTarolo.at(-1);
        let secondlastObj = kattintasTarolo.at(-2);
        
        //DEBUG
        //console.log(`Értékek: ${secondlastObj.value} és ${lastObj.value}`);
        
        //Akkor van érvényes találat, ha a legutóbbi két kattintás eltérő "címen" történt 
        //(tehát nem ugyanazon a cellán) ÉS a cellák értékei viszont azonosak voltak
        if (lastObj.value === secondlastObj.value && lastObj.address !== secondlastObj.address) {
            matches++;
            matchesDisplay.innerHTML = matches;

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
function setReady() {

    //végigmegyünk a kételemű kattintasTarolo tömbön (mindig a legutóbbi két kattintást tárolja csupán)
    for (let i = 0; i < kattintasTarolo.length; i++) {
        
        let address = kattintasTarolo[i]['address'];

        let cella = document.querySelector(`[data-index='${address}']`);

        let value = kattintasTarolo[i]['value'];

        cella.classList.remove("closed");
        cella.classList.add("ready");
        cella.innerHTML = value;

        //a cellához rendelt eseménykezelő törlése, ergo többé nem nyitható fel
        cella.removeEventListener("click", openUp);
    }

     //ürítjük a kattintástárolót
     kattintasTarolo.splice(0, kattintasTarolo.length);
    
}


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
    
    //Kijelző értékek nullázása
    clicksDisplay.innerHTML = 0;
    matchesDisplay.innerHTML = 0;

    //Change esemény útnak indítása a nehézség kiválasztón (ez indítja az új játékot) 
    let changeEvent = new Event("change");
    levelSelect.dispatchEvent(changeEvent);

}
