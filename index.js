var exports = require("./compiler.js")

var compile = function(code) {
      var result = exports.compile(code)
      var code = JSON.parse(result).js_code
      if(typeof code !== "undefined") {
        var lines = code.split("\n")
        lines.shift()
       return lines.join("\n")
      }
      return result
}

var bseval = function(code) {
     var result = exports.compile(code)
     var code = JSON.parse(result).js_code
     if(typeof code !== "undefined") {
        return eval(code);
     }
     return result
}

module.exports = {

   compile: compile,
   eval: bseval

}