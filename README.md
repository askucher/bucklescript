# [BuckleScript](http://bloomberg.github.io/bucklescript/)

A JavaScript backend for [OCaml](https://ocaml.org/) focused on smooth integration and clean generated code.

## Try BuckleScript

You can try BuckleScript directly [in your browser](http://bloomberg.github.io/bucklescript/js-demo/). Write OCaml in the left panel and
watch as it instantly compiles to JavaScript shown in the right panel.


## Installing BuckleScript
```
npm install bucklescript -g
```


## Use in Node
```
var bucklescript = require("bucklescript")

var compiledJavascript = bucklescript.compile('let test = 1')

console.log(compiledJavascript)

```

## Use in CommandLine
```
bsc -c file.ocaml

```




## Documentation

See http://bloomberg.github.io/bucklescript/Manual.html for detailed documentation on BuckleScript. If you'd
like to contribute content [see here](https://github.com/bloomberg/bucklescript/blob/master/site/docsource)
for the documentation source.

## How BuckleScript Works

BuckleScript leverages the existing OCaml compiler and toolchain to produce JavaScript that closely
resembles the original OCaml. This has several immediate advantages:

* name mangling is avoided
* stack traces are preserved
* OCaml modules are mapped to JavaScript modules
* OCaml optimizations (e.g., constant folding, DCE, TCO) are reusable
* OCaml attributes allow fine control over generated JavaScript

These points make the integration of JavaScript with OCaml very clean and smooth. In this way,
BuckleScript provides all the benefits of OCaml's excellent compiler and sophisticated type system
alongside the rich cross-platform JavaScript ecosystem.

## BuckleScript Examples

Basic examples of using BuckleScript are provided below. More extensive examples are available at
https://github.com/bloomberg/bucklescript-addons.

#### An HTTP Server

This example creates a simple http server. The complete code is available
[here](https://github.com/bloomberg/bucklescript-addons/tree/master/examples/node-http-server).

The attribute `[@bs]` used in the example below is one of the OCaml attributes mentioned earlier.
When BuckleScript generates code, it may use either a curried (OCaml) or uncurried (JavaScript)
calling convention depending on how the code gets optimized. The `[@bs]` attribute can be used to
decorate functions and call-sites so that generated code is guaranteed to use the uncurried style.
This guarentee eases integration with existing JavaScript code and avoids unnecessary overhead.

##### Input:

```ocaml
let port = 3000
let hostname = "127.0.0.1"
let create_server http =
  let server = http##createServer begin fun [@bs] req resp ->
      resp##statusCode #= 200;
      resp##setHeader "Content-Type" "text/plain";
      resp##_end "Hello world\n"
    end
  in
  server##listen port hostname begin fun [@bs] () ->
    Js.log ("Server running at http://"^ hostname ^ ":" ^ Pervasives.string_of_int port ^ "/")
  end

let () = create_server Http_types.http
```

##### Output:

```js
'use strict';
var Pervasives = require("bs-platform/lib/js/pervasives");
var Http       = require("http");

var hostname = "127.0.0.1";

function create_server(http) {
  var server = http.createServer(function (_, resp) {
    resp.statusCode = 200;
    resp.setHeader("Content-Type", "text/plain");
    return resp.end("Hello world\n");
  });
  return server.listen(3000, hostname, function () {
    console.log("Server running at http://" + (hostname + (":" + (Pervasives.string_of_int(3000) + "/"))));
    return /* () */0;
  });
}

create_server(Http);
```

#### Immutable Data Structures

This example demonstrates the use of immutable data structures. The OCaml code uses the BuckleScript
compiled OCaml standard library. The JavaScript code, given as a point of comparison, uses the
Facebook `immutable` library.

This comparison is somewhat contrived but nevertheless the BuckleScript compiled version has several
nice characteristics:

Execution Time:

- BuckleScript: 1186ms
- JavaScript: 3415ms

Compiled Size:

- BuckleScript (production): 899 Bytes
- JavaScript: 55.3K Bytes

##### BuckleScript (OCaml stdlib)

```Ocaml
module IntMap = Map.Make(struct
  type t = int
  let compare (x : int) y = compare x y
end)

let test () =
  let m = ref IntMap.empty in
  let count = 1000000 in
  for i = 0 to count do
    m := IntMap.add i i !m
  done;
  for i = 0 to count do
    ignore (IntMap.find i !m)
  done

let () = test()
```

##### Javascript (facebook `immutable`)

``` js
'use strict';

var Immutable = require('immutable');
var Map = Immutable.Map;
var m = new Map();

function test() {
  var count = 1000000;
  for(var i = 0; i < count; ++i) {
    m = m.set(i, i);
  }
  for(var j = 0; j < count; ++j) {
    m.get(j);
  }
}

test();
```
