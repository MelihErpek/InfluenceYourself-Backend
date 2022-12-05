const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const app = express();
const auth = require("./Middleware/Auth");
const User = require("./Models/User");

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 100000000 }));
let port = process.env.PORT || 5000;
const url = "mongodb+srv://melihnode:meliherpek1@cluster0.g1oel.mongodb.net/Influence?&w=majority";

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
},
    (err) => { if (err) { throw err } console.log("Mongoose ile bağlantı kuruldu.") })

app.post("/Register", async (req, res) => {
    const { mail, username, password } = req.body;
    if (!mail || !username || !password) {
        res.status(400);
        res.json({ ErrorType: 'Field', ErrorMessage: 'Please enter a valid email, username, password' })
    }
    else {
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);
        const user = await User.findOne({ Email: mail })
        if (user) {
            const userName = await User.findOne({ Username: username })
            if (userName) {
                res.status(400);
                res.json([{ ErrorType: 'Email', ErrorMessage: 'Email already taken.' }, { ErrorType: 'Username', ErrorMessage: 'The username is already taken.' }])
            }
            else {
                res.status(400);
                res.json({ ErrorType: 'Email', ErrorMessage: 'Email already taken.' })
            }

        }
        else {
            const userName = await User.findOne({ Username: username })
            if (userName) {
                res.status(400);
                res.json({ ErrorType: 'Username', ErrorMessage: 'The username is already taken.' })
            }
            else {
                await User.create({
                    Email: mail,
                    Username: username,
                    Password: passwordHash
                })
                const user = await User.findOne({ Username: username });
                res.json({ success: true, id: user._id });
            }
        }
    }

})

app.post("/Login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400);
        res.json({ ErrorType: 'Field', ErrorMessage: 'All blanks must be filled.' })


    }
    else {
        const user = await User.findOne({ Username: username })
        if (user === null) {
            res.status(400);
            res.json({ ErrorType: 'Field', ErrorMessage: 'Please enter a valid username, password' })
        }
        else {

            const isMatch = await bcrypt.compare(password, user.Password);
            if (!isMatch) {
                res.status(400);
                res.json({ ErrorType: 'Field', ErrorMessage: 'Please enter a valid password' })
            }
            else {
                const token = jwt.sign({ id: user._id }, 'melih');
                res.json({ success: true, user: user, token: token });
            }
        }

    }

})

app.post("/RegisterLastStep", async (req, res) => {
    const { name, baseImage, birthDate, ID } = req.body;
    if (!name && !birthDate) {
        res.status(400);
        res.json({ ErrorType: 'Field', ErrorMessage: 'Please enter a valid name and birth date.' })
    }
    else if (!name) {
        res.status(400);
        res.json({ ErrorType: 'Name', ErrorMessage: 'Please enter a valid name.' })
    }
    else if (!birthDate) {
        res.status(400);
        res.json({ ErrorType: 'BirthDate', ErrorMessage: 'Please enter a valid birth date.' })
    }
    await User.findByIdAndUpdate(ID, {
        NameSurname: name,
        BirthDate: birthDate,
        ProfilePicture: baseImage
    });
    res.json({ success: "true" });
})

app.post("/LinksSave", async (req, res) => {
    const { color, buttonColor, ID, links } = req.body;
    /*
    $set:{

            "Links.$.Name":links[0].name,
            "Links.$.URL":links[0].link
            
        } 
    */
    await User.findByIdAndUpdate(ID, {
        BGColor: color,
        BGColorButton: buttonColor,
        $set: {
            Links: {
                Links: links
            }
        }
    });
    res.json({ success: "true" });
})

app.post("/Profile", async (req, res) => {
    const isim = req.body;
    console.log(isim);
    const user = await User.findOne({ Username: Object.values(isim).toString() });
    res.json({
        user: user
    })

});

app.post("/loggedIn", async (req, res) => {
    try {
        const token = req.header("x-auth-token");

        if (!token) return res.json(false);

        jwt.verify(token, "melih");

        res.send(true);
    } catch (err) {
        res.json(false);
    }
})

app.get("/log", auth, async (req, res) => {

    const user = await User.findById(req.user);
    res.json({ user: user })
});

app.listen(port);
