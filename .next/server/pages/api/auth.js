module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = require('../../ssr-module-cache.js');
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./pages/api/auth.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./pages/api/auth.js":
/*!***************************!*\
  !*** ./pages/api/auth.js ***!
  \***************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const MongoClient = __webpack_require__(/*! mongodb */ "mongodb").MongoClient;

const assert = __webpack_require__(/*! assert */ "assert");

const bcrypt = __webpack_require__(/*! bcrypt */ "bcrypt");

const jwt = __webpack_require__(/*! jsonwebtoken */ "jsonwebtoken");

const jwtSecret = 'SUPERSECRETE20220';
const saltRounds = 10;
const url = process.env.url;
const dbName = process.env.dbName;
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

function findUser(db, email, callback) {
  const collection = db.collection(process.env.dbcollection);
  collection.findOne({
    email
  }, callback);
}

function authUser(db, email, password, hash, callback) {
  const collection = db.collection(process.env.dbcollection);
  bcrypt.compare(password, hash, callback);
}

/* harmony default export */ __webpack_exports__["default"] = ((req, res) => {
  if (req.method === 'POST') {
    //login
    try {
      assert.notEqual(null, req.body.email, 'Email required');
      assert.notEqual(null, req.body.password, 'Password required');
    } catch (bodyError) {
      res.status(403).send(bodyError.message);
    }

    client.connect(function (err) {
      assert.equal(null, err);
      console.log('Connected to MongoDB server =>');
      const db = client.db(dbName);
      const email = req.body.email;
      const password = req.body.password;
      findUser(db, email, function (err, user) {
        if (err) {
          res.status(500).json({
            error: true,
            message: 'Error finding User'
          });
          return;
        }

        if (!user) {
          res.status(404).json({
            error: true,
            message: 'User not found'
          });
          return;
        } else {
          authUser(db, email, password, user.password, function (err, match) {
            if (err) {
              res.status(500).json({
                error: true,
                message: 'Auth Failed'
              });
            }

            if (match) {
              const token = jwt.sign({
                userId: user.userId,
                email: user.email
              }, jwtSecret, {
                expiresIn: 3000 //50 minutes

              });
              res.status(200).json({
                token
              });
              return;
            } else {
              res.status(401).json({
                error: true,
                message: 'Auth Failed'
              });
              return;
            }
          });
        }
      });
    });
  } else {
    // Handle any other HTTP method
    res.statusCode = 401;
    res.end();
  }
});

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("assert");

/***/ }),

/***/ "bcrypt":
/*!*************************!*\
  !*** external "bcrypt" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("bcrypt");

/***/ }),

/***/ "jsonwebtoken":
/*!*******************************!*\
  !*** external "jsonwebtoken" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("jsonwebtoken");

/***/ }),

