function calcularCarga(duracao, intensidade) {
  return duracao * intensidade;
}

function calcularACWR(cargaAguda, cargaCronica) {
  if (cargaCronica === 0) return 0;
  return cargaAguda / cargaCronica;
}

function classificarRisco(acwr) {
  if (acwr === 0) return "Sem dados suficientes";
  if (acwr < 0.8) return "Baixa carga";
  if (acwr <= 1.3) return "Risco baixo";
  if (acwr <= 1.5) return "Atenção";
  return "Alto risco";
}

module.exports = {
  calcularCarga,
  calcularACWR,
  classificarRisco
};