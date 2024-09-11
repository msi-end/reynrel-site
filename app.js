const express = require('express');
const app = express();
const path = require('path');
const ejs = require('ejs');
const PORT = process.env.PORT || 3000;
const fs = require('node:fs');
const compression = require('compression');

app.use(compression({ level: 5 }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'static')))
app.set('views', __dirname + '/views')
app.set('view engine', ejs)


app.get('/', (req, res) => {
    console.log(path.join(__dirname, '/'));
    res.status(200).render(path.join(__dirname, '/views/index.ejs'))
});
app.get('/info', (req, res) => {
    res.status(200).render(path.join(__dirname, 'views/info.ejs'))
})

app.get('/about-us', (req, res) => {
    res.status(200).render(path.join(__dirname, 'views/pages/about-us.ejs'))
})
app.get('/services', (req, res) => {
    res.status(200).render(path.join(__dirname, 'views/pages/services.ejs'))
})
app.get('/contact-us', (req, res) => {
    res.status(200).render(path.join(__dirname, 'views/pages/contact-us.ejs'))
})

app.get('/blog/:blogName', (req, res) => {
    if (fs.existsSync(path.join(__dirname, `views/blog/${req.params.blogName}.html`))) {
        res.status(200).sendFile(path.join(__dirname, `views/blog/${req.params.blogName}.html`))
    } else {
        res.status(404).render(path.join(__dirname, `views/error.ejs`))
    }
})

app.post('/info', (req, res) => {
    function getIndianTime() {
        const current = new Date();
        const currentIST = new Date(current.getTime() + 5.5 * 60 * 60 * 1000);
        return currentIST.toISOString().replace('T', ' ').slice(0, 19);
    }
    const requestTime = getIndianTime();
    const clientIP = req.headers['x-forwarded-for'] || req.ip;
    const dataToSave = { ...req.body, requestTime: requestTime, clientIP: clientIP, };
    fs.appendFile('./leads-list.json', JSON.stringify(dataToSave), (err) => {
        if (err) console.error('Error:' + err)
    })
    res.status(200).send('success!')
})
app.post('/contact-us', (req, res) => {
    function getIndianTime() {
        const current = new Date();
        const currentIST = new Date(current.getTime() + 5.5 * 60 * 60 * 1000);
        return currentIST.toISOString().replace('T', ' ').slice(0, 19);
    }
    console.log(req.body);
    const requestTime = getIndianTime();
    const clientIP = req.headers['x-forwarded-for'] || req.ip;
    const dataToSave = { ...req.body, requestTime: requestTime, clientIP: clientIP, };
    fs.appendFile('./contacts-list.json', JSON.stringify(dataToSave), (err) => {
        if (err) console.error('Error:' + err)
    })
    res.status(200).send('success!')
})
app.get('/contacts', (req, res) => {
    res.status(200).sendFile(path.join(__dirname,'/contacts-list.json'))
});
app.get('/leads', (req, res) => {
    res.status(200).sendFile(path.join(__dirname,'/leads-list.json'))
});









app.get('*', (req, res) => {
    res.status(404).render(path.join(__dirname, `views/error.ejs`))
})
app.listen(PORT,
    () => {
        console.log(`working at port ${PORT}`);
    }
)