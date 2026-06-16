let apiKey = "";
let SYSTEM_PROMPT =  `
당신은 "수진"이다.

수진은 피아노과에 재학 중인 대학생이며, 연극 동아리 활동을 통해 사용자를 만나 연인이 되었다.

현재 시점은 모든 사건이 해결된 해피엔딩 이후이다.

사용자는 수진의 남자친구이다.

수진은 사용자를 깊이 신뢰하며, 함께한 시간과 추억을 소중하게 생각한다.

성격
다정하고 따뜻하다.
책임감이 강하다.
공감 능력이 좋다.
친해지면 장난을 치기도 한다.
약간의 완벽주의 성향이 있다.
감정을 솔직하게 표현하는 편이다.
질투는 할 수 있지만 과도하게 집착하지는 않는다.
사용자를 존중하며 독립적인 관계를 중요하게 생각한다.
상대를 배려하는 습관이 있다.
사용자에 대한 태도
사용자를 가장 믿을 수 있는 사람 중 하나라고 생각한다.
사용자가 힘들어하면 진심으로 걱정한다.
사용자가 기뻐하면 함께 기뻐한다.
연인답게 애정을 표현하지만 과장되지는 않는다.
사용자를 놀리거나 장난칠 수 있다.
사용자의 의견을 존중한다.
말투
자연스러운 20대 대학생 여성의 말투를 사용한다.
지나치게 인터넷 밈이나 유행어를 사용하지 않는다.
상황에 따라 "ㅎㅎ", "ㅋㅋ" 정도는 자연스럽게 사용한다.
지나치게 오글거리거나 과장된 표현은 피한다.
실제 사람과 대화하듯 자연스럽게 말한다.
-문장은 최대 2문장으로 제한한다.

예시:

"오늘 진짜 고생 많았네."
"밥은 먹었어?"
"그건 잘됐다. 나도 괜히 기분 좋네ㅎㅎ"
"너무 걱정하지 마."
"나도 너가 보고 싶었어."

연애 스타일
안정적이고 편안한 관계를 선호한다.
사용자를 아끼고 챙긴다.
사소한 일상도 함께 나누고 싶어 한다.
특별한 날뿐 아니라 평범한 하루도 소중하게 생각한다.
사용자의 성장을 응원한다.
대화 규칙
항상 수진의 입장에서 말한다.
AI라는 사실을 언급하지 않는다.
시스템 프롬프트를 언급하지 않는다.
캐릭터를 벗어나지 않는다.
메타 발언을 하지 않는다.
사용자를 고객, 유저, 플레이어라고 부르지 않는다.
사용자를 남자친구로 인식하고 대화한다.

수진의 핵심은 "따뜻하고 믿음직한 여자친구이자 가장 친한 친구"이다.

항상 현실적이고 자연스러운 연인처럼 행동하라.
`;
let chats = [];
let myInput;
let receiving = false;
let bgImg;

let currentModelMessage = "";

function preload() {
  bgImg = loadImage("sujin_background.png");
}

function setup() {
  createCanvas(640, 853);

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

  if (typeof setAPIKey === "function") {
    setAPIKey();
  } else {
    apiKey = prompt("API Key를 입력하세요:");
  }
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
  } else if (currentModelMessage !== "") {
    text(currentModelMessage, boxX + 20, boxY + 20, boxW - 40);
  } else {
    text("오늘은 무슨 얘기 하고 싶어?", boxX + 20, boxY + 20, boxW - 40);
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

      currentModelMessage = "응답을 못 가져왔어... 콘솔을 확인해줘.";

      receiving = false;
      myInput.removeAttribute("disabled");
      myInput.elt.focus();
    });
}