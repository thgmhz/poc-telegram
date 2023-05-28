/*

TDLIB - api

https://github.com/tdlib/td/blob/master/td/generate/scheme/td_api.tl

*/

const express = require("express");
const app = express();
const { Client } = require("tdl");
const { TDLib } = require("tdl-tdlib-addon");
const { getTdjson } = require("prebuilt-tdlib");
const path = require("path");
const tdlib = new TDLib(getTdjson());

const port = 3001;

const TELEGRAM_APP_ID = "";
const TELEGRAM_APP_HASH = "";

const client = {
  authorized: false,
  phoneNumber: null,
  instance: new Client(tdlib, {
    apiId: TELEGRAM_APP_ID,
    apiHash: TELEGRAM_APP_HASH,
    databaseDirectory: "PHONE_HERE".replace("+", "") + "/db",
    filesDirectory: "PHONE_HERE".replace("+", "") + "/files",
  }),
  data: null,
};

// https://github.com/tdlib/td/blob/master/td/generate/scheme/td_api.tl#L2761

// enviar mensagem de texto
client.instance
  .invoke({
    _: "sendMessage",
    chat_id: 5631041671,
    message_thread_id: 0,
    reply_to_message_id: 0,
    options: null,
    reply_markup: null,
    input_message_content: {
      _: "inputMessageText",
      text: {
        _: "formattedText",
        text: "teste 123",
      },
    },
  })
  .then(console.log)
  .catch(console.log);

// enviar mensagem com foto
client.instance
  .invoke({
    _: "sendMessage",
    chat_id: 5631041671,
    message_thread_id: 0,
    reply_to_message_id: 0,
    options: null,
    reply_markup: null,
    input_message_content: {
      _: "inputMessagePhoto",
      photo: {
        _: "inputFileLocal",
        path: path.join(__dirname, "tmp_sample", "foto.jpg"),
      },
      caption: {
        _: "formattedText",
        text: "mensagem aqui",
      },
    },
  })
  .then(console.log)
  .catch(console.log);

//enviar mensagem com video
client.instance
  .invoke({
    _: "sendMessage",
    chat_id: 5631041671,
    message_thread_id: 0,
    reply_to_message_id: 0,
    options: null,
    reply_markup: null,
    input_message_content: {
      _: "inputMessageVideo",
      video: {
        _: "inputFileLocal",
        path: path.join(__dirname, "tmp_sample", "video.mp4"),
      },
      caption: {
        _: "formattedText",
        text: "mensagem aqui",
      },
    },
  })
  .then(console.log)
  .catch(console.log);

//enviar mensagem com audio
client.instance
  .invoke({
    _: "sendMessage",
    chat_id: 5631041671,
    message_thread_id: 0,
    reply_to_message_id: 0,
    options: null,
    reply_markup: null,
    input_message_content: {
      _: "inputMessageAudio",
      audio: {
        _: "inputFileLocal",
        path: path.join(__dirname, "tmp_sample", "audio.oga"),
      },
      caption: {
        _: "formattedText",
        text: "mensagem aqui",
      },
    },
  })
  .then(console.log)
  .catch(console.log);

//enviar mensagem com documento
client.instance
  .invoke({
    _: "sendMessage",
    chat_id: 5631041671,
    message_thread_id: 0,
    reply_to_message_id: 0,
    options: null,
    reply_markup: null,
    input_message_content: {
      _: "inputMessageDocument",
      document: {
        _: "inputFileLocal",
        path: path.join(__dirname, "tmp_sample", "documento.pdf"),
      },
      caption: {
        _: "formattedText",
        text: "mensagem aqui",
      },
    },
  })
  .then(console.log)
  .catch(console.log);

