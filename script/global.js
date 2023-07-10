document.addEventListener("DOMContentLoaded", function() {
    var signInForm = document.getElementById("signin-form");
    var signUpForm = document.getElementById("signup-form");
  
    signInForm.addEventListener("submit", function(event) {
        event.preventDefault();
        validateSignInForm();
    });
  
    signUpForm.addEventListener("submit", function(event) {
        event.preventDefault();
        validateSignUpForm();
    });
  
    function validateSignInForm() {
      var usermail = document.querySelector(".usermail").value;
      var password = document.querySelector(".password").value;
  
      if (usermail.trim() === "" || password.trim() === "") {
        alert("Please enter both username/email and password.");
      } else {
        window.location.href = "index.html";
      }
    }
  
    function validateSignUpForm() {
      var email = document.querySelector(".email").value;
      var name = ddocument.querySelector(".name").value;
      var username = document.querySelector(".username").value;
      var password = document.querySelector(".password").value;
  
      if (email.trim() === "" || name.trim() === "" || username.trim() === "" || password.trim() === "") {
        alert("Please fill in all the fields.");
      } else {
        window.location.href = "index.html";
      }
    }
  });
  