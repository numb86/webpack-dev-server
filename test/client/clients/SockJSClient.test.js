'use strict';

const http = require('http');
const express = require('express');
const sockjs = require('sockjs');
const SockJSClient = require('../../../client-src/clients/SockJSClient');
const port = require('../../ports-map').sockJSClient;

describe('SockJSClient', () => {
  let socketServer;
  let listeningApp;

  beforeAll((done) => {
    // eslint-disable-next-line new-cap
    const app = new express();

    listeningApp = http.createServer(app);
    listeningApp.listen(port, 'localhost', () => {
      socketServer = sockjs.createServer();
      socketServer.installHandlers(listeningApp, {
        prefix: '/sockjs-node',
      });
      done();
    });
  });

  describe('client', () => {
    it('should open, receive message, and close', (done) => {
      socketServer.on('connection', (connection) => {
        connection.write('hello world');

        setTimeout(() => {
          connection.close();
        }, 1000);
      });

      const client = new SockJSClient(`http://localhost:${port}/sockjs-node`);
      const data = [];

      client.onOpen(() => {
        data.push('open');
      });
      client.onClose(() => {
        data.push('close');
      });
      client.onMessage((msg) => {
        data.push(msg);
      });

      setTimeout(() => {
        expect(data.length).toEqual(3);
        expect(data[0]).toEqual('open');
        expect(data[1]).toEqual('hello world');
        expect(data[2]).toEqual('close');
        done();
      }, 3000);
    });
  });

  afterAll((done) => {
    listeningApp.close(() => {
      done();
    });
  });
});
