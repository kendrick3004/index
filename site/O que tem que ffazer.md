presta bem atenção em tudo o que a gente tem que fazer. A gente vai criar um sistema de erros, páginas de erros separada. O sistema de página de erro ali junto não tá funcionando, não tá dando certo esse sistema. Por que não tá dando certo? Por conta que tá acontecendo o seguinte, se eu tiro do ar o site e ele vai pra outra página, ele vai procurar uma página errada, alguma coisa assim, ele vai aparecer aquele genérico. Eu quero que apareça o meu, então a gente vamos fazer o seguinte, Ah, o usuário tá lá no site, beleza, o site caiu, eu tô atualizando o site, tudo que está acontecendo ali, o site caiu, deu, eu jogo o outro e vai jogar uma pasta o quê? Nessa pasta, ele vai jogar essa pasta, a pasta de manutenção, alguma coisa assim, se eu não me engano, o nome da pasta. Vai fazer o quê? Ele vai jogar essa pasta pra lá. Ah, beleza, e ele vai rodar, daí vai ser um, eu vou te passar ali certinho o código, vai ser um mai.py, não, um main.py, que é um arquivo em Python. Eu vou te mandar também o conteúdo do arquivo. A gente vai fazer o quê? Que em primeira instância, quando esse arquivo for ativado, ele vai ativar o arquivo do site em manutenção. O usuário fechou pra outra página em manutenção. O usuário fez outra coisa em manutenção. Ou seja, o que vai ficar assim meio que por fora ali, o negócio, Ah, o usuário fez coe, fez tal coisa, manutenção. O usuário tá em outro lugar, manutenção. Enquanto tá em manutenção, tudo as coisas ali feita. Daí vai ser feito o quê? tu tá vendo ali que tem um index ponto HTML. A gente vamos transformar esse index ponto HTML vai ficar 503, que é o código de erro de manutenção. Ele vai servir como modelo pra ti. Tem outros arquivos ali já pronto. Se eu não estou enganado, eu vou até analisar aqui. Tem um arquivo em específico que ele é bem dizer todo alterado, que é o arquivo 429 ponto HTML. Esse arquivo tu não vai mudar nada nele. Tu vai apenas tirar o CSS e vai botar lá pro... Não, tu pode deixar até o CSS ali dentro. Tu pode deixar o CSS ali dentro. Aí sabe o que que a gente fez? sabe o que que foi feito assim ó, eu criei ali no MAINTENANCE dentro dessa pasta, ela tá com Ela está com um arquivo de erro ali do 503. Dentro dessa pasta tá com um arquivo de erro de 503. O que que vai ser feito? Se tu for ver ali, ele já tem uma pré-disposição de tudo o que vai precisar pra esse erro ficar operando assim meio que de fora, pra ficar operando de fora dos muros. Tu consegue me entender? Ficar por fora dos muros. Aí vai ser feito do quê? Ah, beleza. Todos os arquivos de erro, menos o 429, que ele vai ser diferente, é um é um diferente, só vai alterar o caminho ali das coisas pra fazer que fique dentro da pasta. Só alterar o caminho ali da dos negócios que pra tudo pra dentro da pasta e o que ele precisar pra puxar também. E principalmente vai puxar, tem uma função, agora eu me lembro que função, do limite, do limitador de ataque de negação de serviço. Se eu não me engano, eu vou até analisar, ele tá dentro da pasta CRC, dentro da pasta JavaScript, que ele se chama H Limiter, o Limiter hash, alguma coisa assim, ele é um arquivo JavaScript, é limiter no final. Ele vai ter, ele tem o sistema de limitação ali, daí a gente também vai poder jogar para a pasta ali dos arquivos de erro e tal. Em primeira instância, a gente vai fazer isso, toda essa migração dos arquivos de erro para essa pasta. Em segunda instância, vai ser feito o quê? Presta bem atenção que isso é uma coisa complicada de fazer, na minha perspectiva, uma coisa meio complicada de fazer. A gente vamos ter que dar um jeito de fazer um quê? Tá atualizando esse arquivo de erro vai ficar uma pasta fora do arquivo do próprio site. Ele vai ficar uma pasta alternativa do arquivo do próprio site. Vai ser feito o quê? Tenha ali, ele vai ser dois pastas, vai ser a pasta do site e vai ser a pasta dos erros. A pasta do site vai ter os index.html e tudo dentro dessa pasta do site. E a pasta do erro vai ser uma pasta separada que vai ter todos os tipos de erro possíveis. Vamos ter que fazer uma integração entre essa pasta de erro e essa pasta que está por fora, essa pasta que está no está ali num questão de site. A gente vamos ter que fazer uma integração para que todos os erros que foram ali para fora da pasta que estão na pasta do erro, todos os tipos de arquivos de erro que estão ali, ele interaja junto com a pasta do site. Você está conseguindo me entender? Tu pode me fazer pergunta para te entender melhor. Ele vai interagir junto com a pasta do site, eles vão ficar trabalhando em junto. Enquanto a pasta do site estiver em manutenção, eu também vou te mandar o código que eu estou botando. Eu estou trabalhando num ambiente Ubuntu, um ambiente Linux, para você ter uma noção. Ele vai dar essa integração. Eu vou te mandar o código também de como tá o arquivo que assim ó, é um arquivo, são vários arquivos, cada arquivo ele faz uma coisinha. Eu vou te mandar para te dar uma entendida também. Qualquer coisa, tu pode me perguntar também. Mas o foco principal é na migração das pastas, dos arquivos de erro para essa pasta de erros, a migração de tudo que tu vai precisar para dentro dessa pasta de erros e a correção dos caminhos. Consegue me entender? Essa pasta de erros, ela tem que agir de maneira separada das outras pastas, porque enquanto a pasta de erro, enquanto o arquivo de atualização do site estiver operando ali, que ele estiver em primeira instância, nada daquela pasta do site vai ficar todos os conteúdos da pasta do site vão ser deletados para colocar os novos conteúdos. Vai começar tudo do zero. Eu vou te mandar os arquivos pra tu entender. O arquivo primeiro que eu vou te mandar é como é que funciona o sistema ali. Eu vou te mandar, é um... É um start.sh que ele meio que puxa as coisas, mas ele não tá correto ainda, ele não tá 100% ainda, porque falta fazer essas alterações dos arquivos aí. E dois.python, que é dois my.python. Um my.python já tá dentro da pasta dos sites. E o outro que eu tenho que fazer, eu vou já te deixar também, eu vou deixar aqui no projeto, outro my.python que vai ficar dentro da pasta de erros, que esse my.python, ele vai puxar o conteúdo da pasta de erros.

