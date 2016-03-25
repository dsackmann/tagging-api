Tagging API
-----------
Tag things!

Dependencies
------------
Requires <a href="https://nodejs.org" target="_blank">Node.js</a> version >=4.2

Install
-------
```
cd tagging-api
npm install
```

Run
---
```
npm start
```

Test
----
```
npm test
```

API
---

### POST /tags
Create a new entity from the post body. Any existing entity with the same type and identifier will be overwritten

#### Schema
Expected schema is defined in [newEntityValidator.js](src/validators/newEntityValidator.js) Schema validation errors will be returned in the error response body

### GET /tags/:entity_type/:entity_id
Returns a JSON representation of the entity and the tags it has assigned. Returns a 404 if no such entity exists.
Example:
```
{
    "entityType": "book", 
    "identifier": "abc-123", 
    "tags":["a","b"]
}
```

### DELETE /tags/:entity_type/:entity_id
Completely removes the entity and tags. Returns a 404 if no such entity exists.

### GET /stats

Retrieves statistics about all tags
Example:
```
[{tag: 'Bike', count: 5}, {tag: 'Pink', count: 3}]
```

### GET /stats/:entity_type/:entity_id
Retrieves statistics about a specific tagged entity. Returns a 404 if no such entity exists.
Example:
```
{
    "entityType": "book", 
    "identifier": "abc-123", 
    "totalTags":2,
    "numSimilarEntities": 5
}
```

Notes
-----

### Routing ###

All routes and endpoints are defined in [app.js](src/app.js) using <a href="http://expressjs.com/" target="_blank">Express.</a>

### Testing ###

Unit tests for individual components live in the same directory as the code under test. In the unit tests, the persistence layer is mocked. In addition to the unit tests, each API is tested end-to-end in [app.e2e.test.js,](src/app.e2e.test.js) with a real persistence layer

### Persistence Layer ###

Uses <a href="https://github.com/louischatriot/nedb" target="_blank">nedb</a>, an in-memory document store with a mongo style API. Why? Because it does the job and you can install it with npm.

Changes From Spec
-----------------

* POST /tag changed to POST /tags for consistency
* GET /stats/:entity_type/:entity_id contains an additional field `numSimilarEntities` which counts the number of other entities that share at least one tag with the requested entity. 