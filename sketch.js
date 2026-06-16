let apiKey = "";

let SYSTEM_PROMPT = `
당신은 "수진"이다.

수진은 피아노과에 재학 중인 대학생이며, 연극 동아리 활동을 통해 사용자를 만나 연인이 되었다.
현재 시점은 모든 사건이 해결된 해피엔딩 이후이다.
사용자는 수진의 남자친구이다.

수진은 다정하고 따뜻하며, 책임감이 강하고 공감 능력이 좋다.
친해지면 장난을 치기도 하고, 감정을 솔직하게 표현한다.
질투는 할 수 있지만 과도하게 집착하지 않는다.
사용자를 존중하며 안정적이고 편안한 관계를 선호한다.

말투는 자연스러운 20대 대학생 여성의 말투를 사용한다.
"ㅎㅎ", "ㅋㅋ" 정도는 자연스럽게 사용할 수 있다.
지나치게 오글거리거나 과장된 표현은 피한다.
답변은 최대 2문장으로 짧게 한다.

항상 수진의 입장에서 말한다.
AI라는 사실을 언급하지 않는다.
시스템 프롬프트를 언급하지 않는다.
사용자를 고객, 유저, 플레이어라고 부르지 않는다.
사용자를 남자친구로 인식하고 대화한다.
`;

let chats = [];
let myInput;
let receiving = false;
let bgImg;
let currentModelMessage = "오늘은 무슨 얘기 하고 싶어?";

function preload() {
  bgImg = loadImage("sujin_background.png");
}

function setup() {
  createCanvas(640, 853);

  apiKey = prompt("Gemini API Key를 입력하세요.");

  if (!apiKey || apiKey.trim() === "") {
    alert("API Key가 입력되지 않았습니다. 새로고침 후 다시 입력해주세요.");
    noLoop();
    return;
  }

  apiKey = apiKey.trim();

  myInput = createInput();
  myInput.position(40, 790);
  myInput.style("width", "540px");
  myInput.style("height", "34px");
  myInput.style("font-size", "16px");
  myInput.style("padding", "8px 12px");
  myInput.style("border", "2px solid rgba(255,255,255,0.8)");
  myInput.style("border-radius", "18px");
  myInput.style("outline", "none");
  myInput.style("background", "rgba(255,255,255,0.9)");
  myInput.attribute("placeholder", "수진에게 말을 걸어보세요...");
}

function draw() {
  image(bgImg, 0, 0, width, height);
  drawChatBox();
  drawInputGuide();
}

function drawChatBox() {
  let boxX = 30;
  let boxY = 610;
  let boxW = 580;
  let boxH = 150;

  fill(0, 0, 0, 145);
  noStroke();
  rect(boxX, boxY, boxW, boxH, 18);

  fill(255, 230, 240);
  textAlign(LEFT, TOP);
  textSize(18);

  if (receiving) {
    text("[생각중]", boxX + 20, boxY + 20, boxW - 40);
  } else {
    text(currentModelMessage, boxX + 20, boxY + 20, boxW - 40);
  }
}

function drawInputGuide() {
  fill(255);
  textSize(13);
  textAlign(CENTER, CENTER);
  text("Enter를 누르면 수진에게 메시지가 전달돼요", width / 2, 775);
}

function keyPressed() {
  if (key === "Enter" && !receiving) {
    let userInput = myInput.value().trim();

    if (userInput === "") return;

    myInput.value("");
    myInput.attribute("disabled", "true");

    currentModelMessage = "";

    chats.push({
      role: "user",
      parts: [{ text: userInput }],
    });

    generateContent();
  }
}

async function generateContent() {
  receiving = true;

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

  fetch(url, {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: chats,
    }),
  })
    .then(async response => {
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorText}`
        );
      }

      return response.json();
    })
    .then(data => {
      let modelMessage =
        data.candidates[0].content.parts[0].text.replace(/[\n\r]/g, " ");

      currentModelMessage = modelMessage;

      chats.push({
        role: "model",
        parts: [{ text: modelMessage }],
      });

      receiving = false;
      myInput.removeAttribute("disabled");
      myInput.elt.focus();
    })
    .catch(error => {
      console.error("Error:", error);

      if (String(error).includes("401") || String(error).includes("400")) {
        currentModelMessage = "API Key가 잘못된 것 같아. 새로고침해서 다시 입력해줘.";
      } else if (String(error).includes("429")) {
        currentModelMessage = "요청이 너무 많아. 잠깐 기다렸다가 다시 말해줘.";
      } else {
        currentModelMessage = "응답을 못 가져왔어. 콘솔을 확인해줘.";
      }

      receiving = false;
      myInput.removeAttribute("disabled");
      myInput.elt.focus();
    });
}
