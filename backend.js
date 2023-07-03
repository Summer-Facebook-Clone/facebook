import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import {User} from './modules/user.js';

dotenv.config();

const uri = `mongodb+srv://${process.env.mongodb_username}:${process.env.mongodb_password}@instagram-clone.gxdemf6.mongodb.net/Instagram-db?retryWrites=true&w=majority`;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) =>{
        console.log('Connected to MongoDB Atlas');
        app.listen(3000, () => {
            console.log('Server started');
        });
    })
    .catch((err) => console.error(err));

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));

const app = express();

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/add-user', (req, res) => {
    const user = new User({
        username: 'test',
        password: 'test',
        email: 'test@gmail.com'
    });
    user.save()
    .then((result) => {
        res.send(result);
    })
    .catch((err) => console.error(err));
});



