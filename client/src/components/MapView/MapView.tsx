import React from 'react'
import { useRef } from 'react'
import { Wrapper, Status } from '@googlemaps/react-wrapper'
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api'
import { containerStyle, center, options } from './MapSettings'
export interface IMapViewProps {}

/**
 * This is the button component. It responds to an onClick event.
 *
 * @param props: IButtonProps
 * @returns Button component
 */
export const MapView = (props: IMapViewProps) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google_map_script',
    googleMapsApiKey: 'AIzaSyDpeuDVOz47pLtmP8zFr6KsDDU7jEAs1Uo',
  })

  // save map as ref
  const mapRef = useRef<google.maps.Map | null>(null)
  // //
  // const ref = React.useRef<HTMLDivElement>(null)
  // const [map, setMap] = React.useState<google.maps.Map>()

  const onLoad = (map:google.maps.Map) =>{
    mapRef.current = map
  }

  const onUnMount = () => {
    mapRef.current = null
  }

  if(!isLoaded) return <div>Map Loading...</div>

  const render = (status: Status) => {
    return <h1>{status}</h1>
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
