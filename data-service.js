/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Andre Machado do Monte Student ID: 152848164 Date: Jul 15, 2018
*
*  Online (Heroku) Link:   https://murmuring-scrubland-77983.herokuapp.com
*
********************************************************************************/ 
const Sequelize = require ('sequelize');

//setando minhas credenciais
var sequelize = new Sequelize('d388loajfdu8o1', 'pwrioyvkzpfxdp', 'a90eb94bf80befae35a54a8b0d8f0a12adc925285fe38d3f3cf623b316efd3e0', {
    host: 'ec2-184-73-199-189.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: true
    }
});

//definindo como serão os tipos e as colunas da tabela Employee
var Employee = sequelize.define('Employee', {
    employeeNum: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING, 
    email: Sequelize.STRING,
    SSN: Sequelize.STRING, 
    addressStreet: Sequelize.STRING, 
    addressCity: Sequelize.STRING, 
    addressState: Sequelize.STRING, 
    addressPostal: Sequelize.STRING, 
    maritalStatus: Sequelize.STRING, 
    isManager: Sequelize.BOOLEAN, 
    employeeManagerNum: Sequelize.INTEGER, 
    status: Sequelize.STRING, 
    department: Sequelize.INTEGER, 
    hireDate: Sequelize.STRING
});

//definindo como serão os tipos e as colunas da tabela Department
var Department = sequelize.define('Department', {
    departmentId: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    departmentName: Sequelize.STRING
});

module.exports.initialize = function() {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function (Employee) {
            console.log('\nConnection has been established with employees!!');
            resolve();

        }).then(function (Department) {
            console.log("Connection has been stablished with department");
            resolve();

        }).catch(function (err) {
            reject("unable to sync the database");
        });
    });
};

module.exports.getAllEmployees = () => {
    return new Promise(function (resolve, reject) {
        Employee.findAll().then(function (data) {
            resolve(data);
        })
        .catch(function (err) {
            reject("no results returned");
        });
    });
};

//Modulo to get the employees that have Part Time or Fulltime status
module.exports.getEmployeesByStatus = (status) => {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {status: status}
        }).then(function (data) {
            resolve(data);
        })
        .catch(function(err) {
            reject("no results returned");
        })
    });
};

module.exports.getEmployeesByDepartment = (department) => {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {department: department}
        }).then(function(data) {
            resolve(data);
        })
        .catch(function(err) {
            reject("no results returned");
        })
    });
};

//module.exports exporta o resultado dessa função para o data-service.
module.exports.getEmployeesByManager = (manager) => {//manager entre parentesis é um argumento que é passado pelo site.
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {employeeManagerNum: manager}
        }).then(function(data) {
            resolve(data);
        })
        .catch(function(err) {
            reject("no results returned");
        })
    });
};

//Module to get the employees that have a specific number.
module.exports.getEmployeeByNum = (numero) => {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {employeeNum: numero}
        }).then(function(data) {
            resolve(data[0]);
        })
        .catch(function(err) {
            reject("no results returned");
        })
    });
};

module.exports.getDepartments = () => {
    return new Promise(function (resolve, reject) {
        Department.findAll().then(function (data) {
            resolve(data);
            console.log("%%%%%%%%%%%%%%%%%%" + data[0].departmentName);
        })
        .catch(function(err) {
            reject("no results returned");
            console.log("_-_-_-_-_-_-_-_-         ");
        })
    });
};

//Module that allows add more employees.
module.exports.addEmployee = (employeeData) => {
    employeeData.isManager = (employeeData.isManager) ? true : false;

    return new Promise(function (resolve, reject) {
        for(var prop in employeeData) {
            if(employeeData[prop] == "") {
                employeeData[prop] = null;
            }
        }
        Employee.create({
            employeeNum: employeeData.employeeNum,
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            maritalStatus: employeeData.maritalStatus,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            department: employeeData.department,
            hireDate: employeeData.hireDate
        }).then(function(data) {
            resolve(data);
        })
        .catch(function(err) {
            reject("unable to create employee");
        })
    });
};

module.exports.updateEmployee = (employeeData) => {
    employeeData.isManager = (employeeData.isManager) ? true : false;
    
    return new Promise(function (resolve, reject) {
        for(var prop in employeeData) {
            if(employeeData[prop] == "") {
                employeeData[prop] = null;
            }
        }
        Employee.update({
            employeeNum: employeeData.employeeNum,
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            maritalStatus: employeeData.maritalStatus,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            department: employeeData.department,
            hireDate: employeeData.hireDate },
            { where: {employeeNum: employeeData.employeeNum}
        }).then(function (data) {
                resolve(data);
            })
            .catch((err) => {
                reject("unable to update employee");
            });
    });
}

module.exports.deleteEmployeeByNum = (empNum) => {
    return new Promise(function(resolve, reject) {
        Employee.destroy({
            where: {employeeNum: empNum}
        }).then(function() {
            resolve();
        })
        .catch(function(err) {
            reject("Unable to delete employee");
        });
    });
} 

module.exports.addDepartment = (departmentData) => {
    console.log("heloo     "+ departmentData.departmentName);
    return new Promise(function(resolve, reject) {
        for(var prop in departmentData) {
            if(departmentData[prop] == "") {
                departmentData[prop] = "vazio";
            }
        }
    Department.create({
        departmentId: departmentData.departmentId,
        departmentName: departmentData.departmentName

    }).then(function() {
        
        resolve();
    })
    .catch(function(err) {
        reject("unable to create department");
    })
    })
}

module.exports.updateDepartment = (departmentData) => {
    return new Promise(function(resolve, reject) {
        for(var prop in departmentData) {
            if (departmentData[prop] == '') {
                departmentData[prop] = null;
            }
        }
    Department.update({
        departmentId: departmentData.departmentId,
        departmentName: departmentData.departmentName },
        { where: {departmentId: departmentData.departmentId}
    }).then(function(data) {
        resolve();
    })
    .catch(function(err) {
        reject("unable to update department");
    })
    })
}

module.exports.getDepartmentById = (id) => {
    return new Promise(function(resolve, reject) {
        Department.findAll({
            where: {departmentId: id}
        }).then(function(data) {
            resolve(data[0]);
        })
        .catch(function(err) {
            reject("no results returned");
        })
    })
}

//module.exports.getManagers = () => {
  //  return new Promise(function (resolve, reject) {
        
    //    resolve();
      //  reject();
   // });
//};