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
/******/ 	return __webpack_require__(__webpack_require__.s = "./pages/api/users.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./pages/api/users.js":
/*!****************************!*\
  !*** ./pages/api/users.js ***!
  \****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const MongoClient = __webpack_require__(/*! mongodb */ "mongodb").MongoClient;

const assert = __webpack_require__(/*! assert */ "assert");

const bcrypt = __webpack_require__(/*! bcrypt */ "bcrypt");

const v4 = __webpack_require__(/*! uuid */ "uuid").v4;

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

function createUser(db, email, password, callback) {
  const collection = db.collection(process.env.dbcollection);
  bcrypt.hash(password, saltRounds, function (err, hash) {
    // Store hash in your password DB.
    collection.insertOne({
      userId: v4(),
      email,
      password: hash
    }, function (err, userCreated) {
      assert.equal(err, null);
      callback(userCreated);
    });
  });
}

/* harmony default export */ __webpack_exports__["default"] = ((req, res) => {
  if (req.method === 'POST') {
    // signup
    try {
      assert.notEqual(null, req.body.email, 'Email required');
      assert.notEqual(null, req.body.password, 'Password required');
    } catch (bodyError) {
      res.status(403).json({
        error: true,
        message: bodyError.message
      });
    } // verify email does not exist already


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
          // proceed to Create
          createUser(db, email, password, function (creationResult) {
            if (creationResult.ops.length === 1) {
              const user = creationResult.ops[0];
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
            }
          });
        } else {
          // User exists
          res.status(403).json({
            error: true,
            message: 'Email exists'
          });
          return;
        }
      });
    });
  } else {
    // Handle any other HTTP method
    res.status(200).json({
      users: ['Gowtham']
    });
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

/***/ }),

