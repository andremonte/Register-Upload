/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Andre Machado do Monte Student ID: 152848164 Date: Ago 01, 2018
*
*  Online (Heroku) Link:   https://murmuring-scrubland-77983.herokuapp.com
*
********************************************************************************/  
// existe uma biblioteca chamada -->var bcrypt = require('bcrypt');
// bcrypt.genSalt(10, function(eer, salt) {
//  bcrypt.hash('s1a2m3s4u5n6g7', salt, function(err, hash) {
// console.log(hash); 
// h_hash = hash
// console.log(h_hash);
// });
// });

// console.log(h_hash);

// bcrypt.compare('s1a2m3s4u5n6g7', hash).then((res) => {
// console.log("Authenticated");
// });

var express = require("express");
var app = express();
var path = require("path");
var dataService = require ("./data-service.js");
var dataServiceAuth = require ("./data-service-auth.js");
const clientSessions = require("client-sessions");
const multer = require ("multer");
const fs = require("fs");
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(clientSessions({
  cookieName: "session", // this is the object name that will be added to 'req'
  secret: "assignment_6", // this should be a long un-guessable string.
  duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
  activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}))




app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});


let ensureLogin = function(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
};


app.engine('.hbs', exphbs({
  extname: '.hbs', 
  defaultLayout: 'main',
  helpers: {
  navLink: function(url, options){
    return '<li' + 
        ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
        '><a href="' + url + '">' + options.fn(this) + '</a></li>';
    },
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
          return options.inverse(this);
      } else {
          return options.fn(this);
      }
  }
  
  }
}));

app.set('view engine', '.hbs');

app.use(function(req,res,next){
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
  next();
});


const storage = multer.diskStorage({
  destination: "./public/images/uploaded/",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

//Diz ao multer para usar o file name como o padrao setado acima date.now(), + pathextname(arquivo.ext).
//No lugar de salvar os arquivos como nomes default (sem extensao).
const upload = multer ({storage: storage});


app.get("/login", (req, res) => {
  res.render("login.hbs");
});

app.get("/register", (req, res) => {
  res.render("register.hbs");
});

app.get("/logout", (req, res) =>{
  req.session.reset();
  res.redirect("/");
})

app.post("/register", (req, res) => {
  //tentativas
  //user
  //users
  //userName
  dataServiceAuth.registerUser(req.body)
  .then(() => {
    res.render('register', {successMessage: "User Created"})
  }).catch((err) => {
    res.render('register', {errorMessage: err, userName: req.body.userName});
  });
})

app.post("/login", (req, res) =>{
  req.body.userAgent = req.get('User-Agent');
  dataServiceAuth.checkUser(req.body)
  .then((user) => {
      req.session.user = {
        userName: user.userName,//authenticated user's userName
        email: user.email,// authenticated user's email
        loginHistory: user.loginHistory// authenticated user's loginHistory
      }
      res.redirect("employees");
  }).catch((err)=>{
      res.render("login", {errorMessage: err, userName: req.body.userName})
  })
})

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory");
})

//cria um pasta static para salvar as fotos e poder acessa-las.
app.use(express.static("./public/"));

//send to the user the list of images uploaded.
app.get("/images", ensureLogin, (req, res) => {
  fs.readdir("./public/images/uploaded", function (err, itens) {
    res.render("images", {imagem:itens})
    //res.json({images: itens});
  })
})

 //This route simply sends the file "/views/addImage.html
 app.get("/images/add", ensureLogin, (req, res) => {
  res.render("addImage.hbs");
});

//setup a 'route' para postar a foto (to post the pic);
app.post("/images/add", ensureLogin, upload.single("imageFile"), (req, res) => {
  console.log(req.file);//display information about the pict uploaded.
    res.redirect('/images');//redirect to this directory.
  })


var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res){
  res.render("home.hbs");
});


app.get("/home", function(req,res){
  res.render("home.hbs");
});

// setup another route to listen on /about
app.get("/about", function(req,res){
  res.render("about.hbs");
});

// setup Employees route to liste on /employees
app.get("/employees", ensureLogin, function(req,res) {
    if(req.query.status) {
      dataService.getEmployeesByStatus(req.query.status).then ((data) => {
        if(data.length > 0 ) {
          res.render("employees", {employees:data});
        }
        else {res.render("employees", {message: "no results"});
        }
      })
      .catch ((err) => { 
        res.render({message: "no results"});
    })
  }
    else if (req.query.department) {
      dataService.getEmployeesByDepartment(req.query.department).then ((data) => {
        if(data.length > 0 ) {
          res.render("employees", {employees:data});
        }
        else {res.render("employees", {message: "no results"});
        }
      })
      .catch ((err) => { 
        res.render({message: "no results"});
      })
    }
    else if (req.query.manager) {
      dataService.getEmployeesByManager(req.query.manager).then ((data) => {
        if(data.length > 0 ) {
          res.render("employees", {employees:data});
        }
        else {res.render("employees", {message: "no results"});
        }
      })
      .catch ((err) => { 
        res.render({message: "no results"});
      })
    }
    else {
      dataService.getAllEmployees().then(function(data) {
        if(data.length > 0 ) {
          res.render("employees", {employees:data});
        }
        else {res.render("employees", {message: "no results"});
        }
      })
      .catch(function(err) {
        res.render({message: "no results"});
      })
    }
});

