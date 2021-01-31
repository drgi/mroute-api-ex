const xmlbuilder = require('xmlbuilder')
class ConvertRoute {
    constructor(parsedRoute) {
        this.route = parsedRoute
        this.gpx = ''
    }
    convertToGpx() {
        console.log('RouteConvert to GPX')
        const wpts = this.route.points.map(point => {
            return {
                '@lat': point.latLng[0],
                '@lon': point.latLng[1],
                'name': {'#text': point.name},
                'desc': point.description
            }
        })
        const trkpt = this.route.geoJson.map(feature => feature.geometry.coordinates)
            .flat()
            .map(pt => {
                return {
                    '@lat': pt[1],
                    '@lon': pt[0],
                    '#text': ' '
                }
            }) 
        const gpxObj = {
            'gpx': {
                '@xmlns': 'http://www.topografix.com/GPX/1/1',
                '@version': '1.1',
                '@creator': 'moto-route.ru',
                'metadata': {
                    'link': {
                        '@href': 'http://www.moto-route.ru',
                        'text': 'Moto Route',
                    },                    
                   // 'time': new Date().toUTCString()
                },
                'wpt': wpts,
                'trk': {
                    'name': this.route.name,
                    'trkseg': {
                        'trkpt': trkpt
                    }
                }
            }        

        }
        const gpx = xmlbuilder.create(gpxObj, {encoding: 'utf-8', standalone: false})
        return gpx.end({pretty: true})
    }
    convertToKlm() {

    }
}
const RouteConverter = function (route) {
    console.log(route)
    // 1. распарсить точки и геоджей сон в объект с данными
    const parsedRoute = {}
    parsedRoute.name = route.name
    parsedRoute.description = route.description
    parsedRoute.geoJson = route.routeGeoJson.features.filter(feature => {
        if (feature.geometry.type === 'LineString') {
            return feature
        }
        parsedRoute.points = route.points.map(point => {
            return {
                latLng: [point.lnglat[1], point.lnglat[0]],
                name: point.title,
                description: point.description
            }
        })
    })
    // 2. обернуть в класс и вернуть
    console.log('ParsedRoute', parsedRoute.geoJson)
    return new ConvertRoute(parsedRoute) 
}
 
module.exports = RouteConverter