/***/ "uuid":
/*!***********************!*\
  !*** external "uuid" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("uuid");

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vcGFnZXMvYXBpL3VzZXJzLmpzIiwid2VicGFjazovLy9leHRlcm5hbCBcImFzc2VydFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImJjcnlwdFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImpzb253ZWJ0b2tlblwiIiwid2VicGFjazovLy9leHRlcm5hbCBcIm1vbmdvZGJcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJ1dWlkXCIiXSwibmFtZXMiOlsiTW9uZ29DbGllbnQiLCJyZXF1aXJlIiwiYXNzZXJ0IiwiYmNyeXB0IiwidjQiLCJqd3QiLCJqd3RTZWNyZXQiLCJzYWx0Um91bmRzIiwidXJsIiwicHJvY2VzcyIsImVudiIsImRiTmFtZSIsImNsaWVudCIsInVzZU5ld1VybFBhcnNlciIsInVzZVVuaWZpZWRUb3BvbG9neSIsImZpbmRVc2VyIiwiZGIiLCJlbWFpbCIsImNhbGxiYWNrIiwiY29sbGVjdGlvbiIsImRiY29sbGVjdGlvbiIsImZpbmRPbmUiLCJjcmVhdGVVc2VyIiwicGFzc3dvcmQiLCJoYXNoIiwiZXJyIiwiaW5zZXJ0T25lIiwidXNlcklkIiwidXNlckNyZWF0ZWQiLCJlcXVhbCIsInJlcSIsInJlcyIsIm1ldGhvZCIsIm5vdEVxdWFsIiwiYm9keSIsImJvZHlFcnJvciIsInN0YXR1cyIsImpzb24iLCJlcnJvciIsIm1lc3NhZ2UiLCJjb25uZWN0IiwiY29uc29sZSIsImxvZyIsInVzZXIiLCJjcmVhdGlvblJlc3VsdCIsIm9wcyIsImxlbmd0aCIsInRva2VuIiwic2lnbiIsImV4cGlyZXNJbiIsInVzZXJzIl0sIm1hcHBpbmdzIjoiOztRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EsSUFBSTtRQUNKO1FBQ0E7O1FB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Y0FBYyxDQUFDQyxHQUFmLENBQW1CLENBQW5CLENBQWI7QUFDQSxvQkFBTUUsS0FBSyxHQUFHMUMsR0FBRyxDQUFDMkMsSUFBSixDQUNaO0FBQUNyQixzQkFBTSxFQUFFZ0IsSUFBSSxDQUFDaEIsTUFBZDtBQUFzQlYscUJBQUssRUFBRTBCLElBQUksQ0FBQzFCO0FBQWxDLGVBRFksRUFFWlgsU0FGWSxFQUdaO0FBQ0UyQyx5QkFBUyxFQUFFLElBRGIsQ0FDbUI7O0FBRG5CLGVBSFksQ0FBZDtBQU9BbEIsaUJBQUcsQ0FBQ0ssTUFBSixDQUFXLEdBQVgsRUFBZ0JDLElBQWhCLENBQXFCO0FBQUNVO0FBQUQsZUFBckI7QUFDQTtBQUNEO0FBQ0YsV0FiUyxDQUFWO0FBY0QsU0FoQkQsTUFnQk87QUFDTDtBQUNBaEIsYUFBRyxDQUFDSyxNQUFKLENBQVcsR0FBWCxFQUFnQkMsSUFBaEIsQ0FBcUI7QUFBQ0MsaUJBQUssRUFBRSxJQUFSO0FBQWNDLG1CQUFPLEVBQUU7QUFBdkIsV0FBckI7QUFDQTtBQUNEO0FBQ0YsT0ExQk8sQ0FBUjtBQTJCRCxLQWxDRDtBQW1DRCxHQTdDRCxNQTZDTztBQUNMO0FBQ0FSLE9BQUcsQ0FBQ0ssTUFBSixDQUFXLEdBQVgsRUFBZ0JDLElBQWhCLENBQXFCO0FBQUNhLFdBQUssRUFBRSxDQUFDLFNBQUQ7QUFBUixLQUFyQjtBQUNEO0FBQ0YsQ0FsREQsRTs7Ozs7Ozs7Ozs7QUN2Q0EsbUM7Ozs7Ozs7Ozs7O0FDQUEsbUM7Ozs7Ozs7Ozs7O0FDQUEseUM7Ozs7Ozs7Ozs7O0FDQUEsb0M7Ozs7Ozs7Ozs7O0FDQUEsaUMiLCJmaWxlIjoicGFnZXMvYXBpL3VzZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSByZXF1aXJlKCcuLi8uLi9zc3ItbW9kdWxlLWNhY2hlLmpzJyk7XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdHZhciB0aHJldyA9IHRydWU7XG4gXHRcdHRyeSB7XG4gXHRcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG4gXHRcdFx0dGhyZXcgPSBmYWxzZTtcbiBcdFx0fSBmaW5hbGx5IHtcbiBcdFx0XHRpZih0aHJldykgZGVsZXRlIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdO1xuIFx0XHR9XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9wYWdlcy9hcGkvdXNlcnMuanNcIik7XG4iLCJjb25zdCBNb25nb0NsaWVudCA9IHJlcXVpcmUoJ21vbmdvZGInKS5Nb25nb0NsaWVudDtcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuY29uc3QgYmNyeXB0ID0gcmVxdWlyZSgnYmNyeXB0Jyk7XG5jb25zdCB2NCA9IHJlcXVpcmUoJ3V1aWQnKS52NDtcbmNvbnN0IGp3dCA9IHJlcXVpcmUoJ2pzb253ZWJ0b2tlbicpO1xuY29uc3Qgand0U2VjcmV0ID0gJ1NVUEVSU0VDUkVURTIwMjIwJztcblxuY29uc3Qgc2FsdFJvdW5kcyA9IDEwO1xuY29uc3QgdXJsID0gcHJvY2Vzcy5lbnYudXJsO1xuY29uc3QgZGJOYW1lID0gcHJvY2Vzcy5lbnYuZGJOYW1lO1xuXG5jb25zdCBjbGllbnQgPSBuZXcgTW9uZ29DbGllbnQodXJsLCB7XG4gIHVzZU5ld1VybFBhcnNlcjogdHJ1ZSxcbiAgdXNlVW5pZmllZFRvcG9sb2d5OiB0cnVlLFxufSk7XG5cbmZ1bmN0aW9uIGZpbmRVc2VyKGRiLCBlbWFpbCwgY2FsbGJhY2spIHtcbiAgY29uc3QgY29sbGVjdGlvbiA9IGRiLmNvbGxlY3Rpb24ocHJvY2Vzcy5lbnYuZGJjb2xsZWN0aW9uKTtcbiAgY29sbGVjdGlvbi5maW5kT25lKHtlbWFpbH0sIGNhbGxiYWNrKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlVXNlcihkYiwgZW1haWwsIHBhc3N3b3JkLCBjYWxsYmFjaykge1xuICBjb25zdCBjb2xsZWN0aW9uID0gZGIuY29sbGVjdGlvbihwcm9jZXNzLmVudi5kYmNvbGxlY3Rpb24pO1xuICBiY3J5cHQuaGFzaChwYXNzd29yZCwgc2FsdFJvdW5kcywgZnVuY3Rpb24oZXJyLCBoYXNoKSB7XG4gICAgLy8gU3RvcmUgaGFzaCBpbiB5b3VyIHBhc3N3b3JkIERCLlxuICAgIGNvbGxlY3Rpb24uaW5zZXJ0T25lKFxuICAgICAgeyBcbiAgICAgICAgdXNlcklkOiB2NCgpLFxuICAgICAgICBlbWFpbCxcbiAgICAgICAgcGFzc3dvcmQ6IGhhc2gsXG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24oZXJyLCB1c2VyQ3JlYXRlZCkge1xuICAgICAgICBhc3NlcnQuZXF1YWwoZXJyLCBudWxsKTtcbiAgICAgICAgY2FsbGJhY2sodXNlckNyZWF0ZWQpO1xuICAgICAgfSxcbiAgICApO1xuICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgKHJlcSwgcmVzKSA9PiB7XG4gIGlmIChyZXEubWV0aG9kID09PSAnUE9TVCcpIHtcbiAgICAvLyBzaWdudXBcbiAgICB0cnkge1xuICAgICAgYXNzZXJ0Lm5vdEVxdWFsKG51bGwsIHJlcS5ib2R5LmVtYWlsLCAnRW1haWwgcmVxdWlyZWQnKTtcbiAgICAgIGFzc2VydC5ub3RFcXVhbChudWxsLCByZXEuYm9keS5wYXNzd29yZCwgJ1Bhc3N3b3JkIHJlcXVpcmVkJyk7XG4gICAgfSBjYXRjaCAoYm9keUVycm9yKSB7XG4gICAgICByZXMuc3RhdHVzKDQwMykuanNvbih7ZXJyb3I6IHRydWUsIG1lc3NhZ2U6IGJvZHlFcnJvci5tZXNzYWdlfSk7XG4gICAgfVxuXG4gICAgLy8gdmVyaWZ5IGVtYWlsIGRvZXMgbm90IGV4aXN0IGFscmVhZHlcbiAgICBjbGllbnQuY29ubmVjdChmdW5jdGlvbihlcnIpIHtcbiAgICAgIGFzc2VydC5lcXVhbChudWxsLCBlcnIpO1xuICAgICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0byBNb25nb0RCIHNlcnZlciA9PicpO1xuICAgICAgY29uc3QgZGIgPSBjbGllbnQuZGIoZGJOYW1lKTtcbiAgICAgIGNvbnN0IGVtYWlsID0gcmVxLmJvZHkuZW1haWw7XG4gICAgICBjb25zdCBwYXNzd29yZCA9IHJlcS5ib2R5LnBhc3N3b3JkO1xuXG4gICAgICBmaW5kVXNlcihkYiwgZW1haWwsIGZ1bmN0aW9uKGVyciwgdXNlcikge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe2Vycm9yOiB0cnVlLCBtZXNzYWdlOiAnRXJyb3IgZmluZGluZyBVc2VyJ30pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXVzZXIpIHtcbiAgICAgICAgICAvLyBwcm9jZWVkIHRvIENyZWF0ZVxuICAgICAgICAgIGNyZWF0ZVVzZXIoZGIsIGVtYWlsLCBwYXNzd29yZCwgZnVuY3Rpb24oY3JlYXRpb25SZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChjcmVhdGlvblJlc3VsdC5vcHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHVzZXIgPSBjcmVhdGlvblJlc3VsdC5vcHNbMF07XG4gICAgICAgICAgICAgIGNvbnN0IHRva2VuID0gand0LnNpZ24oXG4gICAgICAgICAgICAgICAge3VzZXJJZDogdXNlci51c2VySWQsIGVtYWlsOiB1c2VyLmVtYWlsfSxcbiAgICAgICAgICAgICAgICBqd3RTZWNyZXQsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgZXhwaXJlc0luOiAzMDAwLCAvLzUwIG1pbnV0ZXNcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7dG9rZW59KTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFVzZXIgZXhpc3RzXG4gICAgICAgICAgcmVzLnN0YXR1cyg0MDMpLmpzb24oe2Vycm9yOiB0cnVlLCBtZXNzYWdlOiAnRW1haWwgZXhpc3RzJ30pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gSGFuZGxlIGFueSBvdGhlciBIVFRQIG1ldGhvZFxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHt1c2VyczogWydHb3d0aGFtJ119KTtcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImFzc2VydFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJiY3J5cHRcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwianNvbndlYnRva2VuXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm1vbmdvZGJcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwidXVpZFwiKTsiXSwic291cmNlUm9vdCI6IiJ9