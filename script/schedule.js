import { view, map } from '../index.js';
import { getCourtLocation } from './const.js';

function getFeature(stadiumName) {
  let layer = map.findLayerById("bBallLayer");
  let query = layer.createQuery();
  query.where = `name = '${stadiumName}'`;

  layer.queryFeatures(query).then((result) => {
    if (result.features.length > 0) {
      const feature = result.features[0];

      if (feature.geometry.latitude.toFixed(5) == view.center.latitude.toFixed(5) && feature.geometry.longitude.toFixed(5) == view.center.longitude.toFixed(5)) {
        // 在視圖中顯示 Popup
        return view.popup.open({
          location: feature.geometry,  // location of the click on the view
          fetchFeatures: true // display the content for the selected feature if a popupTemplate is defined.
        });
      }

      // 將視圖定位到該圖徵
      view.goTo({
        target: feature.geometry,
        zoom: 15
      }, { duration: 2500, easing: "ease-out" }).then(() => {

        // 取得圖徵屬性中包含的 PopupTemplate 內容
        let content = feature.sourceLayer.popupTemplate.content;

        // 在視圖中顯示 Popup
        view.popup.open({
          location: feature.geometry,  // location of the click on the view
          fetchFeatures: true // display the content for the selected feature if a popupTemplate is defined.
        });
      });
    } else {
      console.log("地點未定!")
    }
  });
}

async function getT1Schedule() {
  return new Promise((res, err) => {
    const T1Schedule = [];
    fetch("https://api.t1league.basketball/season/2/matches").then(res => res.json()).then(data => {
      // console.log(data);

      const newGame = data.data.filter(match => match.status != 3);

      newGame.forEach(game => {
        // 取得日期、時間、季後賽賽事編號、主客隊名稱、地點等資訊
        const date = new Date(game.playDate).toLocaleDateString();
        const time = game.playTime;
        const gameNumber = game.serial;
        const gameType = game.stage.name;
        const homeTeam = game.teamHome.name;
        const guestTeam = game.teamGuest.name;
        const location = game.location;

        // 建立 HTML 元素
        const gameElement = document.createElement('div');
        const dateElement = document.createElement('div');
        const gameNumberElement = document.createElement('div');
        const teamElement = document.createElement('div');
        const locationElement = document.createElement('div');
        const mayNotPlayElement = document.createElement('div');

        // 設定 HTML 元素內容
        dateElement.textContent = date ? `${date} ${time}` : "時間未定";
        gameNumberElement.textContent = `${gameType} Game ${gameNumber}`;
        teamElement.textContent = game.preArrangeGame ? `${game.preArrangeTeamHomeName} vs ${game.preArrangeTeamGuestName}` : `${homeTeam} vs ${guestTeam}`;
        locationElement.textContent = location ? `at ${location}` : "地點未定";
        mayNotPlayElement.textContent = game.mayNotPlay ? "可能不打" : "";

        // 加入 CSS class
        gameElement.classList.add('game', "t1-bg");
        dateElement.classList.add('date');
        gameNumberElement.classList.add('game-id');
        teamElement.classList.add('team');
        locationElement.classList.add('location');
        mayNotPlayElement.classList.add('may-not-play');

        // 設定跟 overlay 有關的東西
        (() => {
          const overlayElement =
            `<div class="overlay">
              <div class="row">
                <div class="col-6 map-col" href="#">
                  <div>
                    <i class="fa-regular fa-map fa-2xl"></i>
                    <p>地圖查看</p>
                  </div>
                </div>` +
            (game.meta ? `<div class="col-6 buy-col">
                  <div>
                    <i class="fa-brands fa-youtube fa-2xl"></i>
                    <p>觀看直播</p>
                  </div>
                </div>` : `<div class="col-6 buy-col">
                  <div>
                    <i class="fa-regular fa-credit-card fa-2xl"></i>
                    <p>線上購票</p>
                  </div>
                </div>`) +
            `</div>
            </div>`;

          gameElement.innerHTML = overlayElement;

          // 在滑鼠移入時顯示浮現的 div
          gameElement.addEventListener("mouseenter", function () {
            const overlay = gameElement.querySelector(".overlay");
            overlay.style.display = "block";
          });

          // 在滑鼠移出時隱藏浮現的 div
          gameElement.addEventListener("mouseleave", function () {
            const overlay = gameElement.querySelector(".overlay");
            overlay.style.display = "none";
          });

          // 在手機裝置上點擊時顯示或隱藏浮現的 div
          document.addEventListener("touchend", function (event) {
            // 檢查被點擊的元素是否為 gameDiv 或其子元素
            if (event.target.closest('.game')) {
              // 顯示 overlayDiv
              event.target.closest('.game').querySelector(".overlay").style.display = "block";
            } else {
              // 隱藏 overlayDiv
              gameElement.querySelector(".overlay").style.display = 'none';
            }
          });

          // 左邊地圖點擊事件
          gameElement.querySelector(".map-col").onclick = (ele, ele2) => {
            getFeature(location);
          }

          // 右邊立即購票點集事件
          gameElement.querySelector(".buy-col").onclick = () => {
            game.meta ?
              window.open(game.meta.live_stream_url, "_blank") :
              window.open("https://www.famiticket.com.tw/Home/Activity/Search/S01/002", "_blank");
          }
        })();

        // 將 HTML 元素加入到 schedule div 裡
        gameElement.appendChild(dateElement);
        gameElement.appendChild(mayNotPlayElement);
        gameElement.appendChild(gameNumberElement);
        gameElement.appendChild(teamElement);
        gameElement.appendChild(locationElement);
        // scheduleDiv.appendChild(gameElement);

        T1Schedule.push([game.playDate, time, gameElement])
      });
      res(T1Schedule);
    });
  });
};

