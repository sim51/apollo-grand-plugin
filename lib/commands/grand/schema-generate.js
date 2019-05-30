"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const neo4j = require("neo4j-driver");
const command_1 = require("@oclif/command");
class Neo4jGraphQlSchemaGenerator extends command_1.Command {
    async run() {
        const { args, flags } = this.parse(Neo4jGraphQlSchemaGenerator);
        // Retrieve Neo4j schema with APOC
        const client = neo4j.v1.driver(flags.url ? flags.url : 'bolt://localhost', neo4j.v1.auth.basic(flags.login ? flags.login : 'neo4j', flags.password ? flags.password : ''));
        const session = client.session();
        let result = [];
        try {
            const resultSet = await session.run("CALL apoc.meta.schema()");
            resultSet.records.forEach((record) => {
                let item = {};
                record.forEach((value, key) => {
                    item[key] = value;
                });
                result.push(item);
            });
        }
        finally {
            session.close();
        }
        const neo4jSchema = result[0].value;
        // Construct the GraphQl schema
        let schema = '';
        Object.keys(neo4jSchema).forEach((itemName) => {
            const item = neo4jSchema[itemName];
            if (item.type === 'node') {
                schema += `type ${itemName} { \n`;
                // Generate the properties
                Object.keys(item.properties).map((propName) => {
                    let property = item.properties[propName];
                    schema += `\t${propName}:`;
                    if (property.unique) {
                        schema += `ID! \n`;
                    }
                    else {
                        if (property.array) {
                            schema += '[';
                        }
                        switch (property.type) {
                            case 'STRING':
                                schema += 'String';
                                break;
                            case 'INTEGER':
                                schema += 'Int';
                                break;
                            case 'BOOLEAN':
                                schema += 'Boolean';
                                break;
                            case 'FLOAT':
                                schema += 'Float';
                                break;
                        }
                        if (property.array) {
                            schema += ']';
                        }
                        if (property.existance) {
                            schema += '!';
                        }
                        schema += '\n';
                    }
                });
                // Generate the relationships
                Object.keys(item.relationships).map((relName) => {
                    let relationship = item.relationships[relName];
                    if (relationship.direction === 'in') {
                        schema += `\treverse_${relName.toLowerCase()}: [${relationship.labels[0]}] @relation(name: "${relName}", direction: "IN") \n`;
                    }
                    else {
                        schema += `\t${relName.toLowerCase()}: [${relationship.labels[0]}] @relation(name: "${relName}", direction: "OUT") \n`;
                    }
                });
                schema += `}\n\n`;
            }
        });
        this.log(schema);
    }
}
Neo4jGraphQlSchemaGenerator.description = 'Generate the GraphQl schema of Neo4j Database for the GRAND stack';
Neo4jGraphQlSchemaGenerator.flags = {
    url: command_1.flags.string({ char: 'u', description: 'Neo4j bolt url', default: 'bolt://localhost:7687' }),
    login: command_1.flags.string({ char: 'l', description: 'Neo4j user', env: 'NEO4J_LOGIN', default: 'neo4j' }),
    password: command_1.flags.string({ char: 'p', description: 'Neo4j password', env: 'NEO4J_PASSWORD' }),
};
Neo4jGraphQlSchemaGenerator.args = [
    { name: 'path', description: 'location where to write the schema file' },
];
exports.default = Neo4jGraphQlSchemaGenerator;
