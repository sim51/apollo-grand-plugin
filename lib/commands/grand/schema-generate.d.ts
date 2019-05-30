import { Command, flags } from '@oclif/command';
export default class Neo4jGraphQlSchemaGenerator extends Command {
    static description: string;
    static flags: {
        url: flags.IOptionFlag<string | undefined>;
        login: flags.IOptionFlag<string | undefined>;
        password: flags.IOptionFlag<string | undefined>;
    };
    static args: {
        name: string;
        description: string;
    }[];
    run(): Promise<void>;
}
