const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const app = express();
const port = 3000;
app.set('view engine', 'ejs');
const fs = require('fs');
var mv = require('mv');
const { dir } = require("console");
const internal = require("stream");
const AdmZip = require("adm-zip");
const { useNative } = require("mkdirp");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//serving public file
app.use(express.static(__dirname));
app.use(cookieParser());
var session;

app.use(fileUpload());
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "4pYbfuN3smu21usIO2y2ngz7MVtnaQjpacCv1xiByMuWLMPQmcED90xVX3K5vzJ1TCMdvV9IRvtREEFeNbdMLcqCxoTl7OiL860hlV4YSdiQ05YSewZrEHWZCJeeVAo0",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));




  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  function generateString(length) {

      let result = '';
      const charactersLength = characters.length;
      for ( let i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }

        return result;
    }
      
  
  function checkgeneratetString(length){
    const randomstring = generateString(length)
    console.log("checking if " + randomstring + " exists!")
    const path = __dirname + "/files/" + randomstring + "/"
    if (fs.existsSync(path)) {
        return checkgeneratetString(length);
    }else{
        return randomstring
    }


  }  app.get("/", (req, res) => {
    const configjson = JSON.parse( fs.readFileSync(__dirname + "/config/config.json"))
    if(configjson.maintenance){
      res.sendFile(path.join(__dirname, "html/indexdisabeld.html"));

    }else{    res.sendFile(path.join(__dirname, "html/index.html"));
}
  });


  app.post("/upload", (req, res) => {
    const configjson = JSON.parse( fs.readFileSync(__dirname + "/config/config.json"))
    if(configjson.maintenance){
      return res.send("Maintenance :/ Try it later again");
    }else{
    console.log("Uploaded files:", req.files);
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("No files were uploaded.");
    }
    
    const randomstring = checkgeneratetString(5);
    const path = __dirname + "/files/" + randomstring + "/";
    
    // Check if req.files.datein is defined
    if (!req.files.datein) {
        return res.status(400).send("Uploaded file data is missing.");
    }
    
    const uploadedFiles = req.files.datein; // Array of uploaded files
    
    // Create the directory for the uploaded files
    fs.mkdirSync(path, { recursive: true });
    if(uploadedFiles.length >= 2){
      console.log("es sind mehrerre datein    ")
    }else{
      console.log("es ist eine datei")
    }
    
    // Loop through each uploaded file and move it
 if (uploadedFiles.length >= 2){
      console.log(uploadedFiles.length)
    uploadedFiles.forEach((file) => {
        const filePath = path + file.name;
        
        fs.writeFile(filePath, file.data, (err) => {
            if (err) {
                return res.status(500).send("Error while moving file.");
            }
        });
    });
    }else{
      req.files.datein.mv(path + req.files.datein.name)
      return res.status(200).send("<!DOCTYPE html><html><head><title>Page Title</title></head><body><a href=" + "http://192.168.178.99:3000/" + randomstring +"><h1>http://192.168.178.99:3000/Sads</h1></a><h2>Hier ist dein Downloadlink! Einfach draufklicken um zu kopieren!.</h2><style>@import url('https://fonts.googleapis.com/css2?family=ADLaM+Display&display=swap');body {  text-align: center;  font-family: 'ADLaM Display', cursive; }</style></body></html>")
      
    }


    return res.status(200).send("<!DOCTYPE html><html><head><title>Page Title</title></head><body><a href=" + "http://192.168.178.99:3000/" + randomstring +"><h1>http://192.168.178.99:3000/Sads</h1></a><h2>Hier ist dein Downloadlink! Einfach draufklicken um zu kopieren!.</h2><style>@import url('https://fonts.googleapis.com/css2?family=ADLaM+Display&display=swap');body {  text-align: center;  font-family: 'ADLaM Display', cursive; }</style></body></html>")
  }
  });