/***/ "mongodb":
/*!**************************!*\
  !*** external "mongodb" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("mongodb");

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vcGFnZXMvYXBpL2F1dGguanMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiYXNzZXJ0XCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiYmNyeXB0XCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwianNvbndlYnRva2VuXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwibW9uZ29kYlwiIl0sIm5hbWVzIjpbIk1vbmdvQ2xpZW50IiwicmVxdWlyZSIsImFzc2VydCIsImJjcnlwdCIsImp3dCIsImp3dFNlY3JldCIsInNhbHRSb3VuZHMiLCJ1cmwiLCJwcm9jZXNzIiwiZW52IiwiZGJOYW1lIiwiY2xpZW50IiwidXNlTmV3VXJsUGFyc2VyIiwidXNlVW5pZmllZFRvcG9sb2d5IiwiZmluZFVzZXIiLCJkYiIsImVtYWlsIiwiY2FsbGJhY2siLCJjb2xsZWN0aW9uIiwiZGJjb2xsZWN0aW9uIiwiZmluZE9uZSIsImF1dGhVc2VyIiwicGFzc3dvcmQiLCJoYXNoIiwiY29tcGFyZSIsInJlcSIsInJlcyIsIm1ldGhvZCIsIm5vdEVxdWFsIiwiYm9keSIsImJvZHlFcnJvciIsInN0YXR1cyIsInNlbmQiLCJtZXNzYWdlIiwiY29ubmVjdCIsImVyciIsImVxdWFsIiwiY29uc29sZSIsImxvZyIsInVzZXIiLCJqc29uIiwiZXJyb3IiLCJtYXRjaCIsInRva2VuIiwic2lnbiIsInVzZXJJZCIsImV4cGlyZXNJbiIsInN0YXR1c0NvZGUiLCJlbmQiXSwibWFwcGluZ3MiOiI7O1FBQUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSxJQUFJO1FBQ0o7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFD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QkFBRyxDQUFDSyxNQUFKLENBQVcsR0FBWCxFQUFnQlMsSUFBaEIsQ0FBcUI7QUFBQ0c7QUFBRCxlQUFyQjtBQUNBO0FBQ0QsYUFYRCxNQVlLO0FBQ0hqQixpQkFBRyxDQUFDSyxNQUFKLENBQVcsR0FBWCxFQUFnQlMsSUFBaEIsQ0FBcUI7QUFBQ0MscUJBQUssRUFBRSxJQUFSO0FBQWNSLHVCQUFPLEVBQUU7QUFBdkIsZUFBckI7QUFDQTtBQUNEO0FBQ0YsV0FwQk8sQ0FBUjtBQXFCRDtBQUNGLE9BaENPLENBQVI7QUFpQ0QsS0F4Q0Q7QUF5Q0QsR0FsREQsTUFrRE87QUFDTDtBQUNBUCxPQUFHLENBQUNxQixVQUFKLEdBQWlCLEdBQWpCO0FBQ0FyQixPQUFHLENBQUNzQixHQUFKO0FBQ0Q7QUFDRixDQXhERCxFOzs7Ozs7Ozs7OztBQ3pCQSxtQzs7Ozs7Ozs7Ozs7QUNBQSxtQzs7Ozs7Ozs7Ozs7QUNBQSx5Qzs7Ozs7Ozs7Ozs7QUNBQSxvQyIsImZpbGUiOiJwYWdlcy9hcGkvYXV0aC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0gcmVxdWlyZSgnLi4vLi4vc3NyLW1vZHVsZS1jYWNoZS5qcycpO1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHR2YXIgdGhyZXcgPSB0cnVlO1xuIFx0XHR0cnkge1xuIFx0XHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuIFx0XHRcdHRocmV3ID0gZmFsc2U7XG4gXHRcdH0gZmluYWxseSB7XG4gXHRcdFx0aWYodGhyZXcpIGRlbGV0ZSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXTtcbiBcdFx0fVxuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vcGFnZXMvYXBpL2F1dGguanNcIik7XG4iLCJjb25zdCBNb25nb0NsaWVudCA9IHJlcXVpcmUoJ21vbmdvZGInKS5Nb25nb0NsaWVudFxuY29uc3QgYXNzZXJ0ID0gcmVxdWlyZSgnYXNzZXJ0JylcbmNvbnN0IGJjcnlwdCA9IHJlcXVpcmUoJ2JjcnlwdCcpXG5jb25zdCBqd3QgPSByZXF1aXJlKCdqc29ud2VidG9rZW4nKVxuY29uc3Qgand0U2VjcmV0ID0gJ1NVUEVSU0VDUkVURTIwMjIwJ1xuXG5jb25zdCBzYWx0Um91bmRzID0gMTA7XG5jb25zdCB1cmwgPSBwcm9jZXNzLmVudi51cmxcbmNvbnN0IGRiTmFtZSA9IHByb2Nlc3MuZW52LmRiTmFtZVxuXG5jb25zdCBjbGllbnQgPSBuZXcgTW9uZ29DbGllbnQodXJsLCB7XG4gIHVzZU5ld1VybFBhcnNlcjogdHJ1ZSxcbiAgdXNlVW5pZmllZFRvcG9sb2d5OiB0cnVlLFxufSk7XG5cbmZ1bmN0aW9uIGZpbmRVc2VyKGRiLCBlbWFpbCwgY2FsbGJhY2spIHtcbiAgY29uc3QgY29sbGVjdGlvbiA9IGRiLmNvbGxlY3Rpb24ocHJvY2Vzcy5lbnYuZGJjb2xsZWN0aW9uKVxuICBjb2xsZWN0aW9uLmZpbmRPbmUoe2VtYWlsfSwgY2FsbGJhY2spO1xufVxuXG5mdW5jdGlvbiBhdXRoVXNlcihkYiwgZW1haWwsIHBhc3N3b3JkLCBoYXNoLCBjYWxsYmFjaykge1xuICBjb25zdCBjb2xsZWN0aW9uID0gZGIuY29sbGVjdGlvbihwcm9jZXNzLmVudi5kYmNvbGxlY3Rpb24pXG4gIGJjcnlwdC5jb21wYXJlKHBhc3N3b3JkLCBoYXNoLCBjYWxsYmFjaylcbn1cblxuZXhwb3J0IGRlZmF1bHQgKHJlcSwgcmVzKSA9PiB7XG4gIGlmIChyZXEubWV0aG9kID09PSAnUE9TVCcpIHtcbiAgICAvL2xvZ2luXG4gICAgdHJ5IHtcbiAgICAgIGFzc2VydC5ub3RFcXVhbChudWxsLCByZXEuYm9keS5lbWFpbCwgJ0VtYWlsIHJlcXVpcmVkJyk7XG4gICAgICBhc3NlcnQubm90RXF1YWwobnVsbCwgcmVxLmJvZHkucGFzc3dvcmQsICdQYXNzd29yZCByZXF1aXJlZCcpO1xuICAgIH0gY2F0Y2ggKGJvZHlFcnJvcikge1xuICAgICAgcmVzLnN0YXR1cyg0MDMpLnNlbmQoYm9keUVycm9yLm1lc3NhZ2UpO1xuICAgIH1cblxuICAgIGNsaWVudC5jb25uZWN0KGZ1bmN0aW9uKGVycikge1xuICAgICAgYXNzZXJ0LmVxdWFsKG51bGwsIGVycik7XG4gICAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIHRvIE1vbmdvREIgc2VydmVyID0+Jyk7XG4gICAgICBjb25zdCBkYiA9IGNsaWVudC5kYihkYk5hbWUpO1xuICAgICAgY29uc3QgZW1haWwgPSByZXEuYm9keS5lbWFpbDtcbiAgICAgIGNvbnN0IHBhc3N3b3JkID0gcmVxLmJvZHkucGFzc3dvcmQ7XG5cbiAgICAgIGZpbmRVc2VyKGRiLCBlbWFpbCwgZnVuY3Rpb24oZXJyLCB1c2VyKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7ZXJyb3I6IHRydWUsIG1lc3NhZ2U6ICdFcnJvciBmaW5kaW5nIFVzZXInfSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdXNlcikge1xuICAgICAgICAgIHJlcy5zdGF0dXMoNDA0KS5qc29uKHtlcnJvcjogdHJ1ZSwgbWVzc2FnZTogJ1VzZXIgbm90IGZvdW5kJ30pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgYXV0aFVzZXIoZGIsIGVtYWlsLCBwYXNzd29yZCwgdXNlci5wYXNzd29yZCwgZnVuY3Rpb24oZXJyLCBtYXRjaCkge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7ZXJyb3I6IHRydWUsIG1lc3NhZ2U6ICdBdXRoIEZhaWxlZCd9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtYXRjaCkgXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbnN0IHRva2VuID0gand0LnNpZ24oXG4gICAgICAgICAgICAgICAge3VzZXJJZDogdXNlci51c2VySWQsIGVtYWlsOiB1c2VyLmVtYWlsfSxcbiAgICAgICAgICAgICAgICBqd3RTZWNyZXQsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgZXhwaXJlc0luOiAzMDAwLCAvLzUwIG1pbnV0ZXNcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7dG9rZW59KTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICByZXMuc3RhdHVzKDQwMSkuanNvbih7ZXJyb3I6IHRydWUsIG1lc3NhZ2U6ICdBdXRoIEZhaWxlZCd9KTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBIYW5kbGUgYW55IG90aGVyIEhUVFAgbWV0aG9kXG4gICAgcmVzLnN0YXR1c0NvZGUgPSA0MDE7XG4gICAgcmVzLmVuZCgpO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYXNzZXJ0XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImJjcnlwdFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJqc29ud2VidG9rZW5cIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibW9uZ29kYlwiKTsiXSwic291cmNlUm9vdCI6IiJ9