const path = require('path');
const express = require('express');
const session = require('express-session');
const { port, sessionSecret } = require('./src/config');
const authRouter = require('./src/routes/auth');
const servicesRouter = require('./src/routes/services');
const messagesRouter = require('./src/routes/messages');

const app = express();

app.use(express.json());
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 8 },
  })
);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRouter);
app.use('/api/services', servicesRouter);
app.use('/api/messages', messagesRouter);

app.get('/admin', (req, res) => {
  if (req.session.user?.role !== 'admin') return res.redirect('/login.html');
  res.sendFile(path.join(__dirname, 'private', 'admin.html'));
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
