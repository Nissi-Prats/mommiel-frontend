window.addEventListener("scroll",()=>{

const navbar=document.querySelector(".navbar");

if(window.scrollY > 50){
navbar.classList.add("active");
}
else{
navbar.classList.remove("active");
}

});

const menuBtn=document.querySelector(".menu-btn");
const navLinks=document.querySelector(".nav-links");

menuBtn.addEventListener("click",()=>{

if(navLinks.style.display==="flex"){
navLinks.style.display="none";
}else{
navLinks.style.display="flex";
}

});