const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 8080;

const wss = new WebSocketServer({
    port: PORT
});

// ========================================
// USUÁRIOS CONECTADOS
// ========================================

const usuarios = new Map();


// ========================================
// NOVA CONEXÃO
// ========================================

wss.on("connection", (ws) => {

    console.log("Novo cliente conectado");

    ws.on("error", console.error);


    // ========================================
    // RECEBER MENSAGEM
    // ========================================

    ws.on("message", (data) => {

        try {

            const mensagem = JSON.parse(data.toString());


            // ========================================
            // LOGIN
            // ========================================

            if (mensagem.tipo === "login") {

                const usuario = mensagem.usuario?.trim();

                if (!usuario) {

                    ws.send(JSON.stringify({
                        tipo: "erro",
                        mensagem: "Usuário inválido."
                    }));

                    return;
                }


                // Se já estiver conectado
                if (usuarios.has(usuario)) {

                    ws.send(JSON.stringify({
                        tipo: "erro",
                        mensagem: "Usuário já está conectado."
                    }));

                    return;
                }


                // Guarda usuário
                usuarios.set(usuario, ws);

                // Guarda identidade na conexão
                ws.usuario = usuario;


                console.log(`🟢 ${usuario} entrou no MSN`);


                // Confirma login
                ws.send(JSON.stringify({
                    tipo: "login_sucesso",
                    usuario: usuario,
                    mensagem: "Conectado ao MSN."
                }));


                // Atualiza lista de usuários
                enviarListaUsuarios();

                return;
            }



            // ========================================
            // MENSAGEM PRIVADA
            // ========================================

            if (mensagem.tipo === "privada") {

                // O remetente verdadeiro vem da conexão
                const remetente = ws.usuario;

                const destinatario =
                    mensagem.destinatario?.trim();

                const texto =
                    mensagem.mensagem?.trim();


                if (!remetente) {

                    ws.send(JSON.stringify({
                        tipo: "erro",
                        mensagem: "Você não está conectado."
                    }));

                    return;
                }


                if (!destinatario || !texto) {

                    ws.send(JSON.stringify({
                        tipo: "erro",
                        mensagem: "Mensagem inválida."
                    }));

                    return;
                }


                // Procura destinatário
                const cliente = usuarios.get(destinatario);


                // Destinatário offline
                if (!cliente) {

                    ws.send(JSON.stringify({
                        tipo: "erro",
                        mensagem: `${destinatario} está offline.`
                    }));

                    return;
                }


                // ========================================
                // ENVIA PARA DESTINATÁRIO
                // ========================================

                cliente.send(JSON.stringify({

                    tipo: "mensagem",

                    remetente: remetente,

                    destinatario: destinatario,

                    mensagem: texto

                }));


                // ========================================
                // CONFIRMA PARA REMETENTE
                // ========================================

                ws.send(JSON.stringify({

                    tipo: "enviada",

                    remetente: remetente,

                    destinatario: destinatario,

                    mensagem: texto

                }));


                console.log(
                    `💬 ${remetente} → ${destinatario}: ${texto}`
                );

                return;
            }



            // ========================================
            // PEDIR LISTA DE USUÁRIOS
            // ========================================

            if (mensagem.tipo === "usuarios") {

                enviarListaPara(ws);

                return;
            }



            // ========================================
            // DIGITANDO
            // ========================================

            if (mensagem.tipo === "digitando") {

                const remetente = ws.usuario;

                const destinatario =
                    mensagem.destinatario?.trim();

                const cliente =
                    usuarios.get(destinatario);


                if (cliente) {

                    cliente.send(JSON.stringify({

                        tipo: "digitando",

                        remetente: remetente

                    }));

                }

                return;
            }

        }

        catch (erro) {

            console.error("Erro ao processar mensagem:", erro);

            ws.send(JSON.stringify({

                tipo: "erro",

                mensagem: "Mensagem inválida."

            }));

        }

    });



    // ========================================
    // DESCONECTAR
    // ========================================

    ws.on("close", () => {

        if (ws.usuario) {

            const usuario = ws.usuario;

            usuarios.delete(usuario);

            console.log(`🔴 ${usuario} saiu do MSN`);

            enviarListaUsuarios();
        }

    });

});



// ========================================
// ENVIAR LISTA DE USUÁRIOS
// ========================================

function enviarListaUsuarios() {

    const lista = [...usuarios.keys()];

    usuarios.forEach((cliente) => {

        cliente.send(JSON.stringify({

            tipo: "lista_usuarios",

            usuarios: lista

        }));

    });

}



// ========================================
// ENVIAR LISTA PARA UM USUÁRIO
// ========================================

function enviarListaPara(ws) {

    ws.send(JSON.stringify({

        tipo: "lista_usuarios",

        usuarios: [...usuarios.keys()]

    }));

}



// ========================================
// SERVIDOR INICIADO
// ========================================

console.log(
    `🚀 Servidor MSN rodando na porta ${PORT}`
);