client.instance.on("update", async (event) => {
  // console.log('\n ### event: update ###', JSON.stringify(event, null, 2))

  // pega os dados o usuário
  if (!client.data) {
    const data = await client.instance.invoke({
      _: "getMe",
    });
    client.data = data;
  }

  const eventType = event?._;

  // total de mensagens não lidas
  if (eventType === "updateUnreadChatCount") {
    const totalUnread = event.unread_count;
    console.log(`Mensagens não lidas: ${totalUnread}`);
  }

  // quando o client muda de status online/offline
  if (eventType === "updateUserStatus") {
    const status = event.status._;

    if (status === "userStatusOffline") {
      console.log(`Status do client: offline`);
    }

    if (status === "userStatusOnline") {
      console.log(`Status do client: online`);
    }
  }

  // mensagens
  if (eventType === "updateNewMessage") {
    // console.log('\n ### event type: updateNewMessage ###', JSON.stringify(event, null, 2))

    const message = event?.message;
    const messageType = message?.content?._;

    const isForward = !!message.forward_info;
    const date = new Date(message.date * 1000);

    const senderId = message?.sender_id?.user_id;
    const isFromClient = senderId === client?.data?.id;

    // pega fotos do usuário
    let photoUserPath;

    // const userPhotos = await client.instance.invoke({
    //   _: "getUserProfilePhotos",
    //   user_id: senderId,
    //   offset: 0,
    //   limit: 10,
    // });

    // if (userPhotos.total_count > 0) {
    //   // pega a foto menor
    //   const data = userPhotos?.photos[0]?.sizes[0];

    //   if (data?.photo?.id) {
    //     const file = await client.instance.invoke({
    //       _: "downloadFile",
    //       file_id: data.photo.id,
    //       priority: 1,
    //       offset: 0,
    //       limit: 0,
    //       synchronous: true,
    //     });

    //     photoUserPath = file.local.path;
    //   }
    // }

    let idFrom;
    let nameFrom;

    let idTo;
    let nameTo;

    console.log("isFromClient", isFromClient);

    // msg do client para outro usuário
    if (isFromClient) {
      nameFrom = `${client.data.first_name} ${client.data.last_name}`;

      // pega o id do chat com o outro usuário
      const chatObj = await client.instance.invoke({
        _: "getChat",
        chat_id: message.chat_id,
      });

      // pega os dados do outro usuário
      const user = await client.instance.invoke({
        _: "getUser",
        user_id: chatObj.id, // id do outro usuario
      });

      idTo = chatObj.id;
      nameTo = `${user.first_name} ${user.last_name}`;
    }

    // msg de outro usuário para o client
    if (!isFromClient) {
      const user = await client.instance.invoke({
        _: "getUser",
        user_id: senderId,
      });

      idFrom = senderId;
      nameFrom = `${user.first_name} ${user.last_name}`;
      nameTo = `${client.data.first_name} ${client.data.last_name}`;
    }

    // se for mensagem encaminhada, pega o nome do usuário de origem
    let nameForwardOrigin;
    if (isForward) {
      const user = await client.instance.invoke({
        _: "getUser",
        user_id: message?.forward_info?.origin?.sender_user_id,
      });

      nameForwardOrigin = `${user.first_name} ${user.last_name}`;
    }

    // mensagem de texto
    if (messageType === "messageText") {
      console.log(`
            ----- Mensagem de texto -----
              de: ${nameFrom}
              para: ${nameTo} - ${idTo}
              ${isForward ? `encaminhada de: ${nameForwardOrigin}` : ""}
              data: ${date}            
              texto: ${message.content.text.text}
            -----------------------------
          `);
    }

    // mensagem com foto
    if (messageType === "messagePhoto") {
      const { photo, width, height } = message?.content?.photo?.sizes?.find(
        (item) => item.type === "y" || "i"
      );

      const file = await client.instance.invoke({
        _: "downloadFile",
        file_id: photo.id,
        priority: 1,
        offset: 0,
        limit: 0,
        synchronous: true,
      });

      console.log(`
            ----- Mensagem com foto -----
              de: ${nameFrom} 
              para: ${nameTo} 
              ${isForward ? `encaminhada de: ${nameForwardOrigin}` : ""}
              data: ${date}           
              texto: ${message?.content?.caption?.text}
              width: ${width}
              height: ${height}
              path local: ${file?.local?.path}
            -----------------------------
          `);
    }

    // mensagem com documento
    if (messageType === "messageDocument") {
      const file = await client.instance.invoke({
        _: "downloadFile",
        file_id: message?.content?.document?.document?.id,
        priority: 1,
        offset: 0,
        limit: 0,
        synchronous: true,
      });

      console.log(`
            ----- Mensagem com documento -----
              de: ${nameFrom} 
              para: ${nameTo} 
              ${isForward ? `encaminhada de: ${nameForwardOrigin}` : ""}
              data: ${date}           
              texto: ${message?.content?.caption?.text}
              nome do arquivo: ${message?.content?.document?.file_name}
              mime type: ${message?.content?.document?.mime_type}
              path local: ${file?.local?.path}
            -----------------------------
          `);
    }

    // mensagem com video
    if (messageType === "messageVideo") {
      const file = await client.instance.invoke({
        _: "downloadFile",
        file_id: message?.content?.video?.video?.id,
        priority: 1,
        offset: 0,
        limit: 0,
        synchronous: true,
      });

      console.log(`
            ----- Mensagem com vídeo -----
              de: ${nameFrom} 
              para: ${nameTo} 
              ${isForward ? `encaminhada de: ${nameForwardOrigin}` : ""}
              data: ${date}           
              texto: ${message?.content?.caption?.text}
              mime type: ${message?.content?.video?.mime_type}
              width: ${message?.content?.video?.width}
              height: ${message?.content?.video?.height}
              path local: ${file?.local?.path}
            -----------------------------
          `);
    }

    // mensagem de áudio
    if (messageType === "messageVoiceNote") {
      const file = await client.instance.invoke({
        _: "downloadFile",
        file_id: message?.content?.voice_note?.voice?.id,
        priority: 1,
        offset: 0,
        limit: 0,
        synchronous: true,
      });

      console.log(`
            ----- Mensagem de áudio -----
              de: ${nameFrom} 
              para: ${nameTo} 
              ${isForward ? `encaminhada de: ${nameForwardOrigin}` : ""}
              data: ${date}           
              duração: ${message?.content?.voice_note?.duration}
              mime type: ${message?.content?.voice_note?.mime_type}
              path local: ${file?.local?.path}
            -----------------------------
          `);
    }
  }
});

