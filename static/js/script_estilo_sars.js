const passwordInput = document.getElementById('password');
const passwordCriteria = document.getElementById('passwordCriteria');
const registerButton = document.querySelector('button[type="submit"]');
const cpf = document.getElementById('cpf');
const nome = document.getElementById('nome');


passwordInput.addEventListener('input', function() {
    const password = this.value;

    // Limpar critérios anteriores
    passwordCriteria.innerHTML = '';

    // Verificações
    checkCriteria(password, `Não conter o nome ou matrícula da conta`, !password.includes(nome) && !password.includes(cpf));
    checkCriteria(password, `Não conter mais de dois caracteres consecutivos de partes do nome completo ou matrícula do usuário`, !hasConsecutiveChars(password, nome, 2) && !hasConsecutiveChars(password, cpf, 2));
    checkCriteria(password, `Ter pelo menos 10 (dez) caracteres`, password.length >= 10);
    checkCriteria(password, `Conter caracteres maiúsculos (A-Z)`, /[A-Z]/.test(password));
    checkCriteria(password, `Conter caracteres minúsculos (a-z)`, /[a-z]/.test(password));
    checkCriteria(password, `Conter dígitos de base 10 (0 a 9)`, /[0-9]/.test(password));
    checkCriteria(password, `Conter caracteres não alfabéticos (ex: !, $, #, %)`, /[^a-zA-Z0-9]/.test(password));

    // Check if all criteria are met
    const allCriteriaMet = Array.from(passwordCriteria.children).every(li => li.textContent.startsWith('✅'));
    // Disable or enable the register button based on the criteria
    registerButton.disabled = !allCriteriaMet;

});

function checkCriteria(password, criteriaText, isValid) {
    const li = document.createElement('li');
    li.textContent = `${isValid ? '✅' : '❌'} ${criteriaText}`;
    passwordCriteria.appendChild(li);
}

function hasConsecutiveChars(str, target, count) {
    for (let i = 0; i <= target.length - count; i++) {
        const segment = target.substring(i, i + count);
        if (str.includes(segment)) {
            return true;
        }
    }
    return false;
}