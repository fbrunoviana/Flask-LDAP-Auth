DOM = {
    passwForm: '.password-strength',
    passwErrorMsg: '.password-strength__error',
    passwInput: document.querySelector('.password-strength__input'),
    passwVisibilityBtn: '.password-strength__visibility',
    passwVisibility_icon: '.password-strength__visibility-icon',
    strengthBar: document.querySelector('.password-strength__bar'),
    submitBtn: document.querySelector('.password-strength__submit')
};

// Helper function to check for consecutive characters
// const hasConsecutiveChars = (str) => {
//     for (let i = 0; i < str.length - 1; i++) {
//         if (str.charCodeAt(i) + 1 === str.charCodeAt(i + 1)) {
//             return true;
//         }
//     }
//     return false;
// };

const testPassw = (passw) => {
    let strength = 'ruim';
    const minLength = /.{10,}/g;
    const upperCase = /[A-Z]/g;
    const lowerCase = /[a-z]/g;
    const digits = /\d/g;
    const nonAlphaNumeric = /[^a-zA-Z0-9]/;

    // if (hasConsecutiveChars(passw)) return strength;

    const testsPassed = [
        minLength.test(passw),
        upperCase.test(passw),
        lowerCase.test(passw),
        digits.test(passw),
        nonAlphaNumeric.test(passw)
    ].filter(Boolean).length;

    switch (testsPassed) {
        case 5:
            strength = 'excelente';
            break;
        case 4:
            strength = 'bom';
            break;
        case 3:
            strength = 'médio';
            break;
    }

    return strength;
};

const testPasswError = (passw) => {
    const errorSymbols = /\s/g;
    return testPasswRegexp(passw, errorSymbols);
};

const setStrengthBarValue = (bar, strength) => {
    let strengthValue;

    switch (strength) {
        case 'ruim':
            strengthValue = 25;
            break;
        case 'médio':
            strengthValue = 50;
            break;
        case 'bom':
            strengthValue = 75;
            break;
        case 'excelente':
            strengthValue = 100;
            break;
        default:
            strengthValue = 0;
    }

    bar.setAttribute('aria-valuenow', strengthValue);
    return strengthValue;
};

const setStrengthBarStyles = (bar, strengthValue) => {
    bar.style.width = `${strengthValue}%`;

    bar.classList.remove('bg-success', 'bg-info', 'bg-warning', 'bg-danger');

    switch (strengthValue) {
        case 25:
            bar.classList.add('bg-danger');
            bar.textContent = 'Senha Fraca';
            break;
        case 50:
            bar.classList.add('bg-warning');
            bar.textContent = 'Senha Médio';
            break;
        case 75:
            bar.classList.add('bg-info');
            bar.textContent = 'Senha Boa';
            break;
        case 100:
            bar.classList.add('bg-success');
            bar.textContent = 'Senha Excelente';
            break;
        default:
            bar.textContent = '';
            bar.style.width = `0`;
    }
};

const setStrengthBar = (bar, strength) => {
    const strengthValue = setStrengthBarValue(bar, strength);
    setStrengthBarStyles(bar, strengthValue);
};

const passwordStrength = (input, strengthBar) => {
    const passw = getPasswordVal(input);
    checkPasswordCriteria(passw);
    const error = testPasswError(passw);
    if (error) {
        showErrorMsg(input);
    } else {
        hideErrorMsg(input);
        const strength = testPassw(passw);
        setStrengthBar(strengthBar, strength);
        // btn.disabled = strength !== 'excelente';
    }
    
};

const passwordVisible = (passwField) => {
    const passwType = passwField.getAttribute('type');
    let visibilityStatus;

    if (passwType === 'text') {
        passwField.setAttribute('type', 'password');
        visibilityStatus = 'hidden';
    } else {
        passwField.setAttribute('type', 'text');
        visibilityStatus = 'visible';
    }

    return visibilityStatus;
};

const changeVisibiltyBtnIcon = (btn, status) => {
    const hiddenPasswIcon = btn.querySelector(`${DOM.passwVisibility_icon}[data-visible="hidden"]`);
    const visibilePasswIcon = btn.querySelector(`${DOM.passwVisibility_icon}[data-visible="visible"]`);

    if (status === 'visible') {
        visibilePasswIcon.classList.remove('js-hidden');
        hiddenPasswIcon.classList.add('js-hidden');
    } else {
        visibilePasswIcon.classList.add('js-hidden');
        hiddenPasswIcon.classList.remove('js-hidden');
    }
};

const passwVisibilitySwitcher = (passwField, visibilityToggler) => {
    const visibilityStatus = passwordVisible(passwField);
    changeVisibiltyBtnIcon(visibilityToggler, visibilityStatus);
};

// Função auxiliar para encontrar o nó pai com base na classe
const findParentNode = (elem, parentClass) => {
    parentClass = parentClass.slice(1, parentClass.length);
    while (elem) {  // Adicionando verificação aqui
        if (!elem.classList || !elem.classList.contains(parentClass)) {
            elem = elem.parentNode;
        } else {
            return elem;
        }
    }
    return null;  // Retorne null se o nó pai com a classe desejada não for encontrado
};

