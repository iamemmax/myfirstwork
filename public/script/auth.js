// dom

const username = document.getElementById("username")
const email = document.getElementById("email")
const password = document.getElementById("password")
const confirm = document.getElementById("confirm")
const form = document.getElementById("form")
const submit = document.getElementById("submit")
const userError = document.getElementById("userError")
const userIcon = document.getElementById("userIcon")
const emailIcon = document.getElementById("emailIcon")
const emailError = document.getElementById("emailError")





username.addEventListener("keyup", (e)=>{
    if(username.value.length < 5 ){
        userError.style.transform = "scale(1)"
        userIcon.style.transform = "scale(0)"
    
    }
    else{
       userIcon.style.transform = "scale(1)"
        userError.style.transform = "scale(0)"

    }
    
    
    
})


email.addEventListener("keyup", (e)=>{
    
    if(email.value.length < 5 ){
         
        emailError.style.transform = "scale(1)"
        emailIcon.style.transform = "scale(0)"
    
    }
    else{
        emailIcon.style.transform = "scale(1)"
        emailError.style.transform = "scale(0)"

    }
    
})