async function scandirectory(dir) {
    let arr1 = new Array;

    try {
        const directoryPath = path.join(__dirname, 'files', dir);
        fs.readdirSync(directoryPath).forEach(file => {
          arr1.push(file)
        });
        return arr1;

} catch(err){
  return;
}
}
 app.get("/upload", (req, res) => {
    res.sendFile(path.join(__dirname, "html/index.html"));
  });
  app.get("/login", (req, res) => {
    session=req.session;
    if(session.userid){
      res.redirect("/user")
    }else{
      res.sendFile(path.join(__dirname, "html/login.html"));
    }
    
  });
  app.get("/login/:user/:pass", (req, res) => {
    let buff = Buffer.from  (req.params.pass, 'base64');
let text = buff.toString('ascii');
const userpath = __dirname + "/users/" + req.params.user + ".json"
    if (fs.existsSync(userpath)) {
  const user = JSON.parse( fs.readFileSync(__dirname + "/users/" + req.params.user + ".json"))
    
    if(user.password == text){
      session=req.session;
      session.userid=req.params.user;
      console.log(session.userid + " hat sich angemeldet!")
      res.redirect("/user")
    }
  else{
      res.send('Invalid username or password');
  }


      }else{
        res.send("Wrong User or Password").status(403)

      }
  });
        app.get('/logout',(req,res) => {
        req.session.destroy();
        res.redirect('/');
    });
    app.get('/user',(req,res) => {
      const configjson = JSON.parse( fs.readFileSync(__dirname + "/config/config.json"))

      session=req.session;
      if(session.userid){
        res.send("<h1>Hello click <a href=" + "http://192.168.178.99:3000/logout" + "> here to logout </a></h1> <h3 style=" + "text-align:" + 'right;' + "><a href=" + "http://192.168.178.99:3000/change-password" + ">Click here to change your password</h3></a><h2>Maintenance: <a href=" + "http://192.168.178.99:3000/maintenance/toggle> " + configjson.maintenance + "</a>")
      }else{
        res.redirect("/login")
      }
  });
app.get("/change-password",function (req,res, next){
 session = req.session
 if(session.userid){
  res.sendFile(__dirname + "/html/changepass.html")
 }else{
  res.redirect("/login")
 }
})
app.get("/download/:id/:file",function (req, res, next) {

  const path = __dirname + "/files/" + req.params.id + "/" + req.params.file
  if (fs.existsSync(path)) {
    res.download(path)
  }else{
    res.status(404).send('Oh Shit 404 :C')
  }
  


});
app.get("/changepass/:oldpass/:newpass",function(req,res,next){
  session=req.session;
  if(session.userid){
    const userjson = JSON.parse( fs.readFileSync(__dirname + "/users/" + session.userid + ".json"))
    let buff = Buffer.from  (req.params.oldpass, 'base64');
    let userpass = buff.toString('ascii');
    let buff1 = Buffer.from  (req.params.newpass, 'base64');
    let usernewpass = buff1.toString('ascii');
    if(userjson.password ==  userpass){
        userjson.password = usernewpass;
        fs.writeFile(__dirname + "/users/"+ session.userid + ".json", JSON.stringify(userjson), err => {
          if (err) console.log("Error writing file:", err);
        });
        res.redirect("/changepass/success")
      }else{
      res.send("Wrong Old Password <a href=" + "http://192.168.178.99:3000/change-password/" + " > clicke here to try again </a>")
    }
  }else{
    res.redirect("/login")
}
})
app.get("/changepass/success", function(req,res,next){
 const session = req.session
  if(session.userid){
    req.session.destroy();
    res.send("Change your Password successfully! Logged your out! <a href=" + "http://192.168.178.99:3000/login" + "> Click here to login in again </a>")
  }else{
    res.redirect("/login")
  }
})
app.get("/maintenance/toggle",function(req,res,next){
  session=req.session;
  const maintenancejson = JSON.parse( fs.readFileSync(__dirname + "/config/config.json"))

  if(session.userid){
    if(maintenancejson.maintenance){
      res.redirect("/user")
      maintenancejson.maintenance = false;
      fs.writeFile(__dirname + "/config/config.json", JSON.stringify(maintenancejson), err => {
        if (err) console.log("Error writing file:", err);
      });
    }else{
      res.redirect("/user")
      maintenancejson.maintenance = true;
      fs.writeFile(__dirname + "/config/config.json", JSON.stringify(maintenancejson), err => {
        if (err) console.log("Error writing file:", err);
      });
    }
  }else{
    res.redirect("/login")
  }
})
  app.get("/Vectus/latest",function(req,res,next){
    res.download(__dirname + "/Vectus/Vectus.jar")
  })
  app.get("/dwnfolder/:folder",function(req,res,next){
  require('events').EventEmitter.defaultMaxListeners = 100;
  const zip = new AdmZip();
  const outputFile = "tmp/" + req.params.folder + ".zip";
  try {
    const directoryPath = path.join(__dirname, 'files', req.params.folder);
      zip.addLocalFolder(directoryPath)
    zip.writeZip(outputFile)
    res.download(outputFile)
}catch(err){
  console.log(err)
}
});
app.use( (req, res, next) => {
        arr1 = []
       const dir = req.path;
       try {
        const directoryPath = path.join(__dirname, 'files', dir);
        fs.readdirSync(directoryPath).forEach(file => {
          arr1.push(file)
        });

} catch(err){
  res.status(404).send('Oh Shit 404 :C')
}
 
    res.render('download.ejs', { files:  arr1,
                                 dwid: dir  })

  
  }) 

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })