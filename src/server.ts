import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import productRoutes from './handlers/products';
import userRoutes from './handlers/users';
import orderRoutes from './handlers/orders';

const app: express.Application = express();
const address = '0.0.0.0:3000';

app.use(bodyParser.json());

app.get('/', function (_req: Request, res: Response) {
  res.status(200);
  res.send('Hello to the API!');
});

productRoutes(app);
userRoutes(app);
orderRoutes(app);
app.get('*', function (_req: Request, res: Response) {
  res.status(404);
  res.send('Invalid Route.');
});
app.listen(3000, function () {
  console.log(`starting app on: ${address}`);
});

export default app;
