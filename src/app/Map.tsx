'use client'

import { FC } from "react"
import UserInterface from "./UserInterface"
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

interface MapProps {
  targetUser: UserInterface,
  setTargetUser: Function,
}

const Map: FC<MapProps> = (props) => {

  let show;  

  if (props.targetUser.latitude !== null && props.targetUser.longitude !== null) {
    show = <MapContainer
        center={[props.targetUser.latitude, props.targetUser.longitude]}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <Marker position={[props.targetUser.latitude, props.targetUser.longitude]} icon={DefaultIcon}>
          <Popup>{props.targetUser.email}</Popup>
        </Marker>
      </MapContainer>
  }

  return (
    <div>
        <p onClick={() => props.setTargetUser(null)}>Назад</p>
        {show}
    </div>
  )
}

export default Map