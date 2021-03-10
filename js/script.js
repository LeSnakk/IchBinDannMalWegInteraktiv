window.onload = function () {
    document.getElementById('dateien').addEventListener('change', initializeAudioInput, false);
    readDataXML();
    createMap();
};

//Variablenbibliothek
var locations;
var orteDB;
var etappen;
var etappenDB;
var lastClickedButton = null;
var currentAudioID;
var map;
var xmlDoc;
var dataEintraege;
var dataEigenschaften;
var eigenschaftsarray;
var audioEnabled = false;
var audiofiles;
var events = [];

var audiotour = false;
var start = true;

var group;

//XML-Dokument wird eingelesen
function readDataXML() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "files/data.xml");
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            xmlDoc = xmlhttp.responseXML;
            var s = new XMLSerializer();
            var XMLstring = s.serializeToString(xmlDoc);
            dataEintraege = Math.ceil((XMLstring.split("<etappe>").length - 1));	//Zählt anzahl der <etappe>-Tags und ermittelt die Anzahl der Einträge
            dataEigenschaften = Math.ceil(((XMLstring.split("\n").length - (2 * dataEintraege) - 3) / dataEintraege)) //Errechnet die Anzahl der dataEigenschaften

            console.log("einträge: " + dataEintraege);
            console.log("infos: " + dataEigenschaften);
            eigenschaftsarray = new Array();	//Array für die dataEigenschaften wird erstellt

            var reihen = xmlDoc.getElementsByTagName("etappe");

            for (var t = 0; t < reihen.length; t++) {
                if (reihen[t].getElementsByTagName("name")[0].childNodes[0] != undefined) {
                    var c = {
                        "id": t,
                        "date": reihen[t].getElementsByTagName("datum")[0].childNodes[0].nodeValue,
                        "content": reihen[t].getElementsByTagName("name")[0].childNodes[0].nodeValue
                    };

                    events.push(c);
                }
            }
            var elemente = reihen[0].childNodes
            for (var j = 0; j < elemente.length; j++) {	//dataEigenschaften werden in das Eigenschaftsarray geschrieben
                var reihe = elemente[j];
                if (reihe.nodeType === 1)			//Überprüfung auf String, also Text
                    eigenschaftsarray.push(reihe.nodeName); //Text wird ins Array geschrieben
            }
        }
    }
    xmlhttp.send();
}

//Map-Icons werden erstellt
var icon = L.icon({
    iconUrl: "https://leafletjs.com/examples/custom-icons/leaf-green.png"
})
var redIcon = L.icon({
    iconUrl: 'files/red_pin.png',
    iconSize: [32, 32],
    shadowSize: [35, 20],
    iconAnchor: [16, 32],
    shadowAnchor: [12, 6],
    popupAnchor: [0, 0]
});
var limeIcon = L.icon({
    iconUrl: 'files/lime_pin.png',
    iconSize: [44, 44],
    shadowSize: [35, 20],
    iconAnchor: [22, 44],
    shadowAnchor: [12, 6],
    popupAnchor: [0, 0]
});

