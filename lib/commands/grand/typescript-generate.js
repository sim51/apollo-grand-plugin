"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Request = require("request-promise-native");
const command_1 = require("@oclif/command");
const { stdout, stderr } = require('stdout-stderr');
stdout.print = true;
class GraphQlTypescriptGenerator extends command_1.Command {
    async run() {
        const { args, flags } = this.parse(GraphQlTypescriptGenerator);
        const schema = await this.getGraphQlSchema(flags.url ? flags.url : 'http://localhost:4000/');
        const queryType = schema.queryType.name;
        const mutationType = schema.mutationType.name;
        let enumValues = new Map();
        let objectValues = new Map();
        let inputObjectValues = new Map();
        // Objects,enums, ...
        schema.types.forEach((type) => {
            if (type.kind === 'ENUM') {
                enumValues.set(type.name, this.generateEnum(type));
            }
            if (type.kind === 'OBJECT') {
                objectValues.set(type.name, this.generateObject(type));
            }
            if (type.kind === 'INPUT_OBJECT') {
                inputObjectValues.set(type.name, this.generateInputObject(type));
            }
        });
        // Queries & Mutations
        schema.types.forEach((type) => {
            // Working on queries
            if (type.name === queryType) {
                type.fields.forEach((query) => {
                    //this.log(this.generateQuery(query));
                });
            }
            // Working on mutations
            if (type.name === mutationType) {
                type.fields.forEach((mutation) => {
                    //this.log(this.generateMutation(mutation));
                });
            }
        });
        //this.log(response);
    }
    generateQuery(query) {
        return `query Query${query.name}( ${query.args.map((args) => this.generateQueryArgs(args))} ) {
              ${query.name}(${query.args.map((args) => `${args.name}: $${args.name}`)}) {
                ...
              }
            } `;
    }
    generateMutation(query) {
        return `query Query${query.name}( ${query.args.map((args) => this.generateQueryArgs(args))} ) {
              ${query.name}(${query.args.map((args) => `${args.name}: $${args.name}`)}) {
                ...
              }
            } `;
    }
    generateQueryArgs(args) {
        if (args.type.kind === 'LIST') {
            return `$${args.name}: [${args.type.ofType.name}]`;
        }
        else {
            return `$${args.name}: ${args.type.name}`;
        }
    }
    generateEnum(type) {
        return `enum ${type.name} {
            ${type.enumValues.map((item) => `\t${item.name}`).join('\n')}
            }`;
    }
    generateInputObject(type) {
        return '';
    }
    generateObject(type) {
        let properties = type.fields
            .filter((field) => {
            if (field.type.kind === 'SCALAR' ||
                (field.type.kind === 'NON_NULL' && field.type.ofType.kind === 'SCALAR') ||
                (field.type.kind === 'LIST' && field.type.ofType.kind === 'SCALAR'))
                return true;
            else
                return false;
        })
            .map((field) => {
            let type = '';
            if (field.type.kind === 'SCALAR') {
                return `${field.name}: ${this.graphQLType2Typescript(field.type.name)} | null;`;
            }
            if (field.type.kind === 'NON_NULL') {
                return `${field.name}: ${this.graphQLType2Typescript(field.type.ofType.name)};`;
            }
            if (field.type.kind === 'LIST') {
                return `${field.name}: ${this.graphQLType2Typescript(field.type.kind.ofType.name)}[] | null;`;
            }
        });
        return `export interface ${type.name} {
              __typename:"${type.name}";
              ${properties.join('\n')}
            }`;
    }
    graphQLType2Typescript(type) {
        switch (type) {
            case 'ID':
                return 'string';
                break;
            case 'Float':
                return 'number';
                break;
            case 'Int':
                return 'number';
                break;
            case 'Boolean':
                return 'boolean';
                break;
            default:
                return type;
        }
    }
    async getGraphQlSchema(url) {
        const body = {
            operationName: 'IntrospectionQuery',
            query: `
        query IntrospectionQuery {
          __schema {
            queryType {
              name
            }
            mutationType {
              name
            }
            subscriptionType {
              name
            }
            types {
              ...FullType
            }
            directives {
              name
              description
              locations
              args {
                ...InputValue
              }
            }
          }
        }
        fragment FullType on __Type {
          kind
          name
          description
          fields(includeDeprecated: true) {
            name
            description
            args {
              ...InputValue
            }
            type {
              ...TypeRef
            }
            isDeprecated    deprecationReason
          }
          inputFields {
            ...InputValue
          }
          interfaces {
            ...TypeRef
          }
          enumValues(includeDeprecated: true) {
            name
            description
            isDeprecated
            deprecationReason
          }
          possibleTypes {
            ...TypeRef
          }
        }
        fragment InputValue on __InputValue {
          name
          description
          type {
            ...TypeRef
          }
          defaultValue
        }
        fragment TypeRef on __Type {
           kind
           name
           ofType {
             kind
             name
             ofType {
               kind
               name
               ofType {
                 kind
                 name
                 ofType {
                   kind
                   name
                   ofType {
                     kind
                     name
                     ofType {
                       kind
                       name
                       ofType {
                         kind
                         name
                       }
                     }
                   }
                 }
               }
             }
           }
         }`,
            variables: {}
        };
        const response = await Request({ method: 'POST', url: url, body: body, json: true });
        return response.data['__schema'];
    }
}
GraphQlTypescriptGenerator.description = 'Generate the typescript interfaces from the GRAND stack GraphQl schema';
GraphQlTypescriptGenerator.flags = {
    url: command_1.flags.string({ char: 'u', description: 'GraphQl endpoint' })
};
GraphQlTypescriptGenerator.args = [
    { name: 'path', description: 'location where to write files' },
];
exports.default = GraphQlTypescriptGenerator;
