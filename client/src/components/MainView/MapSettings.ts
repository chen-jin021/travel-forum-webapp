import { style } from './MapStyle'

export const containerStyle = {
  width: '100%',
  height: 'calc(100vh - 50px)',
}

/**
 * default map settings
 */
export const center = {
  lat: 39.8097343,
  lng: -98.5556199,
}

/**
 * default map settings
 */
export const zoom = 3

export const options = {
  styles: style,
  disableDefaultUI: true,
  zoomControl: true,
}