//
function createMap() {

    //Dateinamen der Etappen werden in ihr Array geschrieben
    etappenDB = ["01_Roncesvalles.geojson", "02_Zubiri.geojson", "03_Pamplona.geojson", "04_Pamplona.geojson", "05_Viana_und_Logrono.geojson", "06_Navarrete_und_Najera.geojson", "07_Santo_Domingo_de_la_Calzada.geojson"
        , "08_Santo_Domingo_de_la_Calzada.geojson", "09_Castildelgado.geojson", "10_Belorado_Tosantos_und_Villafranca.geojson", "11_Burgos_Tradajos.geojson", "12_Hornillos_del_Camino_und_Hontanas.geojson", "13_Castrojeriz_und_Fromista.geojson", "14_Carrion_de_los_Condes.geojson", "15_Calzadilla_de_la_Cueza.geojson", "16_Sahagun.geojson", "17_Leon1.geojson", "18_Leon2.geojson", "19_Irgendwo_im_Nirgendwo_hinter_Leon.geojson", "20_Astorga1.geojson"
        , "21_Astorga2.geojson", "22_Rabanal1.geojson", "23_Rabanal2.geojson", "24_Foncebadon_und_El_Acebo.geojson", "25_El_Acebo.geojson", "26_Molinaseca_Ponferrada.geojson", "27_Villafranca_del_Bierzo.geojson", "28_Trabadelo_und_Vega_de_Valcarce.geojson", "29_La_Faba_und_O_Cebreiro.geojson", "30_Tricastela1.geojson", "31_Tricastela2.geojson", "32_Sarria_und_Rente.geojson", "33_Portomarin.geojson", "34_Palas_de_Rei.geojson"
        , "35_Castaneda.geojson", "36_Rua.geojson", "37_Santiago_de_Compostela.geojson"];

    //Dateinamen der Orte werden in ihr Array geschrieben
    orteDB = ["01_Seant_Jean_Pied_de_Port.geojson", "02_Roncesvalles.geojson", "03_Zubiri.geojson", "04_Pamplona.geojson", "05_Pamplona.geojson", "06_Viana_und_Logrono.geojson", "07_Navarrete_und_Najera.geojson", "08_Santo_Domingo_de_la_Calzada.geojson", "09_Santo_Domingo_de_la_Calzada.geojson", "10_Castildelgado.geojson", "11_Belorado_Tosantos_und_Villafranca.geojson", "12_Burgos_Tradajos.geojson"
        , "13_Hornillos_des_Camino_und_Hontanas.geojson", "14_Castrojeriz_und_Fromista.geojson", "15_Carrion_de_los_Condes.geojson", "16_Calzadilla_de_la_Cueza.geojson", "17_Sahagun.geojson", "18_Leon.geojson", "19_Leon.geojson", "20_Irgendwo_Leon_Villadangos_del_Paramo.geojson", "21_Astorga.geojson", "22_Astorga.geojson", "23_Rabanal.geojson", "24_Rabanal.geojson", "25_Foncebadon_und_El_Acebo.geojson", "26_El_Acebo.geojson", "27_Molinaseca_Ponferrada.geojson"
        , "28_Villafranca_del_Bierzo.geojson", "29_Trabadelo_und_Vega_de_Valcarce.geojson", "30_La_Faba_und_O_Cebreiro.geojson", "31_Tricastela.geojson", "32_Tricastela.geojson", "33_Sarria_und_Rente.geojson", "34_Portomarin.geojson", "35_Palas_de_Rei.geojson", "36_Castaneda.geojson", "37_Rua.geojson", "38_Santiago_de_Compostela.geojson"];


    var southWest = L.latLng(41.372686481864655, -9.876708984375002);
    var northEast = L.latLng(44.19402066387343, 0.48889160156250006);

    var sattelite = L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}', { id: 'MapID', attribution: '&copy; <a href="https://developers.google.com/maps/documentation/javascript/maptypes">Google'});
    var terrain = L.tileLayer('http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}', { id: 'MapID',  attribution: '&copy; <a href="https://developers.google.com/maps/documentation/javascript/maptypes">Google'});


    function createCustomIcon(feature, latlng) {
        let myIcon = L.icon({
            iconUrl: 'files/red_pin.png',
            iconSize: [32, 32],
            shadowSize: [35, 20],
            iconAnchor: [16, 32],
            shadowAnchor: [12, 6],
            popupAnchor: [0, 0]
        })
        return L.marker(latlng, { icon: myIcon })
    }

    myLayerOptions = {
        pointToLayer: createCustomIcon
    }

    map = new L.map('map', {
        zoomControl: false,
        minZoom: 8,
        maxZoom: 17,
        layers: [terrain, sattelite],
        maxBounds: L.latLngBounds(southWest, northEast), // maximaler Kartenbereich
    }).setView([42.8, -4.69140625], 8);

    var Base = {
        "Terrain": terrain
    }

    var layers = {
        "Kartenansicht umschalten": sattelite
    };


    L.control.layers(null, layers, { position: 'topleft' }).addTo(map);

    makePoints();

}

