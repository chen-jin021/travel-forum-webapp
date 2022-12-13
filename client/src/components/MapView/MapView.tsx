import React from 'react'
import { useRef } from 'react'
import {useRecoilState} from 'recoil'
import { Wrapper, Status } from '@googlemaps/react-wrapper'
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api'
import { containerStyle, center, options } from './MapSettings'
import {
  mapState,
} from '../../global/Atoms'
export interface IMapViewProps {}

/**
 * This is the button component. It responds to an onClick event.
 *
 * @param props: IButtonProps
 * @returns Button component
 */
export const MapView = (props: IMapViewProps) => {
  const [map, setMap] = React.useState<google.maps.Map>()

  // save map as ref
  const mapRef = useRef<google.maps.Map | null>(null)
  // //
  // const ref = React.useRef<HTMLDivElement>(null)
  // const [map, setMap] = React.useState<google.maps.Map>()

  const onLoad = (map:google.maps.Map) =>{
    mapRef.current = map
    setMap(map)
  }

  const onUnMount = () => {
    mapRef.current = null
  }


  return (
    <>
      {/* <Wrapper apiKey={'AIzaSyDpeuDVOz47pLtmP8zFr6KsDDU7jEAs1Uo'} render={render}>
        <div style ={containerStyle} ref={ref}> </div>
      </Wrapper> */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        options={options as google.maps.MapOptions}
        center={center}
        zoom = {12}
        onLoad = {onLoad}
        onUnmount = {onUnMount}
      />
    </>
  )
}
