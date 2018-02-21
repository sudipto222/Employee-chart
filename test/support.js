/*eslint-env node*/
'use strict';
/**
 * @author: Sushil Verma
 * @version: 1.0
 * @date: 30/06/2017
 * @Description: Unit testing supporting 
 */
var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var chaiHttp = require('chai-http');
chai.use(chaiAsPromised);
chai.use(chaiHttp);

// Add promise support if this does not exist natively.
if (!global.Promise) {
  var q = require('q');
  chai.request.addPromises(q.Promise);
}
global.assert = chai.assert;
global.expect = expect;