function makePoints() {
    //Orte-geoJSON-Daten werden mittels der zuvor in das Array geschriebenen Dateinamen eingelesen und ins Layer "orte" überführt
    for (var i = 0; i < orteDB.length; i++) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', 'files/geoJSONfiles/orte/' + orteDB[i]);
        xhr.responseType = 'json';
        xhr.onload = function () {
            if (xhr.status !== 200) return
            L.geoJSON(xhr.response, myLayerOptions).addTo(orte).on('click', onClick);
        };
        xhr.send();
    }
    orte = L.geoJson(locations).addTo(map);
    makePaths();
}

function makePaths() {
    //Etappen-geoJSON-Daten werden mittels der zuvor in das Array geschriebenen Dateinamen eingelesen und ins Layer "etappen" überführt
    for (var i = 0; i < etappenDB.length; i++) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', 'files/geoJSONfiles/etappen/' + etappenDB[i]);
        xhr.responseType = 'json';
        xhr.onload = function () {
            if (xhr.status !== 200) return
            L.geoJSON(xhr.response).addTo(etappen).on('click', onClick);
            ;
        };
        xhr.send();
    }
    etappen = L.geoJson(etappen).addTo(map);
}


function printText(eintragNO, eigenschaftsNO) {
    return (xmlDoc.getElementsByTagName(eigenschaftsarray[eigenschaftsNO])[eintragNO].childNodes[0].nodeValue); //eigenschaft | eintrag
}

//when clicked on map marker or map path:
function onClick(e) {
    var style = e.layer.feature.geometry.type;
    var id = e.layer.feature.properties.id;
    console.log(id);
    if (style == "Point") {
        audiotour = false;
        console.log(audiotour);
        markerClick(--id);
    } else {
        audiotour = false;
        pathClick(id);
    }
}

//when clicked on timeline (location button):
function getButtonId(e) {       //https://stackoverflow.com/questions/4825295/javascript-onclick-to-get-the-id-of-the-clicked-button
    console.log("test");
    console.log(e);
    // e = window.event;
    // if (e !== "undefined") {
    //     e = e.srcElement;
    lastClickedButton = $(e).data('audioid'); // made jQuery object of js object
    console.log("LCB" + lastClickedButton);
    if (audioEnabled) {
        document.getElementById("audioPlayer").style.visibility = "visible";        //Zeige Audioplayer
        document.getElementById("audioTourFromHere").style.visibility = "visible";  //Zeige Audiosta
        passAudio($(e).data('audioid'));     //Übergibt der Audioplayerinitialisierungsfunktion, welches Audio initialisiert werden soll
    }
    resetMarker(e.id);

    displayInfo(e.id);
    // }
}

function changeTimeLinePage(mID, firstId) {
    console.log("changin: " + mID + ",  " + firstId);
    if (firstId <= mID) {
        $('.roadmap__navigation .next').click();
        setTimeout(function () {
            markerClick(mID);
        }, 10);
    } else if (firstId > mID) {
        $('.roadmap__navigation .prev').click();
        setTimeout(function () {
            markerClick(mID);
        }, 10);
    }
}

var markerState = 0;

function markerClick(mID) {

    if ($('.roadmap__events #' + mID).length > 0) {
        buttonClick(mID);
    } else {
        var firstId = $('.roadmap__events__event').first().attr('id');
        changeTimeLinePage(mID, firstId);
    }
}

function pathClick(pID) {
    if ($('.roadmap__events #' + pID).length > 0) {
        buttonClick(pID);
    } else {
        var firstId = $('.roadmap__events__event').first().attr('id');
        changeTimeLinePage(pID, firstId);
    }
}