const checkPasswordCriteria = (password) => {
    // Selecionando os itens da lista pelo nome da classe
    const criteriaLength = document.querySelector('.criteria-length');
    const criteriaUppercase = document.querySelector('.criteria-uppercase');
    const criteriaLowercase = document.querySelector('.criteria-lowercase');
    const criteriaDigit = document.querySelector('.criteria-digit');
    const criteriaSpecial = document.querySelector('.criteria-special');
    // const criteriaNoConsecutive = document.querySelector('.criteria-no-consecutive');

    // Verificações
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    // const hasConsecutive = /(?:(.)\1)/.test(password);

    // Atualizando cores baseado nas verificações
    criteriaLength.style.color = password.length >= 10 ? 'green' : 'red';
    criteriaUppercase.style.color = hasUppercase ? 'green' : 'red';
    criteriaLowercase.style.color = hasLowercase ? 'green' : 'red';
    criteriaDigit.style.color = hasDigit ? 'green' : 'red';
    criteriaSpecial.style.color = hasSpecial ? 'green' : 'red';
    // criteriaNoConsecutive.style.color = !hasConsecutive ? 'green' : 'red';  // Note o '!' para verificar se não tem caracteres consecutivos
};


// Função auxiliar para obter o valor da senha
const getPasswordVal = input => {
    return input.value;
};

// Função auxiliar para testar a senha com uma expressão regular
const testPasswRegexp = (passw, regexp) => {
    return regexp.test(passw);
};

// Função para exibir a mensagem de erro
const showErrorMsg = input => {
    const errorMsg = findErrorMsg(input);
    if (errorMsg) {  // Adicione esta verificação
        errorMsg.classList.remove('js-hidden');
    }
    // errorMsg.classList.remove('js-hidden');
};

// Função para ocultar a mensagem de erro
const hideErrorMsg = input => {
    const errorMsg = findErrorMsg(input);
    if (errorMsg) {  // Adicione esta verificação
        errorMsg.classList.add('js-hidden');
    }
    // errorMsg.classList.add('js-hidden');
};

// Função auxiliar para encontrar a mensagem de erro
const findErrorMsg = input => {
    const passwForm = findParentNode(input, DOM.passwForm);
    if (passwForm) {
        return passwForm.querySelector(DOM.passwErrorMsg);
    }
    return null;  // Se passwForm for nulo, retorne nulo
};

// EVENT LISTENERS
DOM.passwInput.addEventListener('input', () => {
    passwordStrength(DOM.passwInput, DOM.strengthBar);
    
});

document.querySelector(DOM.passwVisibilityBtn).addEventListener('click', e => {
    let toggler = findParentNode(e.target, DOM.passwVisibilityBtn);
    passwVisibilitySwitcher(DOM.passwInput, toggler);
});

const checkPasswordMatch = () => {
    const password = DOM.passwInput.value;
    const confirmPassword = document.getElementById('confirm_password');
    const feedback = document.getElementById('passwordConfirmFeedback');

    if (confirmPassword.value !== password) {
        confirmPassword.classList.add('is-invalid');
        feedback.style.display = 'block';
    } else {
        confirmPassword.classList.remove('is-invalid');
        feedback.style.display = 'none';
    }
};

// Adicione um evento de input para o campo de confirmação de senha
const confirmPasswordElem = document.getElementById('confirm_password');
confirmPasswordElem.addEventListener('input', checkPasswordMatch);

const cleanCPFInput = () => {
    const cpfField = document.getElementById('cpf');
    // Remova tudo que não for dígito
    cpfField.value = cpfField.value.replace(/[^\d]/g, '');
};

// Adicione um evento de input para o campo CPF
const cpfElem = document.getElementById('cpf');
cpfElem.addEventListener('input', cleanCPFInput);


const cleanNomeInput = () => {
    const nomeField = document.getElementById('nome');

    nomeField.value = nomeField.value.replace(/[^a-zA-Z ]/g, '');
}
// Adicione um evento de input para o campo nome
const nomeElem = document.getElementById('nome');
nomeElem.addEventListener( 'input', cleanNomeInput);


const cleanSecurityAnswer = () => {
    const securityAnswer = document.getElementById('securityAnswer');
    securityAnswer.value = securityAnswer.value.replace(/[^a-zA-Z ]/g, '');
}

// document.getElementById('registerButton').addEventListener('click', function() {
//     var spinner = document.getElementById('loadingSpinner');
//     spinner.style.display = 'inline-block';
//     this.disabled = true;
// });

document.addEventListener("DOMContentLoaded", function() {
    var termosCheckbox = document.getElementById("termosCheckbox");
    var cadastrarButton = document.getElementById("cadastrarButton");

    if (termosCheckbox && cadastrarButton) {
        termosCheckbox.addEventListener("change", function() {
            cadastrarButton.disabled = !this.checked;
        });
    }



// Additional password validation code

// Supposing you already have variables for password and password confirmation
const passwordInput = DOM.passwInput; // or whatever you use for password
const confirmPasswordInput = document.getElementById("confirmPassword"); // or whatever you use for password confirmation
const errorMsg = document.querySelector(DOM.passwErrorMsg);

function validatePassword() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Check if passwords match
    if (password !== confirmPassword) {
        errorMsg.innerText = "Passwords do not match";
        DOM.submitBtn.disabled = true;
        return;
    }

    // Check password complexity
    if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
        errorMsg.innerText = "The password is weak";
        DOM.submitBtn.disabled = true;
        return;
    }

    // If everything is OK
    errorMsg.innerText = "";
    DOM.submitBtn.disabled = false;
}

// Add event listeners for validation
passwordInput.addEventListener("input", validatePassword);
confirmPasswordInput.addEventListener("input", validatePassword);


});