async function getSBLSchedule() {
  return new Promise((reslove, reject) => {
    const schedule = [];
    fetch("https://script.google.com/macros/s/AKfycbxttTNTW6f2P4kdQPh6ZfoM-x7HUd3VFG9mvg5U0W0JekEq4kYaihiV4xvnMS1oq0UDyA/exec").then(res => res.json()).then(data => {
      // console.log(data);

      const newGame = data.filter(match => match.status != 3);

      newGame.forEach(game => {
        // 取得日期、時間、季後賽賽事編號、主客隊名稱、地點等資訊
        const date = new Date(game.playDate).toLocaleDateString();
        const time = game.playTime;
        const session = game.stage.season.name;
        const gameType = game.stage.name;
        const homeTeam = game.teamHome.name;
        const guestTeam = game.teamGuest.name;
        const location = game.location;

        // 建立 HTML 元素
        const gameElement = document.createElement('div');
        const dateElement = document.createElement('div');
        const gameNumberElement = document.createElement('div');
        const teamElement = document.createElement('div');
        const locationElement = document.createElement('div');

        // 設定 HTML 元素內容
        dateElement.textContent = date ? `${date} ${time}` : "時間未定";
        gameNumberElement.textContent = `${session} ${gameType}`;
        teamElement.textContent = `${homeTeam} vs ${guestTeam}`;
        locationElement.textContent = location ? `at ${location}` : "地點未定";

        // 加入 CSS class
        gameElement.classList.add('game', game.season.league.name == "SBL" ? "sbl-bg" : "wsbl-bg");
        dateElement.classList.add('date');
        gameNumberElement.classList.add('game-id');
        teamElement.classList.add('team');
        locationElement.classList.add('location');

        // 設定跟 overlay 有關的東西
        (() => {
          const overlayElement =
            `<div class="overlay">
          <div class="row">
            <div class="col-6 map-col" href="#">
              <div>
                <i class="fa-regular fa-map fa-2xl"></i>
                <p>地圖查看</p>
              </div>
            </div>` +
            (game.meta ? `<div class="col-6 buy-col">
              <div>
                <i class="fa-brands fa-youtube fa-2xl"></i>
                <p>觀看直播</p>
              </div>
            </div>` : `<div class="col-6 buy-col">
              <div>
                <i class="fa-regular fa-credit-card fa-2xl"></i>
                <p>線上購票</p>
              </div>
            </div>`) +
            `</div>
        </div>`;

          gameElement.innerHTML = overlayElement;

          // 在滑鼠移入時顯示浮現的 div
          gameElement.addEventListener("mouseenter", function () {
            const overlay = gameElement.querySelector(".overlay");
            overlay.style.display = "block";
          });

          // 在滑鼠移出時隱藏浮現的 div
          gameElement.addEventListener("mouseleave", function () {
            const overlay = gameElement.querySelector(".overlay");
            overlay.style.display = "none";
          });

          // 在手機裝置上點擊時顯示或隱藏浮現的 div
          document.addEventListener("touchend", function (event) {
            // 檢查被點擊的元素是否為 gameDiv 或其子元素
            if (event.target.closest('.game')) {
              // 顯示 overlayDiv
              event.target.closest('.game').querySelector(".overlay").style.display = "block";
            } else {
              // 隱藏 overlayDiv
              gameElement.querySelector(".overlay").style.display = 'none';
            }
          });

          // 左邊地圖點擊事件
          gameElement.querySelector(".map-col").onclick = (ele, ele2) => {
            getFeature(location);
          }

          // 右邊立即購票點集事件
          gameElement.querySelector(".buy-col").onclick = () => {
            game.meta ?
              window.open(game.meta.live_stream_url, "_blank") :
              window.open("https://ticket.com.tw/application/UTK02/UTK0201_.aspx?PRODUCT_ID=P01J34HA", "_blank");
          }
        })();

        // 將 HTML 元素加入到 schedule div 裡
        gameElement.appendChild(dateElement);
        gameElement.appendChild(gameNumberElement);
        gameElement.appendChild(teamElement);
        gameElement.appendChild(locationElement);
        // scheduleDiv.appendChild(gameElement);

        schedule.push([game.playDate, time, gameElement])
      });
      reslove(schedule);
    });
  });
};

