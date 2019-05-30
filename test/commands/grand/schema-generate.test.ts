import { expect, test } from '@oclif/test'

describe('Schema Generator on Movie Graph', () => {
  test
    .stdout()
    .command(['grand:schema-generate', '-u', 'bolt://localhost:7687', '-l', 'neo4j', '-p', 'admin'])
    .it('runs', ctx => {
      expect(ctx.stdout).to.contain('type Movie { \n\ttitle:String\n\ttagline:String\n\treleased:Int\n\treverse_directed: [Person] @relation(name: "DIRECTED", direction: "IN") \n\treverse_acted_in: [Person] @relation(name: "ACTED_IN", direction: "IN") \n\treverse_reviewed: [Person] @relation(name: "REVIEWED", direction: "IN") \n\treverse_wrote: [Person] @relation(name: "WROTE", direction: "IN") \n\treverse_produced: [Person] @relation(name: "PRODUCED", direction: "IN") \n}\n\ntype Person { \n\tname:String\n\tborn:Int\n\tdirected: [Movie] @relation(name: "DIRECTED", direction: "OUT") \n\tacted_in: [Movie] @relation(name: "ACTED_IN", direction: "OUT") \n\treviewed: [Movie] @relation(name: "REVIEWED", direction: "OUT") \n\twrote: [Movie] @relation(name: "WROTE", direction: "OUT") \n\tproduced: [Movie] @relation(name: "PRODUCED", direction: "OUT") \n\tfollows: [Person] @relation(name: "FOLLOWS", direction: "OUT") \n}')
    })
})
