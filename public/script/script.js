const form1 = document.getElementById("form1")
const form2 = document.getElementById("form2")
const form3 = document.getElementById("form3")

const next1 = document.getElementById("next1")
const next2 = document.getElementById("next2")
const prev1 = document.getElementById("prev1")


next1.addEventListener("click", (e)=>{
    form1.style.marginLeft = "-400px"
})
prev1.addEventListener("click", (e)=>{
    form1.style.marginLeft = "5px"
})

next2.addEventListener("click", (e)=>{
    form2.style.marginLeft = "-400px"
})
prev2.addEventListener("click", (e)=>{
    form2.style.marginLeft = "5px"
})


// show login password
// const eye = document.getElementById("eye")
// eye.addEventListener("click", (e)=>{
    
// })




