const express = require('express');
const app = express();
app.use(express.json());

// Lista de espera para armazenar as solicitações recebidas

// Variável para indicar se há uma solicitação sendo processada no momento

app.use(express.json());

app.post('/dados', (req, res) => {
  const dados = req.body;
  // seta no banco de dados a solicitação, setando um id também
  const id = Math.random() * 2000
  dados.id = id.toFixed();
  listaDeEspera.push(dados);
  processarDados()
  res.send('Dados recebidos com sucesso id:'+ dados.id);
});


app.get('/dados/:id', (req, res) => {
  const id = req.params.id;
  processarDados();// caso necessite resetar
  if(eta.id === id){
    return res.send({queue: 1, eta: eta})
  }

  // verificar no banco se ja fo iexecutado ou sua posição na fila
  const index = listaDeEspera.findIndex((list) => list.id === id);
  if(index < 0) { // -1 = não achou
    res.send({queue: undefined});
  } else {
    const timing = eta.rawTime*(index+2)
    res.send({queue: index + 2, etr: {
      rawTime: timing,
      time: milissegundosParaHorario(timing)
    }});
  }

});


const listaDeEspera = [];
let eta = {};
let processando = false;
async function processarDados() {
  if(processando)
    return
    
  // verifica no banco de dados se existe uma solicitação
  if(listaDeEspera.length > 0) {
    processando = true;

    // pega o resgistro mais recente, e o remove do banco de dados ao concluir e atualiza quando finalizou
    const { data, id } = listaDeEspera.shift();


    eta.startTime = new Date().getTime();
    eta.time = "Iniciando..."
    eta.rawTime = 0
    eta.percent = 0
    eta.id = id;


    await data.reduce(async (previousPromise, currentValue, index) => {
      await previousPromise; // Espera a iteração anterior concluir

      return new Promise(resolve => {
        const delay = new Date().getTime();
        // Simula um processo de processamento de dados que leva x segundos
        setTimeout(() => {
          console.log(currentValue);
          resolve();


          const actual = new Date().getTime();
          eta.rawTime = ((actual - delay) * (data.length - index - 1));
          // eta.estimatedFinishTime = actual + eta.rawTime;
          eta.time = milissegundosParaHorario(eta.rawTime);
          eta.percent = ((index + 1) / data.length * 100).toFixed(0);
          console.log(eta);
        }, 13189);
      });
    }, Promise.resolve());


    processando = false;
    //salva o eta no banco também
    eta = {}
    await processarDados()
  } else {
    console.log(`Processamento concluido`);
  }
}

function milissegundosParaHorario(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);

  const segundosFormatados = s % 60 < 10 ? `0${s % 60}` : s % 60;
  const minutosFormatados = m % 60 < 10 ? `0${m % 60}` : m % 60;
  const horasFormatadas = h < 10 ? `0${h}` : h;

  return `${horasFormatadas}:${minutosFormatados}:${segundosFormatados}`;
}

app.listen(3005, () => {
  console.log('Servidor iniciado na porta 3000');
});