//Klickt den durch die ID "bID" gewünschten Button/Timelineeintrag
function buttonClick(bID) {
    markerState = 0;        //???
    document.getElementById(bID).click();
}

//Ruft die Funktion auf, die die Icons der ausgewählten Marker verändert. Je nach Etappe können dies mehrere Marker sein
function changeMarker(ID) {
    changeIconOfMarker(ID);
}

//Ruft die Funktion auf, die die Ansicht bewegt sowie den ausgewählten Wegabschnitt hervorhebt
function changeView(ID) {
    console.log("XXXX " + ID);
    if (ID == 0) {
        unColorPath();
        moveViewLocation();
    } else {
        --ID;
        unColorPath();
        colorPath(ID);
    }
}

//Setzt die Ansicht aller Marker auf das Standarticon zurück
function resetMarker(ID) {
    for (var i = 0; i < orteDB.length + 1; i++) {
        map.eachLayer((orte) => {
            if (orte instanceof L.Marker && orte.feature && orte.feature.properties && orte.feature.properties.id == i) {
                orte.setIcon(redIcon);
            }
        });
    }
    changeMarker(ID); //...der ausgewählte Marker erhält ein anderes Icon
}

//Ändert das Icon eines durch "wantedId" ausgewählten Markers 
function changeIconOfMarker(ID) {
    var temp = ID;
    ++temp;
    map.eachLayer((orte) => {
        if (orte instanceof L.Marker && orte.feature && orte.feature.properties && orte.feature.properties.id == temp) {
            orte.setIcon(limeIcon);
        }
    });
    changeView(ID);   //Fokussiert die Ansicht auf den ausgewählten Kartenbereich
}

//Ändert die Ansicht, so dass der ausgewählte Weg im Fokus liegt.
function moveView(ID) {
    map.fitBounds(etappen.getLayers()[ID].getBounds(), map.getZoom(), {     //Es werden die Grenzen des Weges ermittelt und die Ansicht an jene angepasst
        "animate": true,
        "pan": {
            "duration": 2
        }
    });
}

//Ändert die Ansicht, so dass der ausgewählte Ort im Fokus liegt (identisches Prinzip wie "moveView()")
function moveViewLocation() {
    map.flyTo([43.163366597984691, -1.23770909753465], 15, {
        "animate": true,
        "duration": 1
    });
}

function colorPath(ID) {
    etappen.getLayers()[ID].setStyle({ color: "#00ffa5" });
    moveView(ID);
}

function unColorPath() {
    etappen.getLayers().forEach(etappe => etappe.setStyle({ color: "#3388ff" }));
}

function displayInfo(buttonID) {
    lastClickedButton = buttonID;
    document.getElementById("infos").innerHTML = "<div id=\"infos-close\"><i class=\"fa fa-cross\"></i></div>";

    for (var i = 1; i < eigenschaftsarray.length; i++) {
        document.getElementById("infos").innerHTML += (printText(buttonID, i) + "<br />");
        //street view is retained with CDATA element https://stackoverflow.com/questions/4412395/is-it-possible-to-insert-html-content-in-xml-document
    }


    $('#infos-close').on("click", function () {
        $('#infos').removeClass('active');
    })
}

//Öffnet das Dateiauswahlmenü, um die Hörbuchaudiodateien auszuwählen
function openUploadDialog() {
    document.getElementById("dateien").click();
}

//Blendet den Audiouploadbereich aus, falls der User diese Option nicht wünscht oder keine Audiodateien besitzt
function disableAudioUploadArea() {
    document.getElementById("audioUpload").remove();
}

