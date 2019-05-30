import * as Request from 'request-promise-native';

import { Command, flags } from '@oclif/command';

const { stdout, stderr } = require('stdout-stderr')

stdout.print = true;

export default class GraphQlTypescriptGenerator extends Command {

  static description = 'Generate the typescript interfaces from the GRAND stack GraphQl schema';

  static flags = {
    url: flags.string({ char: 'u', description: 'GraphQl endpoint' })
  }

  static args = [
    { name: 'path', description: 'location where to write files' },
  ]

  async run() {
    const { args, flags } = this.parse(GraphQlTypescriptGenerator);

    const schema: any = await this.getGraphQlSchema(flags.url ? flags.url : 'http://localhost:4000/');
    const queryType = schema.queryType.name;
    const mutationType = schema.mutationType.name;

    let definitions: Map<string, string> = new Map();

    // Objects,enums, ...
    schema.types.forEach((type: any) => {
      // if (type.kind === 'ENUM') {
      //   definitions.set(`ENUM_${type.name}`, this.generateEnum(type));
      // }
      if (type.kind === 'OBJECT') {
        definitions.set(`OBJECT_${type.name}`, this.generateObject(type));
      }
      // if (type.kind === 'INPUT_OBJECT') {
      //   definitions.set(`INPUT_OBJECT_${type.name}`, this.generateInputObject(type));
      // }
    });

    // Queries & Mutations
    schema.types.forEach((type: any) => {
      // Working on queries
      if (type.name === queryType) {
        type.fields.forEach((query: any) => {
          //this.log(this.generateQuery(query));
        });
      }
      // Working on mutations
      if (type.name === mutationType) {
        type.fields.forEach((mutation: any) => {
          //this.log(this.generateMutation(mutation));
        });
      }
    });
    //this.log(response);
  }

  generateQuery(query: any): string {
    return `query ${query.name}( ${query.args.map((args: any) => this.generateQueryArgs(args))} ) {
              ${query.name}(${query.args.map((args: any) => `${args.name}: $${args.name}`)}) {
                ...
              }
            } `;
  }

  generateMutation(query: any): string {
    return `query Query${query.name}( ${query.args.map((args: any) => this.generateQueryArgs(args))} ) {
              ${query.name}(${query.args.map((args: any) => `${args.name}: $${args.name}`)}) {
                ...
              }
            } `;
  }

  generateQueryArgs(args: any): string {
    if (args.type.kind === 'LIST') {
      return `$${args.name}: [${args.type.ofType.name}]`
    }
    else {
      return `$${args.name}: ${args.type.name}`
    }
  }

  generateEnum(type: any): string {
    return `enum ${type.name} {
            ${type.enumValues.map((item: any) => `\t${item.name}`).join('\n')}
            }`;
  }

  generateInputObject(type: any): string {
    return '';
  }

  generateObject(type: any): string {
    let properties: string[] = type.fields
      .filter((field: any) => {
        if (
          field.type.kind === 'SCALAR' ||
          (field.type.kind === 'NON_NULL' && field.type.ofType.kind === 'SCALAR') ||
          (field.type.kind === 'LIST' && field.type.ofType.kind === 'SCALAR')
        )
          return true;
        else
          return false;
      })
      .map((field: any) => {
        let type: string = '';
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

  graphQLType2Typescript(type: String): String {
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
        return 'any';
    }
  }

  async getGraphQlSchema(url: string): Promise<any> {
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
    const response: any = await Request({ method: 'POST', url: url, body: body, json: true });
    return response.data['__schema'];
  }

}
