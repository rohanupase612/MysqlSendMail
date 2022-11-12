var express = require("express");
// var bodyparser = require("body-parser");
let router = express.Router();
var jwt = require("jsonwebtoken");
const con = require("../connection");
var nodemailer = require("nodemailer");
// const dotenv = require("dotenv")
require("dotenv").config();

router.post("/signup", async (req, res) => {
  try {
    let user = req.body;
    var sql = "SELECT email, password, role, status FROM users WHERE email = ?"
    console.log(sql);
    con.query(sql, [user.email], (err, results) => {
      if (!err) {
        if (results.length <= 0) {
          sql = "INSERT INTO users(name, contact_number, email, password, status, role) VALUES(?, ?, ?, ?, 'false', 'user')"
          console.log(sql);
          con.query(sql, [user.name, user.contact_number, user.email, user.password], (err, results) => {
            if (!err) {
              return res.end(JSON.stringify({ message: "Succesfully Registered" }));
            }
            else {
              res.end(JSON.stringify({ status: "failed", data: err }));
            }
          })
        }
        else {
          return res.end(JSON.stringify({ message: "Email Already Exists" }));
        }
      }
      else {
        return res.end(JSON.stringify({ status: "failed", data: err }));
      }
    });
  }
  catch {
    return res.end(JSON.stringify({ status: "failed", data: "Something went wrong" }));
  }
});

router.post("/login", async (req, res) => {
  let user = req.body;
  var sql = "SELECT email, password, role, status from users where email= ?";
  con.query(sql, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0 || results[0].password != user.password) {
        return res.end(JSON.stringify({ status: "Incorrect Username or Password" }))
      }
      else if (results[0].status === 'false') {
        return res.end(JSON.stringify({ status: "Success", data: "Wait For Admin Approval" }))
      }
      else if (results[0].password == user.password) {
        // const JWT_SECRET = JWT_SECRET + user.password
        const secret = { email: results[0].email, role: results[0].role }
        const accesstoken = jwt.sign(secret, process.env.JWT_SECRET, { expiresIn: '15m' });
        return res.status(200).json({ token: accesstoken });
      }
    }
    else {
      return res.end(JSON.stringify({ status: "Failed", data: err }));
    }
  });
});

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth :{
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

router.post("/forgotPassword", async(req, res)=>{
  let user = req.body;
  sql = "SELECT email, password from users WHERE email= ?"
  con.query(sql, [user.email], (err, results)=>{
    if(!err){
        if(results.length <= 0){
          return res.end(JSON.stringify({status:"Password Sent Succesfully"}))
        }
        else{
          var mailOptions = {
            from: process.env.EMAIL,
            to: results[0].email,
            subject: "Password by cafe Management System",
            html: '<p><b>Your Login details for your management system</b> <br/><b>Email: <b/>'+results[0].email+' <br /> <b>Password:</b>'+results[0].password+'<br /><a href= "http://localhost:4200">Click here to login</a></p>'
          };
          transporter.sendMail(mailOptions, function(err, info){
              if(err){
                console.log(err);
              }
              else{
                console.log("Email Sent Succesfully"+info.response);
              }
          })
          return res.end(JSON.stringify({status:"Password Sent Succesfully"}))
        }
    }
    else{
      return res.end(JSON.stringify({status:"Failed", data:"Something Went Wrong"+err}))
    }
  });
});

module.exports = router;