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