start.sh 
#!/bin/bash

cd / || exit

echo "🛑 Parando qualquer servidor em execução..."
pkill -f main.py
pkill -f http.server

sleep 2

echo "🚧 Iniciando modo manutenção..."
cd /maintenance || exit
nohup python3 main.py > /maintenance/log.txt 2>&1 &

sleep 3

echo "🧹 Limpando arquivos antigos do site..."
rm -rf /site/*

echo "📥 Baixando nova versão do site do GitHub..."
cd /

# 🔥 clona em pasta temporária (mais seguro)
git clone https://github.com/kendrick3004/site.git /tmp/site-temp

# verifica se deu certo
if [ ! -d /tmp/site-temp ]; then
    echo "❌ Erro ao baixar o site!"
    exit 1
fi

# copia para /site
cp -r /tmp/site-temp/* /site/
rm -rf /tmp/site-temp

echo "📂 Entrando na pasta do site..."
cd /site || exit

echo "⚙️ Gerando estrutura de assets..."
if [ -f database/generate_assets_structure.py ]; then
    cd database || exit
    python3 generate_assets_structure.py
    cd .. || exit
else
    echo "⚠️ Script de assets não encontrado!"
fi

echo "🛑 Finalizando modo manutenção..."
pkill -f main.py

sleep 2

echo "🚀 Iniciando servidor principal do site..."
nohup python3 main.py > /site/log.txt 2>&1 &

echo "✅ Deploy finalizado! Site online."

# 🔥 Garante que o log existe
touch /site/log.txt

# 🔥 Pergunta se quer ver logs
read -p "📜 Deseja abrir o log em tempo real? (s/n): " opcao

if [ "$opcao" = "s" ]; then
    echo "📊 Pressione CTRL+C para sair do log"
    tail -f /site/log.txt
fi