//This route simply sends the file "/views/addEmployee.html "
app.get("/employees/add", ensureLogin, (req, res) => {
  dataService.getDepartments().then((data) => {
    res.render("addEmployee", { departments: data });
}).catch((err) => {
    res.render("addEmployee", { departments: [] });
    console.log(err);
});
});

//add post method employees
app.post("/employees/add", ensureLogin, (req, res) => {
  console.log(req.body);
  dataService.addEmployee(req.body).then(() => {
    res.redirect('/employees');
  }).catch((err)=>{
      res.status(500).send("Unable to Update Employee");
});

  });
//Problema ta aqui
  app.post("/employee/update", ensureLogin, (req, res) => {
    console.log(req.body);
    dataService.updateEmployee(req.body).then(() => {
    res.redirect("/employees");
    }).catch((err) => {
      res.status(500).send("unable to update employee");
    });
  });

    app.get("/employee/:empNum", ensureLogin, (req, res) => {

      // initialize an empty object to store the values
      let viewData = {};
  
      dataService.getEmployeeByNum(req.params.empNum).then((data) => {
          if (data) {
              viewData.employee = data; //store employee data in the "viewData" object as "employee"
          } else {
              viewData.employee = null; // set employee to null if none were returned
          }
      }).catch(() => {
          viewData.employee = null; // set employee to null if there was an error 
      }).then(dataService.getDepartments)
      .then((data) => {
          viewData.departments = data; // store department data in the "viewData" object as "departments"
  
          // loop through viewData.departments and once we have found the departmentId that matches
          // the employee's "department" value, add a "selected" property to the matching 
          // viewData.departments object
  
          for (let i = 0; i < viewData.departments.length; i++) {
              if (viewData.departments[i].departmentId == viewData.employee.department) {
                  viewData.departments[i].selected = true;
              }
          }
  
      }).catch(() => {
          viewData.departments = []; // set departments to empty if there was an error
      }).then(() => {
          if (viewData.employee == null) { // if no employee - return an error
              res.status(404).send("Employee Not Found");
          } else {
              res.render("employee", { viewData: viewData }); // render the "employee" view
          }
      });
  });

app.get("/employees/delete/:empNum", ensureLogin, function (req, res) {
  dataService.deleteEmployeeByNum(req.params.empNum).then(() => {
    res.redirect('/employees');
  }).catch((err) => {
    res.status(500).send("Unable to Remove Employee / Employee not found");
  });
});

// Se o Usuário requisitar a página /departments
app.get("/departments", ensureLogin, function(req,res){
  dataService.getDepartments().then(function(data) {
    if(data.length > 0 ) {
      res.render("departments", {departments: data});
    }
    else {res.render("departments", {message: "no results"});
    }
  }).catch(function(err) {
    res.json({message: err});
  });
});

app.get("/departments/add", ensureLogin, function(req, res) {
  res.render("addDepartment");
});

//Servidor envia de volta para o usuário (na página)
app.post("/departments/add", ensureLogin, (req, res) => {
  console.log("Hi............"+ req.body.departmentName);
  dataService.addDepartment(req.body)
  .then(() => {
    res.redirect('/departments');
  }).catch((err)=>{
    res.status(500).send("Unable to Update Employee");
});
});


app.post("/department/update", ensureLogin, (req, res) => {
  console.log(req.body);
  dataService.updateDepartment(req.body).then(() => {
    res.redirect('/departments');
  }).catch((err) => {
    res.status(500).send("unable to update employee");
  });
    });


    app.get("/department/:departmentId", ensureLogin, (req, res) => {
      
      // initialize an empty object to store the values
      let viewData = {};
      
      dataService.getDepartmentById(req.params.departmentId).then((data) => {
          if (data) {
              viewData.employee = data; //store employee data in the "viewData" object as "employee"
          } else {
              viewData.employee = null; // set employee to null if none were returned
          }
      }).catch(() => {
          viewData.employee = null; // set employee to null if there was an error 
      }).then(dataService.getDepartments)
      .then((data) => {
          viewData.departments = data; // store department data in the "viewData" object as "departments"
  
          // loop through viewData.departments and once we have found the departmentId that matches
          // the employee's "department" value, add a "selected" property to the matching 
          // viewData.departments object
  
          for (let i = 0; i < viewData.departments.length; i++) {
              if (viewData.departments[i].departmentId == viewData.employee.department) {
                  viewData.departments[i].selected = true;
              }
          }
  
      }).catch(() => {
          viewData.departments = []; // set departments to empty if there was an error
      }).then(() => {
          if (viewData.employee == null) { // if no employee - return an error
              res.status(404).send("Department Not Found");
          } else {
              res.render("department", { viewData: viewData }); // render the "employee" view
          }
      });
  });

//Setting the 404 error page. If user type/click the wrong page will display:
  app.use((req, res) => {
    res.status(404).send("*!ERROR 404!! Page Not Found!* \n");
  });

/*dataService.initialize() .then(function() {
// setup http server to listen on HTTP_PORT 
  app.listen(HTTP_PORT, onHttpStart);

}).catch(function(err) {
  console.log("Sorry the page is out of service");
});*/
dataService.initialize()
.then(dataServiceAuth.initialize)
.then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});
