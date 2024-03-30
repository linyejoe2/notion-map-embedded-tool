let view, map;

require([
  "esri/Map",
  "esri/views/MapView",
  "esri/Graphic",
  "esri/layers/GraphicsLayer",
  "esri/layers/FeatureLayer",
  "esri/widgets/BasemapToggle",
  "esri/widgets/Popup",
  "esri/widgets/Home",
  "esri/widgets/Locate",
  "esri/widgets/LayerList",
  "esri/widgets/Search"
], function (Map, MapView, Graphic, GraphicsLayer, FeatureLayer, BasemapToggle, Popup, Home, Locate, LayerList, Search) {

  // 建立地圖
  map = new Map({
    basemap: "gray-vector"
    // basemap: "dark-gray-vector", // 全黑，風格不錯
    // basemap: "oceans", // 土地是白的，方便看清楚其他資訊
  });

  // 建立地圖視圖
  view = new MapView({
    container: "viewDiv",
    map: map,
    center: [139.77521, 35.68788],
    // center: [139.7452043, 35.6870601],
    // 35.68788740765644, 139.77521531613738
    zoom: 12,
    popup: {
      dockEnabled: true,
      collapseEnabled: false,
      maxInlineActions: null,
      dockOptions: {
        buttonEnabled: false,
        breakpoint: false,
        // breakpoint: {
        //   width: 600,
        //   height: 400
        // }
      }
    }
  });

  // 建立底圖切換器
  view.ui.add(new BasemapToggle({
    view: view,
    nextBasemap: "osm", // 切換後的底圖
    container: document.createElement("div")
  }), "bottom-left");

  // 建立回初始畫面工具
  view.ui.add(new Home({
    view: view,
    // 讓回初始畫面的動畫更司滑
    goToOverride: function (view, goToParams) {
      goToParams.options.duration = 1000;
      return view.goTo(goToParams.target, goToParams.options);
    }
  }), "top-left");

  // 建立 featureLayer 來顯示籃球場點位
  const featureLayer = new FeatureLayer({
    id: "bBallLayer",
    fields: [{ name: "ObjectID", alias: "ObjectID", type: "oid" },
    { name: "name", alias: "名稱", type: "string" },
    { name: "address", alias: "位置", type: "string" },
    { name: "team", alias: "備註", type: "string" },
    { name: "league", alias: "價格", type: "string" },
    // { name: "rentState", alias: "是否對外開放", type: "string" },
    // { name: "rentMemo", alias: "租借規則", type: "string" },
    { name: "rentUrl", alias: "網站", type: "string" },
    { name: "color", alias: "標誌顏色", type: "string" },
    // { name: "tel", alias: "聯絡該場館", type: "string" },
    { name: "time", alias: "營業時間", type: "string" },
    { name: "photo1", alias: "照片", type: "string" },
    { name: "type", alias: "類型", type: "string" },
    { name: "area", alias: "地區", type: "string" },
    { name: "reserve", alias: "提前預約", type: "string" },
    ],
    objectIdField: "ObjectID",
    geometryType: "point",
    spatialReference: {
      wkid: 4326
    },
    source: [], // 空的圖層
    renderer: {
      type: "unique-value",
      field: "color",
      orderByClassesEnabled: true,
      defaultSymbol: {
        // type: "picture-marker",
        // url: "img/basketball.png",
        // width: "15px",
        // height: "15px"
        type: "simple-marker",
        style: "circle",
        color: "#32B3EB",
        // color: "red",
        outline: {
          color: "#65D0FE",
          width: "1px"
        },
        size: "16px"
      },
      // uniqueValueInfos: [
      //   {
      //     value: "T1 聯盟",
      //     symbol: {
      //       type: "picture-marker",
      //       url: "img/team/t1league.svg",
      //       width: "50px",
      //       height: "50px"
      //     }
      //   },
      //   {
      //     value: "P. LEAGUE+",
      //     symbol: {
      //       type: "picture-marker",
      //       url: "img/team/pleague.png",
      //       width: "50px",
      //       height: "50px"
      //     }
      //   },
      // ]
    },
    // featureReduction: {
    //   type: "cluster"
    // },
    popupTemplate: {
      title: "{name}",
      collapseEnablejd: false,
      content: [
        {
          type: "media",
          mediaInfos: [
            {
              type: "image",
              value: {
                sourceURL: "{photo1}",
                linkURL: "{rentUrl}",
              },
            },
          ],
          visible: "{photo1}" !== ""
        },
        {
          type: "fields",
          fieldInfos: [
            { fieldName: "type", label: "類型", visible: "{type}" !== "" },
            { fieldName: "area", label: "地區", visible: "{area}" !== ""},
            // { fieldName: "team", label: "備註", visible: "{team}" !== "", stringFieldOption: "rich-text" },
            { fieldName: "league", label: "價格", visible: "{league}" !== "" },
            { fieldName: "time", label: "營業時間", visible: "{time}" !== "" },
            { fieldName: "reserve", label: "提前預約", visible: "{reserve}" !== "" },
            // { fieldName: "rentState", label: "是否對外開放", visible: "{rentState}" !== "" },
            // { fieldName: "rentMemo", label: "租借規則", },
            { fieldName: "rentUrl", label: "網站", visible: "{rentUrl}" !== "", stringFieldOption: "rich-text" },
            { fieldName: "address", label: "位置", visible: "{address}" !== "" },
            // { fieldName: "tel", label: "聯絡該場館", visible: "{tel}" !== "" },
          ],
        },
        {
          type: "text",
          text: 
          // <span class="tag">
          // 🏷️ 標籤：<span>重要</span>
          // </span><br/>
          `
          {team}
          `
        },
      ],
    },
  });
  map.add(featureLayer);

  // 呼叫 api 取得籃球場資料，並將資料轉成 Graphics 顯示在地圖上
  fetch("https://8jjh8a2jl8.execute-api.ap-northeast-2.amazonaws.com/proxy?url=https://api.notion.com/v1/databases/6d069d2e6b9a4c5aab18fc6d1af366fa/query", {
    // fetch("http://localhost:3000/proxy?url=https://api.notion.com/v1/databases/6d069d2e6b9a4c5aab18fc6d1af366fa/query", {
    method: "POST",
    headers: {
      authorization: "Bearer secret_o0cLkvqHibN73ywmEdkHaNMfbmiMd0HvYuSwn9UzrWH",
      "notion-version": "2022-06-28",
      "content-type": "application/json",
    },
  })
    .then(response => response.json())
    .then(data => {
      let graphArr = [];
      data.results.forEach(async function (feature) {
        let gAttributes = {
          "name": feature.properties["名稱"].title[0]?.text.content,
          "address": feature.properties["位置"].rich_text[0]?.text.content,
          "team": feature.properties["備註"].rich_text?.map(text => {
            if (isURL(text.text.content)) {
              return `<a target="_blank" href="${text.text.content}" rel="noreferrer">${text.text.content}</a>`;
            } else {
              return text.text.content;
            }
          }).join("<br>"),
          "league": feature.properties["價格"].rich_text?.map(text => text.text.content).join("<br>"),
          // "rentState": feature.properties["地區"].rich_text[0].text.content,
          // "tel": feature.properties["提前預約"].rich_text[0].text.content,
          "time": feature.properties["營業時間"].rich_text?.map(text => text.text.content).join("<br>"),
          "color": feature.properties["類型"].select.color,
          "type": feature.properties["類型"].select.name,
          "area": feature.properties["地區"].multi_select?.map(text => text.name).join(", "),
          "reserve": feature.properties["提前預約"].multi_select?.map(text => text.name).join(", "),
          // "rentMemo": feature.properties["類型"].rich_text[0].text.content,
          "rentUrl": feature.properties["網站"].url,
          "photo1": feature.properties["照片"].url
        }

        // if coordinates not define, update it from address lebel
        if ((feature.properties.Latitude.rich_text.length == 0 ||
          feature.properties.Longitude.rich_text.length == 0) &&
          feature.properties["位置"].rich_text[0]?.text.content) {
          let temp = await fetch("https://8jjh8a2jl8.execute-api.ap-northeast-2.amazonaws.com/proxy?url=https://positionstack.com/geo_api.php?query=" + feature.properties["位置"].rich_text[0]?.text.content, {
            method: "POST",
          })
          let coordinateData = (await temp.json()).data
          // fetch("https://8jjh8a2jl8.execute-api.ap-northeast-2.amazonaws.com/proxy/notion/database/update", {
          //   method: "POST",
          //   data:{
          //     "properties": {

          //     }
          //   },
          // }).then(response => response.json())
          //   .then(data => {
          //     if (data.length > 1) {
          //       graphArr.push(data[0].latitude);
          //       graphArr.push(data[0].longitude);
          //     }

          //   })
          var graphic = new Graphic({
            geometry: {
              type: "point",
              latitude: coordinateData.length > 0 ? coordinateData[0].latitude : 0,
              longitude: coordinateData.length > 0 ? coordinateData[0].longitude : 0
            },
            attributes: gAttributes
            // 位置.rich_text[0].text.content
          });
          featureLayer.applyEdits({
            addFeatures: [graphic]
          })
        }
        else {
          var graphic = new Graphic({
            geometry: {
              type: "point",
              latitude: feature.properties.Latitude.rich_text.length > 0 ?
                feature.properties.Latitude.rich_text[0].text.content : 0,
              longitude: feature.properties.Longitude.rich_text.length > 0 ?
                feature.properties.Longitude.rich_text[0].text.content : 0
            },
            attributes: gAttributes,
            // 位置.rich_text[0].text.content
          });
          graphArr.push(graphic);
        }

        if (feature.properties["類型"]?.select?.color) {
          featureLayer.renderer.addUniqueValueInfo({
            value: feature.properties["類型"]?.select?.color,
            symbol: {
              type: "simple-marker",
              style: "circle",
              color: feature.properties["類型"]?.select?.color,
              outline: {
                color: "#65D0FE",
                width: "1px"
              },
              size: "16px"
            }
          })
        }
      });
      featureLayer.applyEdits({
        addFeatures: graphArr
      });
    });

  // 創建一個 Search widget
  const searchWidget = new Search({
    view: view,
    allPlaceholder: "搜尋名稱",
    includeDefaultSources: false,
    sources: [{
      layer: featureLayer,
      placeholder: "搜尋名稱",
      maxResults: 5,
      searchFields: ["name"],
      displayField: "name",
      name: "搜尋名稱",
      // filter: searchExtent
    }],
    locationEnabled: false
  });
  view.ui.add(searchWidget, {
    position: "top-right",
    index: 2
  });

  searchWidget.on("select-result", (event) => {
    console.log(event)
    view.goTo({
      target: event.result.feature,
      zoom: 20
    }, { duration: 2000 });
  })

  // 監聽點擊事件，彈出 Popup 顯示籃球場資訊
  view.on("click", function (event) {
    view.hitTest(event).then(function (response) {
      var graphic = response.results[0].graphic;
      if (graphic.layer === featureLayer) {
        view.goTo({
          target: graphic,
          zoom: 15
        }, { duration: 2000 });
      }
    });
  });

  // // 定位使用者位置
  // view.ui.add(new Locate({
  //   view: view,   // Attaches the Locate button to the view
  //   graphic: new Graphic({
  //     // symbol: { type: "simple-marker" }  
  //     symbol: {
  //       type: "simple-marker",
  //       style: "circle",
  //       color: [36, 153, 222, 0.7],
  //       size: "30px",
  //       outline: {
  //         color: "#BAD8E4",
  //         width: "20px"
  //       }
  //     }
  //     // graphic placed at the location of the user when found
  //   }),
  //   goToOverride: function (view, goToParams) {
  //     goToParams.options.duration = 2000;
  //     return view.goTo(goToParams.target, goToParams.options);
  //   }
  // }), { position: "top-left", index: 1 });

});

function isURL(str) {
  // 簡單的 URL 正則表達式，可以擴展以滿足更多情況
  const pattern = /^(?:https?:\/\/)?(?:www\.)?([\w-]+\.[\w-]+)/;
  return pattern.test(str);
}

export { view, map };