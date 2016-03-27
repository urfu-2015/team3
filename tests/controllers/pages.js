'use strict';

const supertest = require('supertest');
const app = require('../../app');

describe('GET /nonExistentPage', () => {
    it('should respond with 404', done => {
        supertest(app)
            .get('/nonExistentPage')
            .expect(404, 'Not Found')
            .end(done);
    });
});

describe('Registration and authorization', () => {
    describe('Log in', () => {
        it('should get login page', done => {
            supertest(app)
                .get('/login')
                .expect(200)
                .end(done);
        });
        it('should redirect to the main page if data is correct', done => {
            supertest(app)
                .post('/login')
                .set('Content-type', 'application/x-www-form-urlencoded')
                .send({username: 'kolobok@mail.ru', password: '1234'})
                .expect(302)
                .end(done);
        });
        it('should redirect to the login page if data is incorrect', done => {
            supertest(app)
                .post('/login')
                .set('Content-type', 'application/x-www-form-urlencoded')
                .send({username: 'kolobok@mail.ru', password: '123'})
                .expect('Location', '/login')
                .end(done);
        });
    });
    describe.skip('Register', () => {
        it('should get registration page', done => {
            supertest(app)
                .get('/register')
                .expect(200)
                .end(done);
        });
        it('should redirect to the main page if data is correct', done => {
            supertest(app)
                .post('/register')
                .set('Content-type', 'application/x-www-form-urlencoded')
                .send({username: 'newUser', password: '1234'})
                .expect(302)
                .expect('Location', '/')
                .end(done);
        });
        it('should redirect to the login page if login already exists', done => {
            supertest(app)
                .post('/register')
                .set('Content-type', 'application/x-www-form-urlencoded')
                .send({username: 'kolobok@mail.ru', password: '123'})
                .expect('Location', '/register')
                .end(done);
        });
    });
});
