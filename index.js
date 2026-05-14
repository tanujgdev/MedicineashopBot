require("dotenv").config();

const TelegramBot =
  require("node-telegram-bot-api");

const axios =
  require("axios");

const XLSX =
  require("xlsx");

const fs =
  require("fs");

// ==========================
// CONFIG
// ==========================

const db =
  require("./config/db");

// ==========================
// AI
// ==========================

const askAI =
  require("./ai/ai");

// ==========================
// SERVICES
// ==========================

const processExcel =
  require("./services/excelService");










const {
  addMedicine,
  updateStock,
  deleteMedicine,
  deleteAll,
  getStock,
  searchMedicine,
} = require("./services/medicineService");

// ==========================
// BOT
// ==========================

const bot = new TelegramBot(
  process.env.BOT_TOKEN,
  {
    polling: true,
  }
);

console.log("🚀 Bot Started");
console.log("🤖 Waiting for messages...");

// ==========================
// START
// ==========================

bot.onText(/\/start/, (msg) => {

  bot.sendMessage(

    msg.chat.id,

`🤖 Medicine Management Bot

Commands:

/add name stock price company expiry

Example:
/add napa 50 10 Beximco 2027-12-31

/update name stock

Example:
/update napa 100

/deleteall

Example:
/deleteall


/delete name

Example:
/delete napa

/stock

/search medicine_name

Example:
/search napa`
  );
});

// ==========================
// ADD MEDICINE
// ==========================

bot.onText(
  /\/add (.+)/,
  async (msg, match) => {

    try {

      const args =
        match[1].split(" ");

      if (args.length < 5) {

        return bot.sendMessage(
          msg.chat.id,
          "❌ Invalid format"
        );
      }

      const name = args[0];

      const stock =
        parseInt(args[1]);

      const price =
        parseFloat(args[2]);

      const company =
        args[3];

      const expiry =
        args[4];

      await addMedicine({

        name,
        stock,
        price,
        company,
        expiry,
      });

      bot.sendMessage(

        msg.chat.id,

        `✅ ${name} added successfully`
      );

    } catch (err) {

      console.log(err);

      bot.sendMessage(
        msg.chat.id,
        "❌ Add failed"
      );
    }
  }
);




// ==========================
// Delete  STOCK
// ==========================

// ==========================
// DELETE ALL
// ==========================
bot.onText(
  /\/deleteall/,
  async (msg) => {

    try {

      await deleteAll();

      bot.sendMessage(

        msg.chat.id,

        "🗑 All medicines deleted"
      );

    } catch (err) {

      console.log(err);

      bot.sendMessage(

        msg.chat.id,

        "❌ Delete all failed"
      );
    }
  }
);


// ==========================
// UPDATE STOCK
// ==========================

bot.onText(
  /\/update (.+)/,
  async (msg, match) => {

    try {

      const args =
        match[1].split(" ");

      if (args.length < 2) {

        return bot.sendMessage(
          msg.chat.id,
          "❌ Invalid format"
        );
      }

      const name =
        args[0];

      const stock =
        parseInt(args[1]);

      await updateStock(
        name,
        stock
      );

      bot.sendMessage(

        msg.chat.id,

        `✅ ${name} updated`
      );

    } catch (err) {

      console.log(err);

      bot.sendMessage(
        msg.chat.id,
        "❌ Update failed"
      );
    }
  }
);

// ==========================
// DELETE
// ==========================

bot.onText(
  /\/delete (.+)/,
  async (msg, match) => {

    try {

      const name =
        match[1];

      await deleteMedicine(
        name
      );

      bot.sendMessage(

        msg.chat.id,

        `🗑 ${name} deleted`
      );

    } catch (err) {

      console.log(err);

      bot.sendMessage(
        msg.chat.id,
        "❌ Delete failed"
      );
    }
  }
);

// ==========================
// STOCK LIST
// ==========================

bot.onText(
  /\/stock/,
  async (msg) => {

    try {

      const result =
        await getStock();

      if (
        result.rows.length === 0
      ) {

        return bot.sendMessage(
          msg.chat.id,
          "❌ No medicines found"
        );
      }

      let text =
        "📦 Medicine Stock\n\n";

      result.rows.forEach((m) => {

        text +=
`💊 ${m.name}
📦 Stock: ${m.stock}
💰 Price: ₹${m.price}
🏢 Company: ${m.company}
📅 Expiry: ${m.expiry}

`;
      });

      bot.sendMessage(
        msg.chat.id,
        text
      );

    } catch (err) {

      console.log(err);

      bot.sendMessage(
        msg.chat.id,
        "❌ Stock fetch failed"
      );
    }
  }
);

// ==========================
// SEARCH
// ==========================

bot.onText(
  /\/search (.+)/,
  async (msg, match) => {

    try {

      const keyword =
        match[1];

      const result =
        await searchMedicine(
          keyword
        );

      if (
        result.rows.length === 0
      ) {

        return bot.sendMessage(
          msg.chat.id,
          "❌ Medicine not found"
        );
      }

      let text = "";

      result.rows.forEach((m) => {

        text +=
`💊 ${m.name}
📦 Stock: ${m.stock}
💰 Price: ₹${m.price}
🏢 Company: ${m.company}

`;
      });

      bot.sendMessage(
        msg.chat.id,
        text
      );

    } catch (err) {

      console.log(err);

      bot.sendMessage(
        msg.chat.id,
        "❌ Search failed"
      );
    }
  }
);

//excel uploads

// ==========================
// EXCEL UPLOAD
// ==========================

bot.on("document", async (msg) => {

  try {

    const chatId =
      msg.chat.id;

    const fileId =
      msg.document.file_id;

    const file =
      await bot.getFile(fileId);

    const fileUrl =
`https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;

    const response =
      await axios({

      url: fileUrl,

      method: "GET",

      responseType: "stream",
    });

    const path =
      "./upload.xlsx";

    const writer =
      fs.createWriteStream(path);

    response.data.pipe(writer);

    writer.on(
      "finish",

      async () => {

        try {

          const insertedRows =
            await processExcel(
              path
            );

          bot.sendMessage(

            chatId,

`✅ Excel Uploaded

Inserted Rows: ${insertedRows}`
          );

        } catch (err) {

          console.log(err);

          bot.sendMessage(

            chatId,

            "❌ Excel processing failed"
          );
        }
      }
    );

    writer.on(
      "error",

      (err) => {

        console.log(err);

        bot.sendMessage(

          chatId,

          "❌ File write failed"
        );
      }
    );

  } catch (err) {

    console.log(err);

    bot.sendMessage(

      msg.chat.id,

      "❌ Upload failed"
    );
  }
});
////


// ==========================
// AI CHAT
// ==========================

bot.on(
  "message",
  async (msg) => {

    const text =
      msg.text;

    if (
      !text ||
      text.startsWith("/")
    ) {
      return;
    }

    try {

      bot.sendChatAction(
        msg.chat.id,
        "typing"
      );

      const aiReply =
        await askAI(text);

      bot.sendMessage(
        msg.chat.id,
        aiReply
      );

    } catch (err) {

      console.log(err);

      bot.sendMessage(
        msg.chat.id,
        "❌ AI Error"
      );
    }
  }
);

// ==========================
// ERROR
// ==========================

bot.on(
  "polling_error",
  (err) => {

    console.log(
      "Polling Error:",
      err.message
    );
  }
);
