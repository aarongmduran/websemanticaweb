import { useState, useEffect } from 'react';
import WBK from 'wikibase-sdk';
import InfoModal from '../infoModal/InfoModal';
import "./tornadoTable.css";

const wbk = WBK({ instance: 'http://156.35.98.107:8080' })
const headers = { 'Accept': 'application/json' };

export default function TornadoTable(prop) {

    const [allTornados, setAllTornados] = useState([]);
    const [filteredTornados, setFilteredTornados] = useState([]);
    const [modalTornado, setModalTornados] = useState('');

    useEffect(() => {
        setAllTornados([])
        getAllEntities()
    }, [])

    useEffect(() => {
        setFilteredTornados(allTornados)
    }, [allTornados])

    function getAllEntities() {
        var url = wbk.searchEntities('Tornado outbreak')
        fetch(url, { headers }).then(body => {
            body.json().then(data => {
                var fetchedTornados = data.search;
                fetchedTornados.forEach(function (tornado) {
                    getEntity(tornado.id, tornado.label)
                });
            });
        });
    }

    function getEntity(id, label) {
        var url = wbk.getEntities(id)
        fetch(url, { headers }).then(body => {
            body.json().then(data => {
                var aux = data.entities[id].claims
                var tornado = {}
                var locationID = aux['P5'][0].mainsnak.datavalue.value.id;
                var relatedID = aux['P6'][0].mainsnak.datavalue.value.id;
                var personalID = aux['P7'][0].mainsnak.datavalue.value.id;
                var materialID = aux['P8'][0].mainsnak.datavalue.value.id;
                var scaleID = aux['P9'][0].mainsnak.datavalue.value.id;
                var url = wbk.getManyEntities([scaleID, locationID, relatedID, personalID, materialID]);
                fetch(url, { headers }).then(body => {
                    body.json().then(data => {
                        var location = data.entities[locationID].claims;
                        var personalDamages = data.entities[personalID].claims;
                        var materialDamages = data.entities[materialID].claims;
                        var scale = data.entities[scaleID].labels.en.value;
                        var url = wbk.getManyEntities([location['P12'][0].mainsnak.datavalue.value.id, location['P13'][0].mainsnak.datavalue.value.id]);
                        fetch(url, { headers }).then(body => {
                            body.json().then(data => {
                                var state = data.entities[location['P12'][0].mainsnak.datavalue.value.id].claims['P10'][0].mainsnak.datavalue.value
                                var county = data.entities[location['P13'][0].mainsnak.datavalue.value.id].claims['P10'][0].mainsnak.datavalue.value
                                tornado = {
                                    title: label,
                                    width: parseFloat(aux['P1'][0].mainsnak.datavalue.value.amount),
                                    length: parseFloat(aux['P2'][0].mainsnak.datavalue.value.amount),
                                    scale,
                                    location: { state, county },
                                    personalDamages: { deaths: parseInt(personalDamages['P14'][0].mainsnak.datavalue.value.amount), injuries: parseInt(personalDamages['P15'][0].mainsnak.datavalue.value.amount) },
                                    materialDamages: { cropDam: parseInt(materialDamages['P23'][0].mainsnak.datavalue.value.amount), propDam: parseInt(materialDamages['P24'][0].mainsnak.datavalue.value.amount) },
                                    beginDate: aux['P3'][0].mainsnak.datavalue.value,
                                    endDate: aux['P4'][0].mainsnak.datavalue.value,
                                    beginCoordinates: { latitude: aux['P27'][0].mainsnak.datavalue.value.latitude, longitude: aux['P27'][0].mainsnak.datavalue.value.longitude },
                                    endCoordinates: { latitude: aux['P28'][0].mainsnak.datavalue.value.latitude, longitude: aux['P28'][0].mainsnak.datavalue.value.longitude }
                                }
                                setAllTornados(allTornados => [...allTornados, tornado]);
                            })
                        });
                    })
                });
            });
        });
    }

    function openTornado(tornado) {
        setModalTornados(tornado)
    }

    function closeTornado() {
        setModalTornados(false)
    }

    var tornadosToShow = filteredTornados.map(function (tornado, index) {
        return (
            <tr key={index} onClick={() => openTornado(tornado)}>
                <td>{tornado.scale}</td>
                <td>{tornado.title}</td>
                <td>{tornado.location.state}</td>
                <td>{tornado.location.county}</td>
            </tr>
        )
    })

    function inputChange(value) {
        var filtered = allTornados.filter(function (tornado) {
            if (tornado.title.toLowerCase().includes(value.toLowerCase()) > 0 || tornado.location.state.toLowerCase().includes(value.toLowerCase()) > 0 || tornado.location.county.toLowerCase().includes(value.toLowerCase()) > 0 || tornado.scale.toLowerCase().includes(value.toLowerCase()) > 0) {
                return tornado
            }
        })
        setFilteredTornados(filtered)
    }

    return (
        <div>
            <div className='container col-md-10'>
                <h1>Tornados</h1>
                <input type="text" placeholder='Busca por nombre' onChange={event => inputChange(event.target.value)} />
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Escala</th>
                            <th scope="col">Nombre</th>
                            <th scope="col">Estado</th>
                            <th scope="col">Condado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tornadosToShow}
                    </tbody>
                </table>
                {modalTornado && <InfoModal tornado={modalTornado} close={closeTornado} />}
            </div>
        </div>
    )
}