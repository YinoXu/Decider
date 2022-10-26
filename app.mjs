import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import './db.mjs';
import session from 'express-session';
import bodyParser from 'body-parser';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// enable sessions
const sessionOptions = {
    secret: 'secret cookie thang (store this elsewhere!)',
    resave: true,
      saveUninitialized: true
};
app.use(session(sessionOptions));

// app.mjs
const directory = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(directory, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// body parser setup
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(process.env.PORT || 3000);