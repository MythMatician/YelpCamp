console.log('Connected');

AOS.init();

// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.validate-form');
  
    // Loop over them and prevent submission
    Array.from(forms)
      .forEach((form) => {
        form.addEventListener('submit', (e) => {
          if (!form.checkValidity()) {
            e.preventDefault()
            e.stopPropagation()
          }
  
          form.classList.add('was-validated');
        }, false)
      })
  })()