//Audiodateiverzeichnis wird eingelesen und verarbeitet
function initializeAudioInput(evt) {
    audiofiles = evt.target.files;  //Audiodateien werden Variable übergeben
    var fragmente = [];
    console.log(audiofiles);
    audioEnabled = true;    //User wünscht Audio
    if (lastClickedButton != null) {    //Wenn Audios nachträglich hochgeladen werden, wird der Player hier erneut aufgerufen
        document.getElementById("audioTourFromHere").style.visibility = "visible";
        console.log("PAAATH" + lastClickedButton);
        document.getElementById(lastClickedButton).click()
    }

    //DEBUG! Schreibt Audiometadaten ins Array
    for (var i = 0, f; f = audiofiles[i]; i++) {
        fragmente.push('<li><strong>', f.name, '</strong> (', f.type || 'n/a', ') - ',
            f.size, ' bytes</li>');
    }
    document.getElementById("audioUpload").innerHTML = "<p><i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Audios hochgeladen.</i></p>";
    document.getElementById("audioTour").style.visibility = "visible";
    //document.getElementById("audioUpload").style.visibility = "hidden"
    //document.getElementById('dateiListe').innerHTML = '<ul>' + fragmente.join('') + '</ul>';
}

//Initialisiert den Audioplayer mit der durch die "ID" gewünschten Audiodatei
function passAudio(ID) {
    currentAudioID = ID;
    $("#src").attr("src", URL.createObjectURL(audiofiles[ID]));
    document.getElementById("audio").load();
    document.getElementById("audioName").innerHTML = "Aktueller Titel: " + audiofiles[ID].name;
}

//Startet die Audiotour
function initializeAudioTour() {
    if (start) {
        audiotour = true;
        markerClick(0);
        startAudioTourWithThis(0);
        document.getElementById('audioTourStarten').innerHTML = "Audiotour beenden";
        start = false;
    }
    else if (!start) {
        document.getElementById("audio").pause();
        document.getElementById("audio").currentTime = 0;
        document.getElementById('audioTourStarten').innerHTML = "Audiotour starten";
        audiotour = false;
        start = true;
    }
}

//Audiotourcontroller
function startAudioTourWithThis(tracknumber) {
    setTimeout(function () {
        console.log("playing with: " + tracknumber);
        // document.getElementsByClassName(tracknumber)[0].click()     //Wählt Etappe aus
        $("[data-audioid='" + tracknumber + "']").click(); //Wählt Etappe aus über audioid Attribut - Neu
        document.getElementById("audio").play();        //Startet das Audio

        document.getElementById("audio").onended = function () {
            if (audiotour) {
                console.log(audiotour);
                startAudioTourWithThis(++tracknumber);      //Wenn das Audio zuende ist, wird die nächste Etappe gespielt
            }
        }
    }, 400)
}

//Die Audiotour kann von einer beliebigen Stelle aus gestartet werden
function startAudioTourFromHere() {
    audiotour = true;
    console.log("startAudioFrom:" + currentAudioID);
    startAudioTourWithThis(currentAudioID);     //Startet die Audiotour ab der aktuellen Position
}

function endAudioTour() {
    document.getElementById("audio").stop();
    audiotour = false;
}

//Etappe zurück
function previous() {
    if (currentAudioID > 0) {
        --currentAudioID;
        if ($('.roadmap__events #' + currentAudioID).length > 0) {
            buttonClick(currentAudioID);
        } else {
            var firstId = $('.roadmap__events__event').first().attr('id');
            changeTimeLinePage(currentAudioID, firstId);
        }
        if (audiotour) {
            //startAudioTourWithThis(currentAudioID);
        }
    }
}

//Etappe vor
function next() {
    if (currentAudioID < 37) {
        ++currentAudioID;
        if ($('.roadmap__events #' + currentAudioID).length > 0) {
            buttonClick(currentAudioID);
        } else {
            var firstId = $('.roadmap__events__event').first().attr('id');
            changeTimeLinePage(currentAudioID, firstId);
        }
        if (audiotour) {
            //startAudioTourWithThis(currentAudioID);
        }
    }
}