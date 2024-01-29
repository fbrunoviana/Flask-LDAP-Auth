# Flask LDAP Auth

<img src="static/img/logo-login.png" width="200" height="202"/>
Essa aplicação é um exemplo de como usar o LDAP com Flask. 

Nesse exemplo ultilizo o CPF como campo principal de login, fazendo uma validação simples com o `validate-docbr`.

A biblioteca escolhida para fazer a conexão com o LDAP é o `ldap3`.

Como se trata de uma aplicação de exemplo da ultilização do LDAP, usuario e senha estão setando em hard code, caso opte por usar esse codigo altere para como achar necessario. 