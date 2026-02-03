let solicitacoes = [];
let correiosConfigurado = false;

async function fetchSolicitacoes() {
    const res = await fetch('/api/solicitacoes');
    const data = await res.json();
    solicitacoes = data.solicitacoes;
    correiosConfigurado = data.correios_configurado;
    renderBoard();
    updateConfigWarning();
}

function updateConfigWarning() {
    let warning = document.getElementById('config-warning');
    if (!correiosConfigurado) {
        if (!warning) {
            warning = document.createElement('div');
            warning.id = 'config-warning';
            warning.className = 'warning-banner';
            warning.innerText = '⚠️ Integração Correios não configurada (Modo Manual Ativado)';
            document.body.prepend(warning);
        }
    } else if (warning) {
        warning.remove();
    }
}

function renderBoard() {
    const columns = document.querySelectorAll('.column');
    columns.forEach(col => {
        const status = col.dataset.status;
        const container = col.querySelector('.cards-container');
        const countSpan = col.querySelector('.count');
        
        const filtered = solicitacoes.filter(s => s.status === status);
        countSpan.innerText = filtered.length;
        
        container.innerHTML = '';
        filtered.forEach(s => {
            const card = document.createElement('div');
            card.className = 'card';
            card.draggable = true;
            card.innerHTML = `
                <h4>${s.cliente_nome || 'Sem Nome'}</h4>
                <p>Remessa: ${s.numero_remessa || 'N/A'}</p>
                ${s.codigo_rastreio ? `<div class="badge">📦 ${s.codigo_rastreio}</div>` : ''}
            `;
            card.onclick = () => openModal(s.id);
            card.ondragstart = (e) => e.dataTransfer.setData('text/plain', s.id);
            container.appendChild(card);
        });

        container.ondragover = (e) => e.preventDefault();
        container.ondrop = async (e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain');
            await updateStatus(id, status);
        };
    });
}

async function updateStatus(id, newStatus) {
    const s = solicitacoes.find(item => item.id == id);
    if (s.status === newStatus) return;

    if (newStatus === 'Enviado' && !s.codigo_rastreio) {
        const code = prompt('Informe o código de rastreio:');
        if (!code) return;
        
        const res = await fetch(`/api/solicitacoes/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, codigo_rastreio: code })
        });
        if (!res.ok) {
            const err = await res.json();
            alert(err.error);
            return;
        }
    } else {
        await fetch(`/api/solicitacoes/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
    }
    fetchSolicitacoes();
}

async function openModal(id) {
    const res = await fetch(`/api/solicitacoes/${id}`);
    const s = await res.json();
    const modal = document.getElementById('modal');
    const body = document.getElementById('modal-body');
    
    body.innerHTML = `
        <h2>Detalhes da Solicitação</h2>
        <div class="form-group">
            <p><strong>Cliente:</strong> ${s.cliente_nome} (${s.cliente_cnpj})</p>
            <p><strong>E-mail:</strong> ${s.cliente_email}</p>
            <p><strong>Endereço:</strong> ${s.endereco}</p>
            <p><strong>Placa:</strong> ${s.placa}</p>
            <p><strong>Observação:</strong> ${s.observacao}</p>
        </div>
        
        <hr>
        
        <h3>Etiqueta e Rastreio</h3>
        <div class="form-group">
            <p><strong>Código de Rastreio:</strong> ${s.codigo_rastreio || 'Não informado'}</p>
            ${s.anexos.filter(a => a.tipo === 'etiqueta').map(a => `
                <p><a href="${a.caminho}" target="_blank">📄 Ver Etiqueta (${a.nome_original})</a></p>
            `).join('')}
            
            ${correiosConfigurado ? `
                <button onclick="gerarPrePostagem(${s.id})" class="btn-api">Gerar Pré-Postagem & Etiqueta API</button>
            ` : ''}
            
            <div style="margin-top: 10px;">
                <label>Upload Manual de Etiqueta:</label>
                <input type="file" id="etiqueta-file">
                <button onclick="uploadEtiqueta(${s.id})">Enviar Etiqueta</button>
            </div>
        </div>

        <hr>

        <h3>Comentários e Histórico</h3>
        <div class="form-group">
            <textarea id="novo-comentario" placeholder="Adicionar comentário..."></textarea>
            <button onclick="addComentario(${s.id})">Postar</button>
        </div>
        <div class="history-list">
            ${s.historicos.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(h => `
                <div class="history-item">
                    <div class="history-date">${new Date(h.createdAt).toLocaleString()}</div>
                    <div>${h.descricao}</div>
                </div>
            `).join('')}
        </div>
    `;
    modal.style.display = 'block';
}

async function gerarPrePostagem(id) {
    const btn = event.target;
    btn.disabled = true;
    btn.innerText = 'Processando...';
    try {
        const res = await fetch(`/api/solicitacoes/${id}/pre-postagem`, { method: 'POST' });
        const data = await res.json();
        if (data.error) alert(data.error);
        else openModal(id);
    } catch (e) {
        alert('Erro ao processar API');
    } finally {
        btn.disabled = false;
        btn.innerText = 'Gerar Pré-Postagem & Etiqueta API';
    }
}

async function uploadEtiqueta(id) {
    const fileInput = document.getElementById('etiqueta-file');
    if (!fileInput.files[0]) return alert('Selecione um arquivo');
    
    const formData = new FormData();
    formData.append('etiqueta', fileInput.files[0]);
    
    await fetch(`/api/solicitacoes/${id}/etiqueta`, {
        method: 'POST',
        body: formData
    });
    openModal(id);
}

async function addComentario(id) {
    const text = document.getElementById('novo-comentario').value;
    if (!text) return;
    
    await fetch(`/api/solicitacoes/${id}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comentario: text })
    });
    openModal(id);
}

// Fechar modal
document.querySelector('.close').onclick = () => {
    document.getElementById('modal').style.display = 'none';
};

document.getElementById('refresh-btn').onclick = fetchSolicitacoes;

// Inicialização
fetchSolicitacoes();
setInterval(fetchSolicitacoes, 30000); // Atualiza a cada 30s
