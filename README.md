= apollo-grand-plugin

GRAND Stack plugin for Apollo CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/apollo-grand-plugin.svg)](https://npmjs.org/package/apollo-grand-plugin)
[![Downloads/week](https://img.shields.io/npm/dw/apollo-grand-plugin.svg)](https://npmjs.org/package/apollo-grand-plugin)
[![License](https://img.shields.io/npm/l/apollo-grand-plugin.svg)](https://github.com/sim51/apollo-grand-plugin/blob/master/package.json)

== How to use it

First you need to have https://www.npmjs.com/package/apollo[Apollo CLI] installed : `npm install -g apollo`
Then you you can run this command to install this plugin : `apollo plugins:install https://github.com/sim51/apollo-grand-plugin`

=== Generate the schema

You can generate the Graphql schema from a neo4j instance just by executing this command :

`apollo grand:schema-generate -u bolt://localhost:7687 -l neo4j -p admin`

The schema will be displayed in the console. 

== Todo

=== Schema Generator

* Check the name of properties for relationship in & out
* Handle rels that have many nodelabels
* Add blacklist for label (and properties?)
* Scalar for date and Geo point ?
* Add the file location for writting the schema

=== Crud generator
