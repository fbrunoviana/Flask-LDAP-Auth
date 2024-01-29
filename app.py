from flask import Flask, request, redirect, render_template, url_for, flash, jsonify
from ldap3 import Server, Connection, MODIFY_REPLACE, SIMPLE 
from validate_docbr import CPF
import logging


OBJECT_CLASS = ['top', 'person', 'organizationalPerson', 'user']
LDAP_HOST = '192.168.0.1' # IP do seu AD
LDAP_USER = 'CN=LDAP ACCOUNT,OU=Sistema,OU=Servico,DC=domain,DC=dot,DC=local' # Usuario de acesso
LDAP_PASSWORD = 'SenhaSupers3cr3tDoSeuUsuario' # mude a senha
LDAP_BASE_DN = 'OU=Usuarios,OU=Comuns,DC=domain,DC=dot,DC=local' # DN da sua OU
search_filter = "(displayName={0}*)"
grupoProbibeLogin = 'grupoProbibeLogin' # Grupo que proibe o login, ou pode ser um grupo para outro proposito

app = Flask(__name__)
app.secret_key = '389838jdhjs26721jkhsdk'
logging.basicConfig(filename='app.log', level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


@app.route('/sucesso', methods=['GET', 'POST'])
def sucesso():
    return render_template('success.html')


@app.route('/redirect')
def redirect():
    return redirect('https://google.com')

@app.route('/', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        cpf = request.form['username']        
        surname = request.form['name']
        new_password = request.form['password']
        
        # A confirmacao é feita no front mas por precaucao, fiz no back tbm...
        confirm_password = request.form.get('confirm_password')
    
        securityQuestion = request.form['securityQuestion']
        securityAnswer = request.form['securityAnswer']

        if new_password != confirm_password:
            flash(f'Senha e Confirmar Senha não coincidem', 'error')
            logging.error(f'CPF: {cpf} - Senha e Confirmar Senha não coincidem')
            return render_template('register.html', cpf_invalid=True) # criar um modal só para senha
        logging.debug(f'CPF: {cpf} - Senha e Confirmar Senha coincidem')
        # Configurações do servidor LDAP
        with ldap_connection() as c:
            attributes = get_attributes(cpf, surname)
            user_dn = get_dn(cpf)

            # Check if the CPF is already registered in LDAP
            c.search(user_dn, '(objectClass=person)', attributes=['description'])
            if c.entries:
                flash(f'CPF {cpf} já cadastrado!', 'error')
                logging.error(f'CPF: {cpf} já cadastrado!')
                return render_template('register.html', cpf_invalid=True)
            logging.info(f'CPF: {cpf} - Criando usuario')

            try: 
                cpf_is_valid = validar_cpf(cpf)
                if not cpf_is_valid:
                    flash(f'CPF {cpf} não é válido!', 'error')
                    logging.error(f'CPF: {cpf} não é válido!')
                    raise Exception(f"CPF {cpf} is invalid")
                else: 
                    logging.info(f'CPF: {cpf} - CPF válido')

            except Exception as e:
                return render_template('register.html', cpf_invalid=True)
            
            # Block for create user
            try:
                result = c.add(dn=user_dn, object_class=OBJECT_CLASS, attributes=attributes)
                if not result:
                    logging.error(f'ERROR: User {cpf} was not created #00001')
                    raise Exception(f"ERROR: User '{cpf}' was not created: {c.result.get('description')}")
                logging.info(f'User {cpf} created successfully')
            except Exception as e:

                logging.error(f"Exception while creating user {cpf}: {str(e)}")
                # return
            # Block for unlock account
            try:
                c.extend.microsoft.unlock_account(user=user_dn)
                logging.info(f"User {cpf} unlocked successfully")
            except Exception as e:
                # Não deve ficar transparente para o usuario adicionar no log
                logging.error(f"Exception while unlocking user {cpf}: {str(e)}")
                # return

            # Block for set a password
            try:
                c.extend.microsoft.modify_password(user=user_dn, new_password=new_password, old_password=None)
                logging.info(f"Senha atribuida ao usuario: {cpf} ")
            except Exception as e:
                logging.error(f"Erro inesperado ao atribuir a senha {cpf}: {str(e)} Error code: #xxxx")
                # return

            # Block for enable account
            enable_account = {"userAccountControl": (MODIFY_REPLACE, [512])}
            try:
                c.modify(user_dn, changes=enable_account)
                logging.info(f"Usuario {cpf} ativado com sucesso")
            except Exception as e:
                logging.error(f"Error inesperado enquanto habilitava a conta {cpf}: {str(e)}")
                # return
            # Parei aqui 
            
            # Add user to group
            try:    
                c.extend.microsoft.add_members_to_groups([user_dn], 'CN=grupoProbibeLogin,DC=domain,DC=dot,DC=local')
                logging.info(f"Membro {cpf} adicionando no grupo grupoProbibeLogin")
            except Exception as e:
                flash(f"Erro inesperado ao adicionar o usuario {cpf}")
                logging.error(f"Error inesperado ao adicionar o usuario {cpf} ao grupo: {str(e)}")
        
            
            # Add question security
            description = securityQuestion + ';' + securityAnswer
            try:
                c.modify(user_dn, {'description': [(MODIFY_REPLACE, [description])]})
                logging.info(f"Security Question for user {cpf} set successfully") 
            except:
                logging.error(f"Is not possible set security question for user {cpf}: {str(e)}")
                # return
        logging.info(f"User {cpf} criado e configurado com sucesso")
        return render_template('success.html')
    return render_template('register.html')

def ldap_connection(LDAP_USER=LDAP_USER, LDAP_PASSWORD=LDAP_PASSWORD):

    server = ldap_server()

    
    return Connection(server, user=LDAP_USER,
                        password=LDAP_PASSWORD,
                        auto_bind=True,
                        )


def ldap_server():
    return Server(LDAP_HOST, use_ssl=True)


def get_dn(cpf):
    return "CN={0},{1}".format(cpf, LDAP_BASE_DN)


def get_attributes(cpf, surname):
    return {
        "displayName": cpf,
        "sAMAccountName": cpf,
        "userPrincipalName": cpf,
        "name": cpf,
        "sn": surname,
        'pwdLastSet': -1
    }

def get_groups(nomeDoGrupo):
    postfix = ',OU=usuarios,DC=domain,DC=dot,DC=local'
    return [
         ('CN=%s%s' % (nomeDoGrupo,postfix))
    ]

def validar_cpf(cpf):
    cpf_para_validar = cpf[:3] + '.' + cpf[3:6] + '.' + cpf[6:9] + '-' + cpf[9:]
    return CPF().validate(cpf_para_validar)


@app.route('/resetar_senha', methods=['GET', 'POST'])
def resetar_senha():
    if request.method == 'POST':
        cpf = request.form['cpf']
        
        new_password = request.form['password']
        # A confirmacao é feita no front mas por precaucao, fiz no back tbm...
        confirm_password = request.form.get('confirm_password')
        if not confirm_password or new_password != confirm_password:
            logging.error(f'/resetar_senha - CPF: {cpf} - Senha e Confirmar Senha não coincidem')
            return render_template('resetar_senha.html')
        
        securityQuestion = request.form['securityQuestion']
        securityAnswer = request.form['securityAnswer']

        # Construct the expected description value from securityQuestion and securityAnswer
        expected_description = securityQuestion + ';' + securityAnswer

        # Connect to LDAP and check the description attribute for the provided CPF
        with ldap_connection() as c:
            user_dn = get_dn(cpf)
            c.search(user_dn, '(objectClass=person)', attributes=['description'])
            # Teste se o usuario já está cadastrado
            if not c.entries:
                flash(f'CPF {cpf} não cadastrado!', 'error')
                logging.error(f'/resetar_senha - CPF {cpf} não cadastrado!')
                return render_template('resetar_senha.html')
            
            descriptionUser = ""
            for entry in c.entries:
                descriptionUser = entry.description

            # Check if the user's description matches the expected description
            if descriptionUser != expected_description:
                # Connect to LDAP and change the password
                logging.error(f'/resetar_senha - CPF: {cpf} - Pergunta de seguranca errada')
                flash(f'Pegunta de segurança invalida! ', 'error')
                return render_template('resetar_senha.html')
            try:
                # c.extend.standard.modify_password(user=user_dn, new_password=new_password)
                c.extend.microsoft.modify_password(user=user_dn, new_password=new_password)
                logging.debug(f'/resetar_senha - CPF: {cpf} - Senha resetada com sucesso')
                
            except Exception as e:
                logging.error(f'/resetar_senha - Erro inesperado ao resetar a senha do usuario {cpf}: {str(e)}')
                flash(f'Erro inesperado ao resetar a senha do usuario {cpf}', 'error')
                return render_template('resetar_senha.html') 
        return render_template('success.html')
    return render_template('resetar_senha.html')

if __name__ == "__main__":
    # app.run(host="0.0.0.0") # Producao
    app.run(debug=True, host="0.0.0.0", port=5002) # Homologacao