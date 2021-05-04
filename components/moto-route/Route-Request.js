const requestedFields = [
  'routeGeoJson',
  'points',
  'avatar',
  'bikeType',
  'description',
  'difficult',
  'duration',
  'name',
  'routeLength',
  'type',
  'routeImages',
  'author',
];
const requestTypes = require('./request-types');
const RouteRequestError = require('./errorsCalss/RouteRequestError');
// class RouteRequestError extends Error {
//   constructor(message, code, type = 'RouteRequest') {
//     super();
//     this.type = type;
//     this.message = message;
//     this.code = code;
//   }
// }
class RouteRequest {
  constructor(req, options) {
    const { ip, route, method } = req;
    const requestType = requestTypes[route.path]?.[method];
    console.log('Route in Request', route, 'Method: ', method);
    if (!requestType)
      throw new RouteRequestError(
        `Тип запроса на ${route.path}, ${method}, не определен`,
        404,
        'Wrong Request Type'
      );
    const failedFields = [];
    const keys = Object.keys(requestType);
    console.log('Request keys: ', keys);
    keys.forEach((key) => {
      if (requestType[key] && Array.isArray(requestType[key])) {
        requestType[key].forEach((el) => {
          console.log('XXX+++', req[key]);

          if (!{ ...req[key] }.hasOwnProperty(el)) {
            failedFields.push(el);
          }
        });
      } else if (typeof requestType[key] === 'boolean') {
        if (req[key]) {
          this[key] = req[key];
        }
      }
    });
    if (failedFields.length > 0) {
      const message = `В запросе нет необходимых полей: ${failedFields.join(
        ','
      )}`;
      throw new RouteRequestError(message, 400, 'No Request Fields');
    }
    const { body, params, query, files } = req;
    this.body = body;
    this.params = params;
    this.fromIp = ip;
    this.query = query;
    this.files = files ? { ...files } : null;
  }
  getQuery() {
    return this.query;
  }
  getParams() {
    return this.params;
  }
  getSearchParams() {
    const searchParams = { isDraft: false };
    for (let [key, value] of Object.entries(this.body)) {
      if (value) {
        searchParams[key] = value;
      }
    }
    return searchParams;
  }
  getRouteDraftData() {
    return Object.assign(this.body, { isDraft: true });
  }
  getUserId() {
    return this.userId;
  }
  getRouteId() {
    return this.body.routeId || null;
  }
  getRouteImageFiles() {
    return this.files?.routeImages || null;
  }
  getFileForDelete() {
    return this.body.file;
  }
  getPointId() {
    return this.body.pointId;
  }
  getPointImages() {
    return this.files?.pointImages;
  }
}

module.exports = RouteRequest;
