import { Command, flags } from '@oclif/command';
export default class GraphQlTypescriptGenerator extends Command {
    static description: string;
    static flags: {
        url: flags.IOptionFlag<string | undefined>;
    };
    static args: {
        name: string;
        description: string;
    }[];
    run(): Promise<void>;
    generateQuery(query: any): string;
    generateMutation(query: any): string;
    generateQueryArgs(args: any): string;
    generateEnum(type: any): string;
    generateInputObject(type: any): string;
    generateObject(type: any): string;
    graphQLType2Typescript(type: String): String;
    getGraphQlSchema(url: string): Promise<any>;
}
