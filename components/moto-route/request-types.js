const requestTypes = {
  '/:routeId': {
    GET: {
      body: null,
      params: ['routeId'],
      query: null,
    },
    DELETE: {
      body: null,
      params: ['routeId'],
      query: null,
    },
  },
  '/': {
    POST: {
      body: ['bikeType', 'difficult', 'name', 'type'],
      params: null,
      query: null,
    },
  },
  '/adddraft': {
    POST: {
      body: [
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
      ],
      params: null,
      query: null,
      userId: true,
    },
  },
  '/add/:routeId': {
    PUT: {
      body: [
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
      ],
      params: ['routeId'],
      query: ['isDraft'],
      userId: true,
    },
  },
  '/images': {
    POST: {
      body: ['routeId'],
      params: null,
      query: null,
      files: ['routeImages'],
      userId: true,
    },
  },
  '/images/del': {
    DELETE: {
      body: ['routeId', 'file'],
      userId: true,
    },
  },
  '/pointimages': {
    POST: {
      body: ['routeId', 'pointId'],
      files: ['pointImages'],
    },
  },
  '/pointimages/del': {
    DELETE: {
      body: ['routeId', 'pointId', 'file'],
    },
  },
  '/point/del': {
    DELETE: {
      body: ['routeId', 'pointId'],
    },
  },
};

module.exports = requestTypes;
