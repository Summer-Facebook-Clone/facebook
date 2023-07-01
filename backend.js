import express from 'express';
import bodyParser from 'body-parser';
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello Worldd!');
});

app.listen(3000, () => {
    console.log('server started');
    }
);