client.instance.on("destroy", (res) => {
  console.log("destroy (thiago):", JSON.stringify(res, null, 2));
  console.log("\n\n");
});

app.use(express.json());

app.post("/register", async (req, res) => {
  try {
    const phoneNumber = req.body.phoneNumber;

    if (!client.authorized) {
      client.phoneNumber = phoneNumber;

      // client.instance = new Client(tdlib, {
      //   apiId: TELEGRAM_APP_ID,
      //   apiHash: TELEGRAM_APP_HASH,
      //   databaseDirectory: phoneNumber.replace('+','') + '/db',
      //   filesDirectory: phoneNumber.replace('+','') + '/files',
      // });
    }

    const sendCode = await client.instance.invoke({
      _: "setAuthenticationPhoneNumber",
      phone_number: phoneNumber,
    });

    res.send(sendCode._);
  } catch (error) {
    res
      .status(500)
      .send("Erro ao fazer login: " + JSON.stringify(error, null, 2));
  }
});

app.post("/authorization", async (req, res) => {
  try {
    const authCode = req.body.authCode;

    if (!client.instance) {
      return res.status(400).send("Client instance error");
    }

    // verifica codigo
    const check = await client.instance.invoke({
      _: "checkAuthenticationCode",
      code: authCode,
    });

    // se der erro
    if (check._ === "error") {
      return res.status(400).send("Invalid code");
    }

    // obtem dados do usuario
    const user = await client.instance.invoke({ _: "getMe" });

    client.data = user;
    client.authorized = true;

    return res.send("ok");
  } catch (error) {
    console.log(error);

    res.status(500);
  }
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
