import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';

const PORT = 3333;
const app = express();

const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

const root = { 
  hello: () => {
    return 'This is a Hello World! from a GraphQL API';
  }
};

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

app.listen(PORT, () => console.log(`[SERVER] - Server running on http://localhost:${PORT}/graphql`));
