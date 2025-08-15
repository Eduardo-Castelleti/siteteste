document.getElementById("logoutBtn").addEventListener("click", () => {
    // Aqui futuramente podemos usar Firebase Auth para logout
    alert("Você saiu do sistema!");
    window.location.href = "/inicio/index.html";
});
