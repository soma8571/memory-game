let szamok = [];

for (let i=0; i < 25; i++) {
    szamok[i] = i;
}


function kever(szamTomb) {
    let k = szamTomb.length;
    let temp;
    for (let i=0; i < k; i++) {
        temp = szamTomb[i];
        let newIndex = Math.floor(Math.random() * 25);
        console.log(newIndex);
        szamTomb[i] = szamTomb[newIndex];
        szamTomb[newIndex] = temp;
    }

}

kever(szamok);

console.log(szamok);

//alert("kesz");

function racsLetrehozas(sorok, oszlopok) {
    let sor;
    for (let i=0; i <= sorok; i++) {
        sor = "<tr>";
        for (let j=0; j <= oszlopok; j++) {
            
        }
    }
}