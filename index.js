const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const dotenv = require("dotenv");
dotenv.config();

const admin = require("firebase-admin");
const credentials = require("./key");
const jsonCredentials = JSON.parse(JSON.stringify(credentials));

// console.log(jsonCredentials);
admin.initializeApp({
  credential: admin.credential.cert(jsonCredentials),
});

const db = admin.firestore();

app.post("/create", async (req, res) => {
  try {
    const id = req.body.email;
    const userJson = {
      email: req.body.email,
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      age: req.body.age,
      country: req.body.country,
      university: req.body.university,
      year_of_grad: req.body.yearOfGrad,
      id: req.body.id,
    };
    const response = await db.collection("users").doc(id).set(userJson);
    // const response = await db.collection("users").add(userJson);
    res.send(response);
  } catch (err) {
    res.send(err);
  }
  // console.log("Data of users: ", req.body);
});

app.post("/create/many", async (req, res) => {
  try {
    const batch = db.batch();

    const array = req.body;

    array.forEach(async (doc) => {
      const id = doc.email;

      batch.set(db.collection("users").doc(id), doc);
      //   console.log(doc);
      //   console.log(id);
    });

    // const response = await db.collection("users").add(userJson);
    // res.send(response);
    batch
      .commit()
      .then(() => {
        console.log("Data sended successfully!");
      })
      .catch((err) => {
        console.log(err);
      });
    res.send(array);
  } catch (err) {
    res.send(err);
  }
  //   console.log("Data of users: ", req.body);
});

app.get("/read/all", async (req, res) => {
  try {
    const usersRef = db.collection("users");
    const response = await usersRef.get();
    let responseArr = [];

    // console.log(response);
    response.forEach((doc) => {
      responseArr.push(doc.data());
    });
    // console.log(responseArr);
    res.send(responseArr);
  } catch (err) {
    res.send(err);
  }
});

app.get("/search/:id", async (req, res) => {
  try {
    const userRef = db.collection("users").doc(req.params.id);
    const response = await userRef.get();

    res.send(response.data());
  } catch (err) {
    res.send(err);
  }
});

app.post("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const newFirstName = "hello world!";
    const userRef = await db.collection("users").doc(id).update({
      firstName: newFirstName,
    });
    // console.log(userRef);
    res.send(userRef);
  } catch (err) {
    res.send(err);
  }
});

app.delete("/delete/:id", async (req, res) => {
  try {
    const response = await db.collection("users").doc(req.params.id).delete();
    res.send(response);
  } catch (err) {
    res.send(err);
  }
});

app.get("/", (req, res) => {
  res.send("Hey!");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is  running on port ${PORT}`));
