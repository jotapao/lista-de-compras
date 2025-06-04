document.addEventListener('DOMContentLoaded', () => {
    const inputItem = document.querySelector('.adicionar-item-container input[type="text"]');
    const btnAdicionar = document.querySelector('.btn-adicionar');
    const listaComprasUL = document.querySelector('.lista-compras');
    const notificacaoDiv = document.querySelector('.notificacao');
    const spanNotificacao = notificacaoDiv.querySelector('span');
    const btnFecharNotificacao = document.querySelector('.fechar-notificacao');

    let notificationTimeout; // Variável para controlar o timeout da notificação

    // Carregar itens do localStorage (opcional, mas bom para persistência)
    loadItems();

    // --- FUNCIONALIDADES ---

    // ADICIONAR ITEM
    btnAdicionar.addEventListener('click', adicionarItem);
    inputItem.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            adicionarItem();
        }
    });

    function adicionarItem() {
        const textoItem = inputItem.value.trim();

        if (textoItem === '') {
            mostrarNotificacao('Por favor, insira um item.', 'aviso');
            return;
        }

        criarElementoItem(textoItem);
        salvarItems(); // Salvar no localStorage

        inputItem.value = '';
        inputItem.focus();
    }

    function criarElementoItem(texto, checked = false) {
        const li = document.createElement('li');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        const itemId = 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9); // ID único
        checkbox.id = itemId;
        checkbox.checked = checked;
        checkbox.addEventListener('change', () => {
            li.classList.toggle('comprado', checkbox.checked);
            salvarItems();
        });


        const label = document.createElement('label');
        label.htmlFor = itemId;
        label.textContent = texto;

        const btnRemover = document.createElement('button');
        btnRemover.classList.add('btn-remover-item');
        btnRemover.innerHTML = '&times;'; // Ou <i class="fas fa-trash"></i> se usar FontAwesome
        btnRemover.setAttribute('aria-label', 'Remover item');
        btnRemover.addEventListener('click', () => {
            removerItem(li, texto);
        });

        li.appendChild(checkbox);
        li.appendChild(label);
        li.appendChild(btnRemover);

        if (checked) {
            li.classList.add('comprado');
        }

        listaComprasUL.appendChild(li);
    }

    // REMOVER ITEM
    function removerItem(itemElemento, textoItem) {
        listaComprasUL.removeChild(itemElemento);
        mostrarNotificacao(`O item "${textoItem}" foi removido da lista.`, 'sucesso');
        salvarItems(); // Salvar no localStorage após remover
    }

    // Adicionar listeners aos botões de remover dos itens já existentes no HTML (se houver)
    // É melhor popular a lista via JS, mas isso cobre itens estáticos.
    // Para um início limpo, remova os <li> estáticos do HTML.
    document.querySelectorAll('.lista-compras li').forEach(li => {
        const labelText = li.querySelector('label').textContent;
        if (!li.querySelector('.btn-remover-item')) { // Adiciona botão de remover se não existir
            const btnRemover = document.createElement('button');
            btnRemover.classList.add('btn-remover-item');
            btnRemover.innerHTML = '&times;';
            btnRemover.setAttribute('aria-label', 'Remover item');
            btnRemover.addEventListener('click', () => {
                removerItem(li, labelText);
            });
            li.appendChild(btnRemover);

            // Adiciona funcionalidade ao checkbox existente
            const checkbox = li.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    li.classList.toggle('comprado', checkbox.checked);
                    salvarItems();
                });
                if (checkbox.checked) {
                    li.classList.add('comprado');
                }
            }
        }
    });


    // NOTIFICAÇÃO
    function mostrarNotificacao(mensagem, tipo = 'sucesso') { // tipo pode ser 'sucesso' ou 'aviso'
        clearTimeout(notificationTimeout); // Limpa timeout anterior, se houver

        spanNotificacao.textContent = mensagem;
        notificacaoDiv.style.display = 'flex';

        if (tipo === 'aviso') {
            notificacaoDiv.style.backgroundColor = '#ffc107'; // Amarelo para aviso
            notificacaoDiv.style.color = '#333';
        } else {
            notificacaoDiv.style.backgroundColor = '#dc3545'; // Vermelho padrão para remoção/sucesso (como no protótipo)
            notificacaoDiv.style.color = 'white';
        }


        notificationTimeout = setTimeout(() => {
            esconderNotificacao();
        }, 4000); // Esconde após 4 segundos
    }

    function esconderNotificacao() {
        notificacaoDiv.style.display = 'none';
    }

    btnFecharNotificacao.addEventListener('click', esconderNotificacao);


    // LOCALSTORAGE para persistir dados (Opcional)
    function salvarItems() {
        const items = [];
        document.querySelectorAll('.lista-compras li').forEach(li => {
            items.push({
                text: li.querySelector('label').textContent,
                checked: li.querySelector('input[type="checkbox"]').checked
            });
        });
        localStorage.setItem('listaComprasItems', JSON.stringify(items));
    }

    function loadItems() {
        const itemsGuardados = localStorage.getItem('listaComprasItems');
        if (itemsGuardados) {
            const itemsParseados = JSON.parse(itemsGuardados);
            // Limpa a lista estática antes de carregar do localStorage para evitar duplicatas
            // Se você preferir manter os itens estáticos do HTML e apenas adicionar os do localStorage,
            // você pode remover a linha abaixo, mas gerenciará os botões de remoção como feito acima.
            // Para um controle total via JS, é melhor limpar.
            listaComprasUL.innerHTML = ''; // Limpa itens estáticos
            itemsParseados.forEach(item => {
                criarElementoItem(item.text, item.checked);
            });
        } else {
            // Se não há itens salvos, garante que os itens estáticos (se houver e se não foram limpos)
            // tenham os botões de remoção e funcionalidade de checkbox.
            // Esta parte é redundante se você limpar a lista (listaComprasUL.innerHTML = '') acima.
            // Se não limpar, então o código que adiciona botões aos itens estáticos é útil.
            // No modelo atual, com `listaComprasUL.innerHTML = ''` no início do `loadItems`,
            // os itens estáticos do HTML original não serão renderizados se houver algo no localStorage.
            // Se o localStorage estiver vazio, os itens estáticos do HTML permanecerão e o código
            // para adicionar botões a eles (fora desta função) será executado.
        }
    }

});