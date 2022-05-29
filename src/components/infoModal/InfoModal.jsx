import "./infoModal.css";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';


export default function InfoModal(props) {
    var tornado = props.tornado;

    function closeModal() {
        props.close();
    }

    const containerStyle = {
        width: '90%',
        height: '400px'
    };

    const center = {
        lat: tornado.beginCoordinates.latitude,
        lng: tornado.beginCoordinates.longitude
    };

    return (
        <section>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => closeModal()}>
                <span aria-hidden="true">&times;</span>
            </button>
            <div>
                <h2>{tornado.title}</h2>
                <table className="table">
                    <tbody>
                        <tr>
                            <th>Escala</th>
                            <td>{tornado.scale}</td>
                        </tr>
                        <tr>
                            <th>Estado/Condado</th>
                            <td>{tornado.location.state} / {tornado.location.county}</td>
                        </tr>
                        <tr>
                            <th>Ancho / Largo</th>
                            <td>{tornado.width} yard / {tornado.length} mile</td>
                        </tr>
                        <tr>
                            <th>Fecha de inicio</th>
                            <td>{Date(tornado.beginDate)}</td>
                        </tr>
                        <tr>
                            <th>Fecha de fin</th>
                            <td>{Date(tornado.endDate)}</td>
                        </tr>
                        <tr>
                            <th>Muertes / Heridos</th>
                            <td>{tornado.personalDamages.deaths} / {tornado.personalDamages.injuries}</td>
                        </tr>
                        <tr>
                            <th>Daños en cultivos / propiedad</th>
                            <td>{tornado.materialDamages.cropDam}$ / {tornado.materialDamages.propDam}$</td>
                        </tr>
                    </tbody>
                </table>
                <div className="map">
                    <LoadScript googleMapsApiKey="AIzaSyDHvcW2eB6t-U0N11u8QjtduZga4l1H2_o">
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={center}
                            zoom={10}
                        >
                            <Marker position={center} />
                        </GoogleMap>
                    </LoadScript>
                </div>
            </div>
        </section>
    );
}