async function setSchedule() {
  const scheduleDiv = document.querySelector('.schedule');
  let schedule = await getT1Schedule();
  schedule = schedule.concat(await getSBLSchedule());
  schedule.sort();
  schedule.forEach(ele => {
    scheduleDiv.appendChild(ele[2]);
  });

  scheduleDiv.addEventListener('wheel', event => {
    event.preventDefault();
    scheduleDiv.scrollLeft += event.deltaY / 2;
  });
};

window.onload = async function () {
  await setSchedule();

  const scheduleToggle = document.createElement("div");

  scheduleToggle.classList.add("esri-component", "esri-home", "esri-widget--button", "esri-widget", "schedule-toggle")
  scheduleToggle.setAttribute("title", "賽程選單");

  scheduleToggle.innerHTML = '<div class="toggle-point"></div><div class="schedule-toggle-btn"></div>'

  const scheduleChoiseList = document.createElement("div");
  scheduleChoiseList.classList.add("schedule-toggle-list");
  scheduleChoiseList.innerHTML = `
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="t1LeagueToggle" checked onchange='checkScheduleToggle()'>
    <label class="form-check-label" for="t1LeagueToggle">
      T1 聯盟
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="sblToggle" checked onchange='checkScheduleToggle()'>
    <label class="form-check-label" for="sblToggle">
      SBL
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="wsblToggle" checked onchange='checkScheduleToggle()'>
    <label class="form-check-label" for="wsblToggle">
      WSBL
    </label>
  </div>
  `;
  scheduleToggle.appendChild(scheduleChoiseList);

  scheduleToggle.querySelector('.toggle-point').onclick = function () {
    // const scheduleDivList = document.querySelectorAll(".t1-bg");
    // scheduleDivList.forEach(ele => ele.style.display = ele.style.display === "none" ? "inline-block" : "none");

    if (scheduleToggle.classList.contains("active") === true) {
      scheduleToggle.classList.add("close");
      scheduleToggle.classList.remove("active");
    } else {
      scheduleToggle.classList.add("active");
      scheduleToggle.classList.remove("close");
    }
  };

  document.querySelector(".esri-ui-top-left").appendChild(scheduleToggle);

  // 移除載入中提示
  document.querySelector(".loading").remove();
};

window.checkScheduleToggle = function checkScheduleToggle() {
  console.log("asdf");
  document.querySelectorAll(".t1-bg").forEach(ele => ele.style.display = document.getElementById('t1LeagueToggle').checked ? "inline-block" : "none");
  document.querySelectorAll(".sbl-bg").forEach(ele => ele.style.display = document.getElementById('sblToggle').checked ? "inline-block" : "none");
  document.querySelectorAll(".wsbl-bg").forEach(ele => ele.style.display = document.getElementById('wsblToggle').checked ? "inline-block" : "none");
}
