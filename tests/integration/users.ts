import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { app } from '../../src';

describe('POST /signup', () => {
  it('should return 400 for invalid payload', (done) => {
    request(app)
      .post('/signup')
      .send({
        input: 'invalid request',
      })
      .expect(400, done);
  });

  it('should return 200 if payload is valid', (done) => {
    request(app)
      .post('/signup')
      .send({
        user: {
          email: `${uuidv4()}@test.com`,
          name: 'testsenorita',
          password: 'test',
        },
      })
      .expect(200)
      .then((res) => {
        expect(res.body.token).toBeDefined();
        done();
      });
  });

  it('should return 500 if email is duplicated', (done) => {
    const email = `${uuidv4()}@test.com`;
    request(app)
      .post('/signup')
      .send({
        user: {
          email,
          name: 'testsenorita',
          password: 'test',
        },
      })
      .expect(200)
      .then((_) => {
        request(app)
          .post('/signup')
          .send({
            user: {
              email,
              name: 'testsenorita',
              password: 'test',
            },
          })
          .expect(500, done);
      });
  });
});

describe('POST /login', () => {
  it('should return 200 if login is successful', (done) => {
    const email = `${uuidv4()}@test.com`;
    const password = uuidv4();
    request(app)
      .post('/signup')
      .send({
        user: {
          name: 'testsenorita',
          email,
          password,
        },
      })
      .expect(200)
      .then((_) => {
        request(app)
          .post('/login')
          .send({
            login: {
              email,
              password,
            },
          })
          .expect(200);
        done();
      });
  });

  it('should return 400 if password is wrong', (done) => {
    const email = `${uuidv4()}@test.com`;
    request(app)
      .post('/signup')
      .send({
        user: {
          name: 'testsenorita',
          email,
          password: 'cool password',
        },
      })
      .expect(200)
      .then((_) => {
        request(app)
          .post('/login')
          .send({
            login: {
              email,
              password: 'wrong password',
            },
          })
          .expect(400);
        done();
      });
  });
});
