import {
  setTrams,
  setWeather,
} from './actions'

import {
  getTrams,
  getWeather,
  timeout,
} from '../utils'

import {
  TRAM_STOPS,
  TRAM_LINES,
} from '../config'




export const startPolling = (() => {
  let polling = false

  return async store => {
    if (polling) return
    polling = true

    try {
      const arrivals = await Promise.all(TRAM_STOPS.map( x => getTrams(x) ))
      const sortedArrivals = arrivals
        .reduce( (res, stopTimes) => [...res, ...stopTimes], [] )
        .sort( (a, b) => a.arrival - b.arrival )
        .filter( arrival => TRAM_LINES.includes(arrival.lineName) )
      store.dispatch(setTrams(sortedArrivals))

      const weather = await getWeather()
      store.dispatch(setWeather(weather))

    } catch (err) {
      console.warn(err)
    }

    await timeout(30000)
    polling = false
    startPolling(store)
  }
})()
