const EVENTS_SCHEMA = {
  ENTITY_NAME: 'nosto_events',
  SCHEMA_NAME: '0.0.1',
  SCHEMA_BODY: {
    title: 'Nosto Events Queue',
    properties: {
      name: {
        type: 'string',
        title: 'Event Name',
      },
      args: {
        type: 'string',
        title: 'Event arguments',
      },
      nextCall: {
        type: 'integer',
        title: 'Timestamp of next call',
      },
      addToNextCall: {
        type: 'integer',
        title: 'Add this to nextCall',
      },
      retries: {
        type: 'integer',
        title: 'Number of retries',
      },
    },
    'v-required-fields': ['name', 'args', 'nextCall', 'retries'],
    'v-default-fields': ['name', 'args', 'nextCall', 'retries', 'addToNextCall'],
    'v-indexed': ['name', 'nextCall'],
    'v-cache': false,
    'v-security': {
      allowGetAll: true,
    },
  },
};

export default EVENTS_SCHEMA;
