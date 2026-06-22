import { useState } from 'react';
import api from '../services/api';

function VincularAtleta() {
  const [emailBusca, setEmailBusca] = useState('');
  const [atletaEncontrado, setAtletaEncontrado] = useState(null);
  const [erroBusca, setErroBusca] = useState('');
  const [loadingBusca, setLoadingBusca] = useState(false);
  const [sucessoVinculo, setSucessoVinculo] = useState('');

  // Função que busca o ID no backend usando o e-mail
  async function lidarBuscaEmail(e) {
    const emailDigitado = e.target.value;
    setEmailBusca(emailDigitado);

    // Só busca se o e-mail parecer minimamente válido (contiver @ e .)
    if (emailDigitado.includes('@') && emailDigitado.includes('.')) {
      setLoadingBusca(true);
      setErroBusca('');
      setAtletaEncontrado(null);

      try {
        const token = localStorage.getItem('token');
        const response = await api.get(`/usuarios/buscar-por-email?email=${encodeURIComponent(emailDigitado.trim())}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Se achou, guarda o ID e o Nome no estado
        setAtletaEncontrado(response.data); 
      } catch (err) {
        if (err.response?.status === 404) {
          setErroBusca('Nenhum atleta cadastrado com este e-mail.');
        } else {
          setErroBusca('Erro ao validar e-mail.');
        }
      } finally {
        setLoadingBusca(false);
      }
    } else {
      setAtletaEncontrado(null);
    }
  }

  // Função que envia o vínculo usando o ID que descobrimos por trás dos panos
  async function handleVincular(e) {
    e.preventDefault();
    if (!atletaEncontrado) return;

    try {
      const token = localStorage.getItem('token');
      // Altere para a sua rota real de vinculação do seu sistema
      await api.post('/tecnicos/vincular-atleta', {
        atletaId: atletaEncontrado.id // <-- Envia o ID que o Python/Node precisam!
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSucessoVinculo(`Atleta ${atletaEncontrado.nome} vinculado com sucesso!`);
      setEmailBusca('');
      setAtletaEncontrado(null);
    } catch (err) {
      setErroBusca('Falha ao efetuar a vinculação.');
    }
  }

  return (
    <div className="card" style={{ maxWidth: '500px', padding: '24px' }}>
      <h3>Vincular Novo Atleta</h3>
      
      <form onSubmit={handleVincular} className="form-card">
        <label>
          E-mail do Atleta
          <input
            type="email"
            placeholder="Digite o e-mail exato do atleta..."
            value={emailBusca}
            onChange={lidarBuscaEmail}
            required
          />
        </label>

        {/* FEEDBACKS VISUAIS EM TEMPO REAL */}
        {loadingBusca && <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Buscando ID do atleta...</p>}
        
        {erroBusca && <p className="error-message" style={{ padding: '8px', fontSize: '14px' }}>{erroBusca}</p>}
        
        {atletaEncontrado && (
          <div className="success-message" style={{ padding: '10px', fontSize: '14px', background: 'rgba(34, 197, 94, 0.1)' }}>
            ✓ <strong>Atleta Localizado!</strong> <br />
            Nome: {atletaEncontrado.nome} <br />
            ID Sistema: #{atletaEncontrado.id}
          </div>
        )}

        {sucessoVinculo && <p className="success-message">{sucessoVinculo}</p>}

        <button 
          type="submit" 
          disabled={!atletaEncontrado}
          style={{ marginTop: '12px', opacity: atletaEncontrado ? 1 : 0.6 }}
        >
          Confirmar Vinculação
        </button>
      </form>
    </div>
  );
}

export default VincularAtleta;