# node-auth

JWT auth provider + user management system written in nodejs.

## Tech stacks

* Language: Typescript 
* Framework: [Express](https://expressjs.com/)
* Database: postgres
* ORM: [Prisma](https://www.prisma.io/)
* Payload validation: [celebrate](https://www.npmjs.com/package/celebrate)
* JWT token: [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
* Test: jest, [supertest](https://www.npmjs.com/package/supertest)

## Features
* issue token & introspect token endpoints
* user regsitration & login
* express auth token authentication middleware
* TODO: refresh token

### Getting started
To run app on docker:
1. Copy `.env.sample` and rename to `.env`.
2. Run `docker-compose up`
3. App should be accessible at http://localhost:7000

To run app locally:
* Prerequisites: nodejs v16
1. Copy `.env.sample` and rename to `.env`.
2. Run `docker-compose up`
3. Run `npm install`
4. Setup prisma schemas. Run `npx prisma generate`
5. Run `npm run dev`. Your local server should be running at http://localhost:5555

### Testing

```
# unit tests
npm run test:unit

# integration tests, requires DB connection (run docker-compose up)
npm run test:integration
```
